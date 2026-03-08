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
        string impactReportIPFS;
        uint256 impactScore;
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

    // ============ Community Polls (Non-Binding Gauges) ============
    
    // Poll status
    enum PollStatus {
        Active,
        Ended,
        ConvertedToProposal
    }
    
    // Poll structure for community demand gauges
    struct Poll {
        uint256 id;
        uint256 propertyId;         // 0 for platform-wide polls
        address creator;
        string question;
        string description;
        string ipfsHash;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        PollStatus status;
        uint256 linkedProposalId;   // If converted to proposal
    }
    
    // Poll vote record
    struct PollVote {
        bool hasVoted;
        bool support;
    }
    
    // Poll storage
    mapping(uint256 => Poll) public polls;
    uint256 public pollCount;
    mapping(uint256 => mapping(address => PollVote)) public pollVotes;
    mapping(uint256 => uint256) public pollParticipants; // Total unique voters per poll
    
    // Poll-to-proposal threshold (30% support in basis points)
    uint256 public constant POLL_PROPOSAL_THRESHOLD = 3000;
    
    // Poll quorum bonus (5% reduction when poll-backed)
    uint256 public constant POLL_QUORUM_BONUS = 500;

    // ============ SimCity-Style Demand Meters ============
    
    // Cumulative vote weight per proposal type (tracks community demand signals)
    mapping(ProposalType => uint256) public typeDemandWeights;
    
    // Demand snapshots in BPS (e.g., 7500 = 75% of total votes for this type)
    mapping(ProposalType => uint256) public demandSnapshots;
    
    // Total demand weight across all types (for percentage calculation)
    uint256 public totalDemandWeight;
    
    // Demand-driven quorum boost threshold (50% demand = -5% quorum)
    uint256 public constant DEMAND_QUORUM_BOOST_THRESHOLD = 5000;
    uint256 public constant DEMAND_QUORUM_BOOST = 500;

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
    
    // Poll events
    event PollCreated(
        uint256 indexed pollId,
        uint256 indexed propertyId,
        address creator,
        string question
    );
    event PollVoteCast(
        uint256 indexed pollId,
        address indexed voter,
        bool support
    );
    event PollEnded(uint256 indexed pollId, uint256 votesFor, uint256 votesAgainst);
    event PollConvertedToProposal(uint256 indexed pollId, uint256 indexed proposalId);
    
    event OffChainVoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 support,
        uint256 weight,
        address relayer
    );
    
    // Demand meter events
    event DemandUpdated(
        ProposalType indexed proposalType,
        uint256 demandWeight,
        uint256 demandBps
    );
    event DemandSnapshotTaken(
        uint256[4] demandBars
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
     * @param impactReportIPFS IPFS hash for impact report (required for PropertyDevelopment)
     * @param impactScore Impact score 0-100 (required for PropertyDevelopment)
     */
    function createProposal(
        uint256 propertyId,
        ProposalType proposalType,
        string memory title,
        string memory description,
        string memory ipfsHash,
        bytes memory executionData,
        string memory impactReportIPFS,
        uint256 impactScore
    ) external onlyRole(PROPOSER_ROLE) returns (uint256) {
        if (proposalType == ProposalType.PropertyDevelopment) {
            require(bytes(impactReportIPFS).length > 0, "Impact report required for PropertyDevelopment");
            require(impactScore > 0, "Impact score required for PropertyDevelopment");
        }
        require(impactScore <= 100, "Impact score must be 0-100");

        require(
            propertyToken.getVotingPower(propertyId, msg.sender) > 0,
            "Must hold tokens to propose"
        );

        uint256 proposalId = proposalCount++;
        uint256 quorum = _getQuorum(proposalType);
        
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
            executionData: executionData,
            impactReportIPFS: impactReportIPFS,
            impactScore: impactScore
        });

        emit ProposalCreated(proposalId, propertyId, msg.sender, proposalType, title);
        return proposalId;
    }

    /**
     * @notice Get impact report for a proposal
     * @param proposalId Proposal ID
     * @return ipfsHash IPFS hash of the impact report
     * @return impactScore Impact score (0-100)
     */
    function getImpactReport(uint256 proposalId) external view returns (string memory ipfsHash, uint256 impactScore) {
        require(proposalId < proposalCount, "Proposal does not exist");
        Proposal storage proposal = proposals[proposalId];
        return (proposal.impactReportIPFS, proposal.impactScore);
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

        // Update demand meters
        _updateDemandMeters(proposal.proposalType, weight);

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

        // Update demand meters
        _updateDemandMeters(proposal.proposalType, weight);

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
     * @notice Get quorum requirement for proposal type (with demand-driven boost)
     */
    function _getQuorum(ProposalType proposalType) internal view returns (uint256) {
        uint256 baseQuorum;
        if (proposalType == ProposalType.PropertyDevelopment) baseQuorum = QUORUM_PROPERTY;
        else if (proposalType == ProposalType.TreasuryAllocation) baseQuorum = QUORUM_TREASURY;
        else if (proposalType == ProposalType.ParameterChange) baseQuorum = QUORUM_PARAMETER;
        else baseQuorum = QUORUM_EMERGENCY;
        
        // Demand-driven quorum boost: types with >50% demand get -5% quorum
        if (demandSnapshots[proposalType] >= DEMAND_QUORUM_BOOST_THRESHOLD) {
            uint256 boosted = baseQuorum > DEMAND_QUORUM_BOOST ? baseQuorum - DEMAND_QUORUM_BOOST : 1000;
            return boosted < 1000 ? 1000 : boosted; // Minimum 10% quorum
        }
        return baseQuorum;
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

    // ============ Community Poll Functions ============

    /**
     * @notice Create a non-binding community poll to gauge demand
     * @dev Polls are lightweight and don't require token holdings
     * @param propertyId Property ID (0 for platform-wide)
     * @param question Poll question
     * @param description Detailed description
     * @param ipfsHash IPFS hash for additional docs
     * @param duration Poll duration in seconds
     */
    function createPoll(
        uint256 propertyId,
        string memory question,
        string memory description,
        string memory ipfsHash,
        uint256 duration
    ) external returns (uint256) {
        require(duration >= 1 days && duration <= 30 days, "Invalid duration");
        
        uint256 pollId = pollCount++;
        
        polls[pollId] = Poll({
            id: pollId,
            propertyId: propertyId,
            creator: msg.sender,
            question: question,
            description: description,
            ipfsHash: ipfsHash,
            votesFor: 0,
            votesAgainst: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            status: PollStatus.Active,
            linkedProposalId: 0
        });
        
        emit PollCreated(pollId, propertyId, msg.sender, question);
        return pollId;
    }

    /**
     * @notice Vote on a community poll (no gas subsidy needed - lightweight)
     * @param pollId Poll ID
     * @param support True = support, False = oppose
     */
    function votePoll(uint256 pollId, bool support) external {
        Poll storage poll = polls[pollId];
        require(poll.status == PollStatus.Active, "Poll not active");
        require(block.timestamp < poll.endTime, "Poll ended");
        
        PollVote storage voterRecord = pollVotes[pollId][msg.sender];
        require(!voterRecord.hasVoted, "Already voted");
        
        voterRecord.hasVoted = true;
        voterRecord.support = support;
        pollParticipants[pollId]++;
        
        if (support) {
            poll.votesFor++;
        } else {
            poll.votesAgainst++;
        }
        
        emit PollVoteCast(pollId, msg.sender, support);
    }

    /**
     * @notice End a poll and calculate results
     * @param pollId Poll ID
     */
    function endPoll(uint256 pollId) external {
        Poll storage poll = polls[pollId];
        require(poll.status == PollStatus.Active, "Poll not active");
        require(block.timestamp >= poll.endTime, "Poll not ended yet");
        
        poll.status = PollStatus.Ended;
        emit PollEnded(pollId, poll.votesFor, poll.votesAgainst);
    }

    /**
     * @notice Create a proposal from a successful poll (poll-to-proposal pipeline)
     * @dev Requires >30% support in the poll for reduced quorum
     * @param pollId Poll ID to convert
     * @param proposalType Type of proposal to create
     * @param executionData Encoded execution data
     * @param impactReportIPFS IPFS hash for impact report (required for PropertyDevelopment)
     * @param impactScore Impact score 0-100 (required for PropertyDevelopment)
     */
    function createProposalFromPoll(
        uint256 pollId,
        ProposalType proposalType,
        bytes memory executionData,
        string memory impactReportIPFS,
        uint256 impactScore
    ) external onlyRole(PROPOSER_ROLE) returns (uint256) {
        if (proposalType == ProposalType.PropertyDevelopment) {
            require(bytes(impactReportIPFS).length > 0, "Impact report required for PropertyDevelopment");
            require(impactScore > 0, "Impact score required for PropertyDevelopment");
        }
        require(impactScore <= 100, "Impact score must be 0-100");
        Poll storage poll = polls[pollId];
        require(poll.status == PollStatus.Ended, "Poll must be ended first");
        require(poll.linkedProposalId == 0, "Already converted");
        
        // Calculate poll support percentage
        uint256 totalVotes = poll.votesFor + poll.votesAgainst;
        require(totalVotes > 0, "No votes cast");
        uint256 supportPercent = (poll.votesFor * 10000) / totalVotes;
        require(supportPercent >= POLL_PROPOSAL_THRESHOLD, "Insufficient poll support");
        
        // Require token holdings
        require(
            propertyToken.getVotingPower(poll.propertyId, msg.sender) > 0,
            "Must hold tokens to propose"
        );
        
        uint256 proposalId = proposalCount++;
        
        // Apply quorum bonus for poll-backed proposals
        uint256 baseQuorum = _getQuorum(proposalType);
        uint256 adjustedQuorum = baseQuorum > POLL_QUORUM_BONUS 
            ? baseQuorum - POLL_QUORUM_BONUS 
            : baseQuorum;
        
        // Snapshot voting power
        uint256 snapshotVotingPower = propertyToken.getTotalWeightedVotingPower(poll.propertyId);
        require(snapshotVotingPower > 0, "No voting power exists");
        totalVotingPower[proposalId] = snapshotVotingPower;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            propertyId: poll.propertyId,
            proposer: msg.sender,
            proposalType: proposalType,
            title: poll.question,
            description: poll.description,
            ipfsHash: poll.ipfsHash,
            votesFor: 0,
            votesAgainst: 0,
            votesAbstain: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            quorumRequired: adjustedQuorum,
            status: ProposalStatus.Active,
            executionData: executionData,
            impactReportIPFS: impactReportIPFS,
            impactScore: impactScore
        });
        
        // Link poll to proposal
        poll.status = PollStatus.ConvertedToProposal;
        poll.linkedProposalId = proposalId;
        
        emit ProposalCreated(proposalId, poll.propertyId, msg.sender, proposalType, poll.question);
        emit PollConvertedToProposal(pollId, proposalId);
        
        return proposalId;
    }

    /**
     * @notice Get poll details
     * @param pollId Poll ID
     */
    function getPoll(uint256 pollId) external view returns (Poll memory) {
        return polls[pollId];
    }

    /**
     * @notice Get poll support percentage
     * @param pollId Poll ID
     * @return supportPercent Support in basis points (e.g., 6000 = 60%)
     */
    function getPollSupport(uint256 pollId) external view returns (uint256) {
        Poll storage poll = polls[pollId];
        uint256 totalVotes = poll.votesFor + poll.votesAgainst;
        if (totalVotes == 0) return 0;
        return (poll.votesFor * 10000) / totalVotes;
    }

    /**
     * @notice Get active polls for a property
     * @param propertyId Property ID (0 for platform-wide)
     */
    function getActivePolls(uint256 propertyId) external view returns (Poll[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < pollCount; i++) {
            if (polls[i].propertyId == propertyId && polls[i].status == PollStatus.Active) {
                count++;
            }
        }
        Poll[] memory active = new Poll[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < pollCount; i++) {
            if (polls[i].propertyId == propertyId && polls[i].status == PollStatus.Active) {
                active[idx++] = polls[i];
            }
        }
        return active;
    }

    // ============ SimCity-Style Demand Meter Functions ============

    /**
     * @notice Internal: Update demand meters when a vote is cast
     * @param proposalType The type of proposal being voted on
     * @param weight The voting weight applied
     */
    function _updateDemandMeters(ProposalType proposalType, uint256 weight) internal {
        typeDemandWeights[proposalType] += weight;
        totalDemandWeight += weight;
        
        // Update snapshot for this type
        if (totalDemandWeight > 0) {
            demandSnapshots[proposalType] = (typeDemandWeights[proposalType] * 10000) / totalDemandWeight;
        }
        
        emit DemandUpdated(proposalType, typeDemandWeights[proposalType], demandSnapshots[proposalType]);
    }

    /**
     * @notice Get SimCity-style demand bars for all 4 proposal types
     * @return bars Array of 4 values in BPS: [PropertyDev, Treasury, Parameters, Emergency]
     * @dev Like SimCity's R/C/I demand bars - shows what the community wants
     */
    function getDemandBars() external view returns (uint256[4] memory bars) {
        if (totalDemandWeight == 0) return bars;
        
        for (uint256 i = 0; i < 4; i++) {
            bars[i] = (typeDemandWeights[ProposalType(i)] * 10000) / totalDemandWeight;
        }
        return bars;
    }

    /**
     * @notice Get demand weight for a specific proposal type
     * @param proposalType The proposal type to query
     * @return weight Cumulative vote weight for this type
     * @return bps Demand percentage in basis points
     */
    function getDemandForType(ProposalType proposalType) external view returns (uint256 weight, uint256 bps) {
        weight = typeDemandWeights[proposalType];
        bps = totalDemandWeight > 0 ? (weight * 10000) / totalDemandWeight : 0;
    }

    /**
     * @notice Take a demand snapshot (callable by operator for analytics)
     * @dev Updates all demand snapshots and emits event for off-chain indexing
     */
    function takeDemandSnapshot() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256[4] memory bars;
        if (totalDemandWeight > 0) {
            for (uint256 i = 0; i < 4; i++) {
                ProposalType pType = ProposalType(i);
                bars[i] = (typeDemandWeights[pType] * 10000) / totalDemandWeight;
                demandSnapshots[pType] = bars[i];
            }
        }
        emit DemandSnapshotTaken(bars);
    }

    /**
     * @notice Get the effective quorum for a proposal type (includes demand boost)
     * @param proposalType The proposal type
     * @return effectiveQuorum The quorum in basis points after demand adjustments
     */
    function getEffectiveQuorum(ProposalType proposalType) external view returns (uint256) {
        return _getQuorum(proposalType);
    }

    /**
     * @notice Get community health score based on demand diversity and participation
     * @return healthScore Score 0-10000 (higher = healthier community)
     * @dev Measures demand diversity (balanced = healthier) and total participation
     */
    function getCommunityHealthScore() external view returns (uint256 healthScore) {
        if (totalDemandWeight == 0) return 0;
        
        // Diversity score: How evenly distributed demand is across types
        // Perfect balance = 2500 each = max diversity
        uint256 diversityScore = 0;
        for (uint256 i = 0; i < 4; i++) {
            uint256 typeBps = (typeDemandWeights[ProposalType(i)] * 10000) / totalDemandWeight;
            // Distance from perfect balance (2500)
            uint256 deviation = typeBps > 2500 ? typeBps - 2500 : 2500 - typeBps;
            // Max deviation per type is 2500, so normalize
            diversityScore += (2500 - deviation);
        }
        // diversityScore ranges 0-10000, normalize to 0-5000 (half of health)
        diversityScore = diversityScore / 2;
        
        // Participation score: Based on total votes cast (capped contribution)
        // More votes = healthier, cap at 5000 for the other half
        uint256 participationScore = totalDemandWeight > 0 ? 5000 : 0;
        
        healthScore = diversityScore + participationScore;
        if (healthScore > 10000) healthScore = 10000;
    }
}
