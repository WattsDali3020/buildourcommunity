// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @notice Optional residency oracle. No KYC provider is integrated.
 *         When unset, WHITELIST_ADMIN attestation is the stub.
 *         0 = verified county resident, 1 = other in-state, 2 = other US,
 *         3 = unverified or non-US.
 */
interface IResidencyVerifier {
    function residencyTier(address account, uint256 propertyId) external view returns (uint8);
}

/**
 * @title RevitaHub Property Token
 * @notice ERC-1155 token for a community project.
 * @dev Sale stages (owner, Nov 5–9, 2026):
 *      - No reserved supply buckets. Each stage sells only the unsold remainder.
 *      - Days 0–90: verified residents of the project's county.
 *      - Days 91–180: statewide (county residents remain eligible).
 *      - After day 180: nationwide. There is no international sale stage.
 *      - One per-person allowance, chosen by the admin. It is not hard-coded.
 *      Vote weight is residency of the holder, not purchase stage:
 *      1.5 county, 1.0 other in-state, 0.75 other US. Outside holders vote.
 *      There is no resident-majority guarantee and no outside-vote cap.
 *      One 365-day funding clock starts when residents' project choice is recorded.
 *      Shares stay locked through that clock. Early completion, transfer
 *      exceptions, refunds, and post-period liquidity are TODO hooks.
 */
