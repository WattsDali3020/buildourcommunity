// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface IPropertyToken {
    function getVotingPower(uint256 propertyId, address voter) external view returns (uint256);
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function totalSupply(uint256 id) external view returns (uint256);
    function getTotalWeightedVotingPower(uint256 propertyId) external view returns (uint256);
}

/**
 * @title RevitaHub Governance
 * @notice DAO voting with phase-weighted voting power
 * @dev County holders get 1.5x, State 1.25x, National 1.0x, International 0.75x
 */
contract Governance is AccessControl, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    IPropertyToken public propertyToken;
    
    // Domain separator for EIP-712 signatures
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant VOTE_TYPEHASH = keccak256("Vote(uint256 proposalId,uint8 support,address voter,uint256 nonce,uint256 deadline)");
    
    // Nonces for replay protection
    mapping(address => uint256) public nonces;

    // Proposal types
    enum ProposalType { 
        PropertyDevelopment,  // How to develop a property
        TreasuryAllocation,   // How to spend treasury funds
        ParameterChange,      // Change platform parameters
        Emergency             // Emergency actions
    }

    // Proposal status
    enum ProposalStatus {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Executed,
        Cancelled
    }

    // Proposal structure
    struct Proposal {
        uint256 id;
        uint256 propertyId;
        address proposer;
        ProposalType proposalType;
        string title;
        string description;
        string ipfsHash;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
        uint256 startTime;
        uint256 endTime;
        uint256 quorumRequired;
        ProposalStatus status;
        bytes executionData;
    }

    // Vote record
    struct Vote {
        bool hasVoted;
        uint8 support; // 0 = against, 1 = for, 2 = abstain
        uint256 weight;
    }

    // Quorum requirements (basis points of total voting power)
    uint256 public constant QUORUM_PROPERTY = 2000;   // 20% for property decisions
    uint256 public constant QUORUM_TREASURY = 3000;   // 30% for treasury
    uint256 public constant QUORUM_PARAMETER = 2500;  // 25% for parameters
    uint256 public constant QUORUM_EMERGENCY = 5000;  // 50% for emergency

    // Voting period
    uint256 public votingPeriod = 7 days;

    // Vote-to-earn bonus APR (in basis points, e.g., 50 = 0.5%)
    uint256 public voteToEarnBonus = 50;

    // Storage
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => uint256) public totalVotingPower; // Total voting power at proposal creation
    
    // Vote-to-earn tracking
    mapping(address => uint256) public voterParticipationCount;
    mapping(address => uint256) public lastVoteTimestamp;

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed propertyId,
        address proposer,
        ProposalType proposalType,
        string title
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 support,
        uint256 weight
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event VotingPeriodUpdated(uint256 newPeriod);
    event VoteToEarnBonusUpdated(uint256 newBonus);
    event OffChainVoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 support,
        uint256 weight,
        address relayer
    );

    constructor(address _propertyToken) {
        propertyToken = IPropertyToken(_propertyToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
        
        // Set up EIP-712 domain separator
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("RevitaHub Governance")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /**
     * @notice Create a new proposal
     * @param propertyId Property ID (0 for platform-wide proposals)
     * @param proposalType Type of proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param ipfsHash IPFS hash for detailed documentation
     * @param executionData Encoded execution data
     */
    function createProposal(
        uint256 propertyId,
        ProposalType proposalType,
        string memory title,
        string memory description,
        string memory ipfsHash,
        bytes memory executionData
    ) external onlyRole(PROPOSER_ROLE) returns (uint256) {
        // Require token holdings to create proposal
        require(
            propertyToken.getVotingPower(propertyId, msg.sender) > 0,
            "Must hold tokens to propose"
        );

        uint256 proposalId = proposalCount++;
        uint256 quorum = _getQuorum(proposalType);
        
        // Snapshot total WEIGHTED voting power at proposal creation
        // Uses the same weighting as individual votes for consistency
        uint256 snapshotVotingPower = propertyToken.getTotalWeightedVotingPower(propertyId);
        require(snapshotVotingPower > 0, "No voting power exists for this property");
        totalVotingPower[proposalId] = snapshotVotingPower;

        proposals[proposalId] = Proposal({
            id: proposalId,
            propertyId: propertyId,
            proposer: msg.sender,
            proposalType: proposalType,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            votesFor: 0,
            votesAgainst: 0,
            votesAbstain: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            quorumRequired: quorum,
            status: ProposalStatus.Active,
            executionData: executionData
        });

        emit ProposalCreated(proposalId, propertyId, msg.sender, proposalType, title);
        return proposalId;
    }

    /**
     * @notice Cast a vote on a proposal
     * @param proposalId Proposal ID
     * @param support 0 = against, 1 = for, 2 = abstain
     */
    function castVote(uint256 proposalId, uint8 support) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(support <= 2, "Invalid vote type");

        Vote storage voterRecord = votes[proposalId][msg.sender];
        require(!voterRecord.hasVoted, "Already voted");

        // Get voting power (phase-weighted)
        uint256 weight = propertyToken.getVotingPower(proposal.propertyId, msg.sender);
        require(weight > 0, "No voting power");

        // Record vote
        voterRecord.hasVoted = true;
        voterRecord.support = support;
        voterRecord.weight = weight;

        // Tally votes
        if (support == 0) {
            proposal.votesAgainst += weight;
        } else if (support == 1) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAbstain += weight;
        }

        // Update vote-to-earn tracking
        voterParticipationCount[msg.sender]++;
        lastVoteTimestamp[msg.sender] = block.timestamp;

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    /**
     * @notice Cast a vote using off-chain signature (gasless voting)
     * @dev Enables lower-income investors to vote without paying gas
     * @param proposalId Proposal ID
     * @param support 0 = against, 1 = for, 2 = abstain
     * @param voter The address of the voter who signed
     * @param deadline Timestamp after which signature expires
     * @param v ECDSA signature component
     * @param r ECDSA signature component
     * @param s ECDSA signature component
     */
    function castVoteBySignature(
        uint256 proposalId,
        uint8 support,
        address voter,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlyRole(RELAYER_ROLE) nonReentrant {
        require(block.timestamp <= deadline, "Signature expired");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(support <= 2, "Invalid vote type");

        Vote storage voterRecord = votes[proposalId][voter];
        require(!voterRecord.hasVoted, "Already voted");

        // Verify signature using EIP-712
        uint256 currentNonce = nonces[voter]++;
        bytes32 structHash = keccak256(
            abi.encode(VOTE_TYPEHASH, proposalId, support, voter, currentNonce, deadline)
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
        address signer = ECDSA.recover(digest, v, r, s);
        require(signer == voter, "Invalid signature");

        // Get voting power (phase-weighted)
        uint256 weight = propertyToken.getVotingPower(proposal.propertyId, voter);
        require(weight > 0, "No voting power");

        // Record vote
        voterRecord.hasVoted = true;
        voterRecord.support = support;
        voterRecord.weight = weight;

        // Tally votes
        if (support == 0) {
            proposal.votesAgainst += weight;
        } else if (support == 1) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAbstain += weight;
        }

        // Update vote-to-earn tracking
        voterParticipationCount[voter]++;
        lastVoteTimestamp[voter] = block.timestamp;

        emit OffChainVoteCast(proposalId, voter, support, weight, msg.sender);
    }

    /**
     * @notice Get current nonce for a voter (for signature creation)
     * @param voter Voter address
     */
    function getNonce(address voter) external view returns (uint256) {
        return nonces[voter];
    }

    /**
     * @notice Finalize a proposal after voting ends
     * @param proposalId Proposal ID
     */
    function finalizeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp >= proposal.endTime, "Voting not ended");

        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
        uint256 snapshotSupply = totalVotingPower[proposalId];
        
        // Calculate participation as basis points of total voting power
        // quorumRequired is in basis points (e.g., 2000 = 20%)
        // Check: (totalVotes * 10000) / snapshotSupply >= quorumRequired
        uint256 participationBps = snapshotSupply > 0 
            ? (totalVotes * 10000) / snapshotSupply 
            : 0;
        
        bool quorumReached = participationBps >= proposal.quorumRequired;
        bool majority = proposal.votesFor > proposal.votesAgainst;

        if (quorumReached && majority) {
            proposal.status = ProposalStatus.Succeeded;
        } else {
            proposal.status = ProposalStatus.Defeated;
        }
    }

    /**
     * @notice Execute a successful proposal
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Succeeded, "Proposal not succeeded");

        proposal.status = ProposalStatus.Executed;

        // Execute the proposal (implementation depends on proposal type)
        // In production, this would call the appropriate contract method
        
        emit ProposalExecuted(proposalId);
    }

    /**
     * @notice Cancel a proposal
     * @param proposalId Proposal ID
     */
    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        require(
            proposal.status == ProposalStatus.Active || proposal.status == ProposalStatus.Pending,
            "Cannot cancel"
        );

        proposal.status = ProposalStatus.Cancelled;
        emit ProposalCancelled(proposalId);
    }

    /**
     * @notice Get vote-to-earn bonus eligibility
     * @param voter Voter address
     */
    function getVoteToEarnBonus(address voter) external view returns (uint256) {
        // Bonus applies if voted within last 30 days
        if (block.timestamp - lastVoteTimestamp[voter] <= 30 days) {
            return voteToEarnBonus;
        }
        return 0;
    }

    /**
     * @notice Get proposal details
     * @param proposalId Proposal ID
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    /**
     * @notice Get vote details for a voter
     * @param proposalId Proposal ID
     * @param voter Voter address
     */
    function getVote(uint256 proposalId, address voter) external view returns (Vote memory) {
        return votes[proposalId][voter];
    }

    /**
     * @notice Get all active proposals for a property
     * @param propertyId Property ID to filter by
     * @return active Array of active proposals for the property
     */
    function getActiveProposals(uint256 propertyId) external view returns (Proposal[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < proposalCount; i++) {
            if (proposals[i].propertyId == propertyId && proposals[i].status == ProposalStatus.Active) {
                count++;
            }
        }
        Proposal[] memory active = new Proposal[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < proposalCount; i++) {
            if (proposals[i].propertyId == propertyId && proposals[i].status == ProposalStatus.Active) {
                active[idx++] = proposals[i];
            }
        }
        return active;
    }

    /**
     * @notice Get quorum requirement for proposal type
     */
    function _getQuorum(ProposalType proposalType) internal pure returns (uint256) {
        if (proposalType == ProposalType.PropertyDevelopment) return QUORUM_PROPERTY;
        if (proposalType == ProposalType.TreasuryAllocation) return QUORUM_TREASURY;
        if (proposalType == ProposalType.ParameterChange) return QUORUM_PARAMETER;
        return QUORUM_EMERGENCY;
    }

    /**
     * @notice Update voting period
     * @param newPeriod New voting period in seconds
     */
    function setVotingPeriod(uint256 newPeriod) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newPeriod >= 1 days && newPeriod <= 30 days, "Invalid period");
        votingPeriod = newPeriod;
        emit VotingPeriodUpdated(newPeriod);
    }

    /**
     * @notice Update vote-to-earn bonus
     * @param newBonus New bonus in basis points
     */
    function setVoteToEarnBonus(uint256 newBonus) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newBonus <= 500, "Bonus too high"); // Max 5%
        voteToEarnBonus = newBonus;
        emit VoteToEarnBonusUpdated(newBonus);
    }
}
