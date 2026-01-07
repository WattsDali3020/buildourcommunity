// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title RevitaHub Property Token
 * @notice ERC-1155 token for fractional real estate ownership
 * @dev Implements phase-based pricing, whitelist transfers, and per-property supply limits
 */
contract PropertyToken is ERC1155, ERC1155Supply, ERC1155Burnable, AccessControl, Pausable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.UintSet;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant WHITELIST_ADMIN_ROLE = keccak256("WHITELIST_ADMIN_ROLE");
    bytes32 public constant PHASE_ADVANCER_ROLE = keccak256("PHASE_ADVANCER_ROLE");

    // Property phases
    enum Phase { County, State, National, International }

    // Property structure
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
    }

    // Phase allocation percentages (basis points, 10000 = 100%)
    uint256 public constant COUNTY_ALLOCATION = 4000;    // 40%
    uint256 public constant STATE_ALLOCATION = 3000;     // 30%
    uint256 public constant NATIONAL_ALLOCATION = 2000;  // 20%
    uint256 public constant INTERNATIONAL_ALLOCATION = 1000; // 10%

    // Base price in wei ($12.50 equivalent, set by oracle)
    uint256 public basePrice = 12.5 ether / 1000; // Placeholder, updated by Chainlink

    // Phase price multipliers (basis points)
    uint256 public constant COUNTY_MULTIPLIER = 10000;      // 1.0x ($12.50)
    uint256 public constant STATE_MULTIPLIER = 15000;       // 1.5x ($18.75)
    uint256 public constant NATIONAL_MULTIPLIER = 22500;    // 2.25x ($28.13)
    uint256 public constant INTERNATIONAL_MULTIPLIER = 30000; // 3.0x ($37.50)

    // Voting power multipliers (basis points)
    uint256 public constant COUNTY_VOTING_MULTIPLIER = 15000;      // 1.5x
    uint256 public constant STATE_VOTING_MULTIPLIER = 12500;       // 1.25x
    uint256 public constant NATIONAL_VOTING_MULTIPLIER = 10000;    // 1.0x
    uint256 public constant INTERNATIONAL_VOTING_MULTIPLIER = 7500; // 0.75x

    // Property storage
    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;

    // Phase allocations per property
    mapping(uint256 => mapping(Phase => uint256)) public phaseAllocations;
    mapping(uint256 => mapping(Phase => uint256)) public phaseMinted;

    // Whitelist for KYC-verified addresses
    mapping(address => bool) public whitelist;
    
    // Phase eligibility per address (based on location verification)
    mapping(address => Phase) public addressPhaseEligibility;

    // Token holdings with phase information
    mapping(uint256 => mapping(address => mapping(Phase => uint256))) public holdingsByPhase;

    // Track all property IDs for enumeration
    EnumerableSet.UintSet private _allPropertyIds;

    // Events
    event PropertyCreated(uint256 indexed propertyId, string name, uint256 totalSupply, uint256 fundingTarget);
    event PropertyFunded(uint256 indexed propertyId, uint256 totalRaised);
    event PhaseAdvanced(uint256 indexed propertyId, Phase newPhase);
    event TokensMinted(uint256 indexed propertyId, address indexed buyer, uint256 amount, Phase phase);
    event AddressWhitelisted(address indexed account, Phase eligibility);
    event AddressRemovedFromWhitelist(address indexed account);
    event BasePriceUpdated(uint256 newPrice);
    event TokensBurned(uint256 indexed propertyId, address indexed from, uint256 amount, Phase phase);

    constructor(string memory uri_) ERC1155(uri_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(WHITELIST_ADMIN_ROLE, msg.sender);
        _grantRole(PHASE_ADVANCER_ROLE, msg.sender);
    }

    /**
     * @notice Create a new property token offering
     * @param name Property name
     * @param propertyUri Metadata URI
     * @param totalSupply Total tokens to mint
     * @param fundingTarget Amount in wei required for full funding
     * @param fundingDuration Duration in seconds for funding period
     */
    function createProperty(
        string memory name,
        string memory propertyUri,
        uint256 totalSupply,
        uint256 fundingTarget,
        uint256 fundingDuration
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        uint256 propertyId = propertyCount++;
        
        properties[propertyId] = Property({
            id: propertyId,
            name: name,
            uri: propertyUri,
            totalSupply: totalSupply,
            mintedSupply: 0,
            fundingTarget: fundingTarget,
            fundingDeadline: block.timestamp + fundingDuration,
            currentPhase: Phase.County,
            isActive: true,
            isFunded: false
        });

        // Set phase allocations
        phaseAllocations[propertyId][Phase.County] = (totalSupply * COUNTY_ALLOCATION) / 10000;
        phaseAllocations[propertyId][Phase.State] = (totalSupply * STATE_ALLOCATION) / 10000;
        phaseAllocations[propertyId][Phase.National] = (totalSupply * NATIONAL_ALLOCATION) / 10000;
        phaseAllocations[propertyId][Phase.International] = (totalSupply * INTERNATIONAL_ALLOCATION) / 10000;

        // Track property for enumeration
        _allPropertyIds.add(propertyId);

        emit PropertyCreated(propertyId, name, totalSupply, fundingTarget);
        return propertyId;
    }

    /**
     * @notice Get the current price for a property based on phase
     * @param propertyId Property ID
     */
    function getCurrentPrice(uint256 propertyId) public view returns (uint256) {
        Property storage prop = properties[propertyId];
        require(prop.isActive, "Property not active");

        uint256 multiplier;
        if (prop.currentPhase == Phase.County) {
            multiplier = COUNTY_MULTIPLIER;
        } else if (prop.currentPhase == Phase.State) {
            multiplier = STATE_MULTIPLIER;
        } else if (prop.currentPhase == Phase.National) {
            multiplier = NATIONAL_MULTIPLIER;
        } else {
            multiplier = INTERNATIONAL_MULTIPLIER;
        }

        return (basePrice * multiplier) / 10000;
    }

    /**
     * @notice Get voting power multiplier for a phase
     * @param phase The phase to check
     */
    function getVotingMultiplier(Phase phase) public pure returns (uint256) {
        if (phase == Phase.County) return COUNTY_VOTING_MULTIPLIER;
        if (phase == Phase.State) return STATE_VOTING_MULTIPLIER;
        if (phase == Phase.National) return NATIONAL_VOTING_MULTIPLIER;
        return INTERNATIONAL_VOTING_MULTIPLIER;
    }

    /**
     * @notice Calculate voting power for an address on a property
     * @param propertyId Property ID
     * @param voter Address to check
     */
    function getVotingPower(uint256 propertyId, address voter) external view returns (uint256) {
        uint256 totalPower = 0;
        
        for (uint8 i = 0; i <= uint8(Phase.International); i++) {
            Phase phase = Phase(i);
            uint256 holdings = holdingsByPhase[propertyId][voter][phase];
            uint256 multiplier = getVotingMultiplier(phase);
            totalPower += (holdings * multiplier) / 10000;
        }
        
        return totalPower;
    }

    /**
     * @notice Calculate total weighted voting power for a property
     * @dev Sums all minted tokens by phase, weighted by voting multipliers
     * @param propertyId Property ID
     */
    function getTotalWeightedVotingPower(uint256 propertyId) external view returns (uint256) {
        uint256 totalPower = 0;
        
        for (uint8 i = 0; i <= uint8(Phase.International); i++) {
            Phase phase = Phase(i);
            uint256 minted = phaseMinted[propertyId][phase];
            uint256 multiplier = getVotingMultiplier(phase);
            totalPower += (minted * multiplier) / 10000;
        }
        
        return totalPower;
    }

    /**
     * @notice Mint tokens for a buyer (called by Escrow contract)
     * @param propertyId Property ID
     * @param buyer Buyer address
     * @param amount Number of tokens
     */
    function mintTokens(
        uint256 propertyId,
        address buyer,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) nonReentrant whenNotPaused {
        require(whitelist[buyer], "Buyer not whitelisted");
        
        Property storage prop = properties[propertyId];
        require(prop.isActive, "Property not active");
        require(!prop.isFunded || block.timestamp <= prop.fundingDeadline, "Funding closed");
        
        Phase buyerPhase = addressPhaseEligibility[buyer];
        require(uint8(buyerPhase) >= uint8(prop.currentPhase), "Not eligible for current phase");

        // Check phase allocation
        uint256 phaseRemaining = phaseAllocations[propertyId][prop.currentPhase] - 
                                 phaseMinted[propertyId][prop.currentPhase];
        require(amount <= phaseRemaining, "Exceeds phase allocation");

        // Mint tokens
        _mint(buyer, propertyId, amount, "");
        
        // Update state
        prop.mintedSupply += amount;
        phaseMinted[propertyId][prop.currentPhase] += amount;
        holdingsByPhase[propertyId][buyer][prop.currentPhase] += amount;

        emit TokensMinted(propertyId, buyer, amount, prop.currentPhase);

        // Check if phase is complete
        if (phaseMinted[propertyId][prop.currentPhase] >= phaseAllocations[propertyId][prop.currentPhase]) {
            _advancePhase(propertyId);
        }
    }

    /**
     * @notice Advance to next phase (can be called by PhaseManager)
     * @param propertyId Property ID
     */
    function advancePhase(uint256 propertyId) external onlyRole(PHASE_ADVANCER_ROLE) {
        _advancePhase(propertyId);
    }

    function _advancePhase(uint256 propertyId) internal {
        Property storage prop = properties[propertyId];
        require(prop.isActive, "Property not active");
        require(uint8(prop.currentPhase) < uint8(Phase.International), "Already at final phase");

        prop.currentPhase = Phase(uint8(prop.currentPhase) + 1);
        emit PhaseAdvanced(propertyId, prop.currentPhase);
    }

    /**
     * @notice Mark property as fully funded
     * @param propertyId Property ID
     */
    function markFunded(uint256 propertyId) external onlyRole(MINTER_ROLE) {
        Property storage prop = properties[propertyId];
        require(prop.isActive, "Property not active");
        require(!prop.isFunded, "Already funded");
        
        prop.isFunded = true;
        emit PropertyFunded(propertyId, prop.mintedSupply * getCurrentPrice(propertyId));
    }

    /**
     * @notice Add address to whitelist with phase eligibility
     * @param account Address to whitelist
     * @param eligibility Phase eligibility based on KYC/location
     */
    function addToWhitelist(address account, Phase eligibility) external onlyRole(WHITELIST_ADMIN_ROLE) {
        whitelist[account] = true;
        addressPhaseEligibility[account] = eligibility;
        emit AddressWhitelisted(account, eligibility);
    }

    /**
     * @notice Remove address from whitelist
     * @param account Address to remove
     */
    function removeFromWhitelist(address account) external onlyRole(WHITELIST_ADMIN_ROLE) {
        whitelist[account] = false;
        emit AddressRemovedFromWhitelist(account);
    }

    /**
     * @notice Update base price (called by Chainlink oracle)
     * @param newPrice New base price in wei
     */
    function updateBasePrice(uint256 newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        basePrice = newPrice;
        emit BasePriceUpdated(newPrice);
    }

    /**
     * @notice Pause all token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @notice Get property details
     * @param propertyId Property ID
     */
    function getProperty(uint256 propertyId) external view returns (Property memory) {
        return properties[propertyId];
    }

    /**
     * @notice Get all property IDs
     */
    function getAllPropertyIds() external view returns (uint256[] memory) {
        return _allPropertyIds.values();
    }

    /**
     * @notice Get property count
     */
    function getPropertyCount() external view returns (uint256) {
        return _allPropertyIds.length();
    }

    /**
     * @notice Check if property exists
     */
    function propertyExists(uint256 propertyId) external view returns (bool) {
        return _allPropertyIds.contains(propertyId);
    }

    /**
     * @notice Override transfer to enforce whitelist and maintain phase tracking
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override(ERC1155, ERC1155Supply) whenNotPaused {
        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            require(whitelist[to], "Recipient not whitelisted");
        }
        
        // Handle transfers and burns - update holdingsByPhase
        if (from != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 propertyId = ids[i];
                uint256 amount = values[i];
                
                // Deduct from sender's phase holdings (FIFO - earliest phase first)
                uint256 remaining = amount;
                for (uint8 p = 0; p <= uint8(Phase.International) && remaining > 0; p++) {
                    Phase phase = Phase(p);
                    uint256 holdings = holdingsByPhase[propertyId][from][phase];
                    if (holdings > 0) {
                        uint256 toDeduct = holdings > remaining ? remaining : holdings;
                        holdingsByPhase[propertyId][from][phase] -= toDeduct;
                        
                        // For burns (to == address(0)), also update global state
                        if (to == address(0)) {
                            properties[propertyId].mintedSupply -= toDeduct;
                            phaseMinted[propertyId][phase] -= toDeduct;
                            emit TokensBurned(propertyId, from, toDeduct, phase);
                        } else {
                            // For transfers, add to recipient's phase holdings
                            holdingsByPhase[propertyId][to][phase] += toDeduct;
                        }
                        
                        remaining -= toDeduct;
                    }
                }
                
                // Revert if we couldn't account for all tokens
                require(remaining == 0, "Insufficient phase-tracked holdings");
            }
        }
        
        super._update(from, to, ids, values);
    }

    /**
     * @notice Required override for AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