contract PropertyToken is ERC1155, ERC1155Supply, ERC1155Burnable, AccessControl, Pausable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.UintSet;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant WHITELIST_ADMIN_ROLE = keccak256("WHITELIST_ADMIN_ROLE");
    bytes32 public constant PHASE_ADVANCER_ROLE = keccak256("PHASE_ADVANCER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    enum Phase { County, State, National }

    uint8 public constant TIER_COUNTY = 0;
    uint8 public constant TIER_IN_STATE = 1;
    uint8 public constant TIER_OTHER_US = 2;
    uint8 public constant TIER_UNVERIFIED = 3;

    uint256 public constant COUNTY_STAGE_SECONDS = 90 days;
    uint256 public constant STATE_STAGE_SECONDS = 180 days;
    uint256 public constant FUNDING_PERIOD = 365 days;

    uint256 public constant COUNTY_VOTE_WEIGHT_BPS = 15000;
    uint256 public constant IN_STATE_VOTE_WEIGHT_BPS = 10000;
    uint256 public constant OTHER_US_VOTE_WEIGHT_BPS = 7500;

    struct Property {
        uint256 id;
        string name;
        string uri;
        uint256 totalSupply;
        uint256 mintedSupply;
        uint256 fundingTarget;
        uint256 fundingDeadline;
        Phase currentPhase;
        bool isActive;
        bool isFunded;
        string llcIdentifier;
        address custodian;
        uint256 fundingClockStart;
    }

    /// @dev Initial price is an admin parameter. The owner's stated intent is
    ///      12.50 USD; this wei placeholder is not a user-facing quote.
    uint256 public basePrice = 12.5 ether / 1000;

    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;

    mapping(uint256 => mapping(Phase => uint256)) public soldInStage;
    mapping(uint256 => mapping(uint8 => mapping(address => uint256))) public purchasedInStage;
    mapping(uint256 => uint256) public perPersonAllowance;

    mapping(address => bool) public whitelist;
    /// @dev Global attested tier used only when no IResidencyVerifier is set.
    mapping(address => uint8) public residencyTier;
    mapping(address => bool) public residencyVerified;

    IResidencyVerifier public residencyVerifier;

    mapping(uint256 => mapping(address => mapping(Phase => uint256))) public holdingsByPhase;
    mapping(uint256 => uint256) public totalWeightedVotingPower;
    mapping(address => EnumerableSet.UintSet) private _holderProperties;

    EnumerableSet.UintSet private _allPropertyIds;

    /// @notice TODO(owner): transfer exceptions are undecided. Default off.
    ///         Enabling the flag does not unlock transfers.
    bool public transferExceptionsEnabled;
    /// @notice TODO(owner): post-period liquidity is undecided. Default off.
    ///         Enabling the flag does not unlock transfers.
    bool public postPeriodTransfersEnabled;

    event PropertyCreated(uint256 indexed propertyId, string name, uint256 totalSupply, uint256 fundingTarget, string llcIdentifier, address custodian);
    event FundingClockStarted(uint256 indexed propertyId, uint256 start, uint256 deadline);
    event PerPersonAllowanceSet(uint256 indexed propertyId, uint256 allowance);
    event PropertyFunded(uint256 indexed propertyId, uint256 totalRaised);
    event LLCBackingUpdated(uint256 indexed propertyId, string llcIdentifier, address custodian);
    event TokensMinted(uint256 indexed propertyId, address indexed buyer, uint256 amount, Phase phase);
    event AddressWhitelisted(address indexed account, uint8 tier);
    event AddressRemovedFromWhitelist(address indexed account);
    event ResidencyUpdated(address indexed account, uint8 tier, bool verified);
    event ResidencyVerifierUpdated(address indexed verifier);
    event BasePriceUpdated(uint256 newPrice);
    event TokensBurned(uint256 indexed propertyId, address indexed from, uint256 amount, Phase phase);
    event TransferPolicyHookSet(string hook, bool enabled);

    event KYCVerificationCompleted(address indexed account, uint256 timestamp, bytes32 verificationId);
    event KYCVerificationRevoked(address indexed account, uint256 timestamp, string reason);
    event AMLCheckPassed(address indexed account, uint256 timestamp, bytes32 checkId);
    event AMLCheckFailed(address indexed account, uint256 timestamp, string reason);
    event ComplianceCheckpoint(uint256 indexed propertyId, uint256 timestamp, uint256 totalHolders, uint256 totalSupplyMinted);
    event TransferRestricted(uint256 indexed propertyId, address indexed from, address indexed to, string reason);
    event RegulatorAuditRequested(uint256 indexed propertyId, address indexed requestor, uint256 timestamp);

    mapping(address => bytes32) public kycVerificationIds;
    mapping(address => uint256) public kycVerificationTimestamps;
    mapping(address => bytes32) public amlCheckIds;

    constructor(string memory uri_) ERC1155(uri_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(WHITELIST_ADMIN_ROLE, msg.sender);
        _grantRole(PHASE_ADVANCER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    function burnFromOnFailure(
        uint256 propertyId,
        address holder,
        uint256 amount
    ) external onlyRole(BURNER_ROLE) {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(holder, propertyId) >= amount, "Insufficient balance");
        _burn(holder, propertyId, amount);
    }

    /**
     * @notice Create a property. The 365-day clock does not start here.
     *         Call startFundingClock when residents decide which project is built.
     */
    function createProperty(
        string memory name,
        string memory propertyUri,
        uint256 totalSupply,
        uint256 fundingTarget,
        string memory llcId,
        address custodian
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(custodian != address(0), "Custodian required for LLC backing");
        require(bytes(llcId).length > 0, "LLC identifier required");
        require(totalSupply > 0, "Supply required");

        uint256 propertyId = propertyCount++;

        properties[propertyId] = Property({
            id: propertyId,
            name: name,
            uri: propertyUri,
            totalSupply: totalSupply,
            mintedSupply: 0,
            fundingTarget: fundingTarget,
            fundingDeadline: 0,
            currentPhase: Phase.County,
            isActive: true,
            isFunded: false,
            llcIdentifier: llcId,
            custodian: custodian,
            fundingClockStart: 0
        });

        _allPropertyIds.add(propertyId);
        emit PropertyCreated(propertyId, name, totalSupply, fundingTarget, llcId, custodian);
        return propertyId;
    }

    function startFundingClock(uint256 propertyId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Property storage prop = properties[propertyId];
        require(prop.isActive, "Property not active");
        require(prop.fundingClockStart == 0, "Funding clock already started");
        prop.fundingClockStart = block.timestamp;
        prop.fundingDeadline = block.timestamp + FUNDING_PERIOD;
        prop.currentPhase = Phase.County;
        emit FundingClockStarted(propertyId, prop.fundingClockStart, prop.fundingDeadline);
    }

    function setPerPersonAllowance(uint256 propertyId, uint256 allowance) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_allPropertyIds.contains(propertyId), "Property not found");
        require(allowance > 0, "Allowance must be positive");
        perPersonAllowance[propertyId] = allowance;
        emit PerPersonAllowanceSet(propertyId, allowance);
    }

    /// @dev Flat parameter. Stages do not multiply the price.
    function getCurrentPrice(uint256 propertyId) public view returns (uint256) {
        require(properties[propertyId].isActive, "Property not active");
        return basePrice;
    }

    function stageOf(uint256 propertyId) public view returns (Phase) {
        Property storage prop = properties[propertyId];
        require(prop.fundingClockStart != 0, "Funding clock not started");
        uint256 elapsed = block.timestamp - prop.fundingClockStart;
        if (elapsed < COUNTY_STAGE_SECONDS) return Phase.County;
        if (elapsed < STATE_STAGE_SECONDS) return Phase.State;
        return Phase.National;
    }

    function unsoldRemainder(uint256 propertyId) public view returns (uint256) {
        Property storage prop = properties[propertyId];
        return prop.totalSupply - prop.mintedSupply;
    }

    function residencyTierOf(uint256 propertyId, address account) public view returns (uint8) {
        if (address(residencyVerifier) != address(0)) {
            return residencyVerifier.residencyTier(account, propertyId);
        }
        if (!residencyVerified[account]) return TIER_UNVERIFIED;
        return residencyTier[account];
    }

    function voteWeightBps(uint8 tier) public pure returns (uint256) {
        if (tier == TIER_COUNTY) return COUNTY_VOTE_WEIGHT_BPS;
        if (tier == TIER_IN_STATE) return IN_STATE_VOTE_WEIGHT_BPS;
        return OTHER_US_VOTE_WEIGHT_BPS;
    }

    function getVotingPower(uint256 propertyId, address voter) external view returns (uint256) {
        return (balanceOf(voter, propertyId) * _weightBps(propertyId, voter)) / 10000;
    }

    function getTotalWeightedVotingPower(uint256 propertyId) external view returns (uint256) {
        return totalWeightedVotingPower[propertyId];
    }

    function mintTokens(
        uint256 propertyId,
        address buyer,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) nonReentrant whenNotPaused {
        string memory reason = _purchaseBlockReason(propertyId, buyer, amount);
        require(bytes(reason).length == 0, reason);

        Phase stage = stageOf(propertyId);
        _mint(buyer, propertyId, amount, "");

        Property storage prop = properties[propertyId];
        prop.mintedSupply += amount;
        prop.currentPhase = stage;
        soldInStage[propertyId][stage] += amount;
        purchasedInStage[propertyId][uint8(stage)][buyer] += amount;
        holdingsByPhase[propertyId][buyer][stage] += amount;

        emit TokensMinted(propertyId, buyer, amount, stage);
    }

    /**
     * @notice Stages follow the funding clock. They cannot be skipped by a bucket
     *         filling or by an engagement threshold.
     */
    function advancePhase(uint256) external pure {
        revert("Access stages follow the common funding clock");
    }

    /// @notice Marks the raise complete. TODO(owner): early completion does not unlock transfers.
    function markFunded(uint256 propertyId) external onlyRole(MINTER_ROLE) {
        Property storage prop = properties[propertyId];
        require(prop.isActive, "Property not active");
        require(!prop.isFunded, "Already funded");
        prop.isFunded = true;
        emit PropertyFunded(propertyId, prop.mintedSupply * getCurrentPrice(propertyId));
    }

    function addToWhitelist(address account, uint8 tier) external onlyRole(WHITELIST_ADMIN_ROLE) {
        require(tier <= TIER_OTHER_US, "Unknown residency tier");
        whitelist[account] = true;
        _setResidency(account, tier, true);
        emit AddressWhitelisted(account, tier);
    }

    function autoWhitelist(
        address account,
        uint8 tier,
        bytes calldata verificationData
    ) external onlyRole(WHITELIST_ADMIN_ROLE) {
        require(verificationData.length > 0, "No verification data");
        require(tier <= TIER_OTHER_US, "Unknown residency tier");
        whitelist[account] = true;
        _setResidency(account, tier, true);
        emit AddressWhitelisted(account, tier);
    }

    function setResidency(address account, uint8 tier, bool verified) external onlyRole(WHITELIST_ADMIN_ROLE) {
        require(tier <= TIER_UNVERIFIED, "Unknown residency tier");
        if (tier == TIER_UNVERIFIED) {
            _setResidency(account, residencyTier[account], false);
        } else {
            _setResidency(account, tier, verified);
        }
        emit ResidencyUpdated(account, residencyTier[account], residencyVerified[account]);
    }

    function setResidencyVerifier(address verifier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        residencyVerifier = IResidencyVerifier(verifier);
        emit ResidencyVerifierUpdated(verifier);
    }

    function removeFromWhitelist(address account) external onlyRole(WHITELIST_ADMIN_ROLE) {
        whitelist[account] = false;
        _setResidency(account, residencyTier[account], false);
        emit AddressRemovedFromWhitelist(account);
    }

    function updateBasePrice(uint256 newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newPrice > 0, "Price required");
        basePrice = newPrice;
        emit BasePriceUpdated(newPrice);
    }

    function setTransferExceptionsEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        transferExceptionsEnabled = enabled;
        emit TransferPolicyHookSet("transferExceptions", enabled);
    }

    function setPostPeriodTransfersEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        postPeriodTransfersEnabled = enabled;
        emit TransferPolicyHookSet("postPeriodLiquidity", enabled);
    }

    /// @notice TODO(owner): no transfer exception is defined. The flag does not open a transfer.
    function transferExceptionApplies(uint256, address, address, uint256) public view returns (bool) {
        if (!transferExceptionsEnabled) return false;
        return false;
    }

    function updateLLCBacking(
        uint256 propertyId,
        string calldata llcId,
        address custodian
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(properties[propertyId].isActive, "Property not active");
        require(custodian != address(0), "Custodian required");
        require(bytes(llcId).length > 0, "LLC identifier required");
        properties[propertyId].llcIdentifier = llcId;
        properties[propertyId].custodian = custodian;
        emit LLCBackingUpdated(propertyId, llcId, custodian);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function getProperty(uint256 propertyId) external view returns (Property memory) {
        return properties[propertyId];
    }

    function getAllPropertyIds() external view returns (uint256[] memory) {
        return _allPropertyIds.values();
    }

    function getPropertyCount() external view returns (uint256) {
        return _allPropertyIds.length();
    }

    function propertyExists(uint256 propertyId) external view returns (bool) {
        return _allPropertyIds.contains(propertyId);
    }

    function recordKYCVerification(
        address account,
        bytes32 verificationId
    ) external onlyRole(WHITELIST_ADMIN_ROLE) {
        kycVerificationIds[account] = verificationId;
        kycVerificationTimestamps[account] = block.timestamp;
        emit KYCVerificationCompleted(account, block.timestamp, verificationId);
    }

    function revokeKYCVerification(
        address account,
        string calldata reason
    ) external onlyRole(WHITELIST_ADMIN_ROLE) {
        delete kycVerificationIds[account];
        delete kycVerificationTimestamps[account];
        whitelist[account] = false;
        _setResidency(account, residencyTier[account], false);
        emit KYCVerificationRevoked(account, block.timestamp, reason);
        emit AddressRemovedFromWhitelist(account);
    }

    function recordAMLCheck(
        address account,
        bytes32 checkId
    ) external onlyRole(WHITELIST_ADMIN_ROLE) {
        amlCheckIds[account] = checkId;
        emit AMLCheckPassed(account, block.timestamp, checkId);
    }

    function recordAMLFailure(
        address account,
        string calldata reason
    ) external onlyRole(WHITELIST_ADMIN_ROLE) {
        whitelist[account] = false;
        _setResidency(account, residencyTier[account], false);
        emit AMLCheckFailed(account, block.timestamp, reason);
        emit AddressRemovedFromWhitelist(account);
    }

    function createComplianceCheckpoint(uint256 propertyId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Property storage prop = properties[propertyId];
        require(prop.isActive, "Property not active");
        emit ComplianceCheckpoint(propertyId, block.timestamp, 0, prop.mintedSupply);
    }

    function requestRegulatorAudit(uint256 propertyId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit RegulatorAuditRequested(propertyId, msg.sender, block.timestamp);
    }

    function getKYCStatus(address account) external view returns (
        bool isVerified,
        bytes32 verificationId,
        uint256 verificationTimestamp
    ) {
        return (
            whitelist[account] && kycVerificationIds[account] != bytes32(0),
            kycVerificationIds[account],
            kycVerificationTimestamps[account]
        );
    }

    /**
     * @notice Compliance gate (whitelist, recorded KYC, active property).
     *         The funding lock is applied separately and currently dominates.
     */
    function isComplianceTransferAllowed(
        uint256 propertyId,
        address from,
        address to
    ) public view returns (bool) {
        if (from == address(0) || to == address(0)) return true;
        if (!whitelist[to] || !whitelist[from]) return false;
        if (kycVerificationIds[to] == bytes32(0) || kycVerificationIds[from] == bytes32(0)) return false;
        if (!properties[propertyId].isActive) return false;
        return true;
    }

    function transferLockReason(uint256 propertyId) public view returns (string memory) {
        Property storage prop = properties[propertyId];
        if (prop.fundingClockStart == 0 || block.timestamp < prop.fundingDeadline) {
            return "Transfers locked through common funding period";
        }
        // TODO(owner): post-period liquidity is undecided. postPeriodTransfersEnabled does not open transfers.
        postPeriodTransfersEnabled;
        return "Post-period liquidity policy undecided";
    }

    function isTransferAllowed(
        uint256 propertyId,
        address from,
        address to,
        uint256 amount
    ) public view returns (bool) {
        if (from == address(0) || to == address(0)) return true;
        if (bytes(transferLockReason(propertyId)).length != 0 && !transferExceptionApplies(propertyId, from, to, amount)) {
            return false;
        }
        return isComplianceTransferAllowed(propertyId, from, to);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override(ERC1155, ERC1155Supply) whenNotPaused {
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                string memory lockReason = transferLockReason(ids[i]);
                if (bytes(lockReason).length != 0 && !transferExceptionApplies(ids[i], from, to, values[i])) {
                    revert(lockReason);
                }
                require(
                    isComplianceTransferAllowed(ids[i], from, to),
                    "Transfer not permitted under compliance rules"
                );
            }
        }

        if (from != address(0) || to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                if (from != address(0)) {
                    uint256 oldFrom = balanceOf(from, ids[i]);
                    _syncWeight(ids[i], from, oldFrom, oldFrom - values[i]);
                }
                if (to != address(0)) {
                    uint256 oldTo = balanceOf(to, ids[i]);
                    _syncWeight(ids[i], to, oldTo, oldTo + values[i]);
                }
            }
        }

        if (from != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 propertyId = ids[i];
                uint256 remaining = values[i];
                for (uint8 p = 0; p <= uint8(Phase.National) && remaining > 0; p++) {
                    Phase phase = Phase(p);
                    uint256 holdings = holdingsByPhase[propertyId][from][phase];
                    if (holdings == 0) continue;
                    uint256 toDeduct = holdings > remaining ? remaining : holdings;
                    holdingsByPhase[propertyId][from][phase] -= toDeduct;
                    if (to == address(0)) {
                        properties[propertyId].mintedSupply -= toDeduct;
                        soldInStage[propertyId][phase] -= toDeduct;
                        emit TokensBurned(propertyId, from, toDeduct, phase);
                    } else {
                        holdingsByPhase[propertyId][to][phase] += toDeduct;
                    }
                    remaining -= toDeduct;
                }
                require(remaining == 0, "Insufficient phase-tracked holdings");
            }
        }

        super._update(from, to, ids, values);

        if (from != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                if (balanceOf(from, ids[i]) == 0) {
                    _holderProperties[from].remove(ids[i]);
                }
            }
        }
        if (to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                if (values[i] > 0) {
                    _holderProperties[to].add(ids[i]);
                }
            }
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _purchaseBlockReason(
        uint256 propertyId,
        address buyer,
        uint256 amount
    ) internal view returns (string memory) {
        if (!whitelist[buyer]) return "Buyer not whitelisted";
        Property storage prop = properties[propertyId];
        if (!prop.isActive) return "Property not active";
        if (prop.custodian == address(0)) return "No LLC backing";
        if (prop.fundingClockStart == 0) return "Funding clock not started";
        if (block.timestamp >= prop.fundingDeadline) return "Funding period ended";
        if (amount == 0) return "Amount must be positive";
        if (perPersonAllowance[propertyId] == 0) return "Per-person allowance not configured";

        Phase stage = stageOf(propertyId);
        if (!_eligible(residencyTierOf(propertyId, buyer), stage)) {
            return "Not eligible for current stage";
        }

        uint256 already = purchasedInStage[propertyId][uint8(stage)][buyer];
        if (already + amount > perPersonAllowance[propertyId]) {
            return "Exceeds per-person allowance";
        }
        if (amount > prop.totalSupply - prop.mintedSupply) {
            return "Exceeds unsold remainder";
        }
        return "";
    }

    function _eligible(uint8 tier, Phase stage) internal pure returns (bool) {
        if (tier == TIER_COUNTY) return true;
        if (tier == TIER_IN_STATE) return stage != Phase.County;
        if (tier == TIER_OTHER_US) return stage == Phase.National;
        return false;
    }

    function _weightBps(uint256 propertyId, address account) internal view returns (uint256) {
        return voteWeightBps(residencyTierOf(propertyId, account));
    }

    function _syncWeight(
        uint256 propertyId,
        address account,
        uint256 oldBalance,
        uint256 newBalance
    ) internal {
        uint256 bps = _weightBps(propertyId, account);
        _applyPowerDelta(propertyId, (oldBalance * bps) / 10000, (newBalance * bps) / 10000);
    }

    function _applyPowerDelta(uint256 propertyId, uint256 oldPower, uint256 newPower) internal {
        if (newPower >= oldPower) {
            totalWeightedVotingPower[propertyId] += newPower - oldPower;
        } else {
            uint256 drop = oldPower - newPower;
            uint256 cur = totalWeightedVotingPower[propertyId];
            totalWeightedVotingPower[propertyId] = drop >= cur ? 0 : cur - drop;
        }
    }

    function _setResidency(address account, uint8 tier, bool verified) internal {
        uint256[] memory ids = _holderProperties[account].values();
        uint256[] memory oldBps = new uint256[](ids.length);
        uint256[] memory balances = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            balances[i] = balanceOf(account, ids[i]);
            oldBps[i] = _weightBps(ids[i], account);
        }

        residencyTier[account] = tier;
        residencyVerified[account] = verified;

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 newBps = _weightBps(ids[i], account);
            _applyPowerDelta(
                ids[i],
                (balances[i] * oldBps[i]) / 10000,
                (balances[i] * newBps) / 10000
            );
        }
    }
}
