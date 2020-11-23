// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./Registry.sol";

/**
 * @title Web3 Mastermind Groups PM Referenda
 * @author valmack2020@gmail.com
 * @notice Web3MG PMs can create and vote on proposals
 */
contract Referenda {
    /**
     * @notice Returns the descriptive name of this contract
     * @return Name
     */
    string public constant name = "Web3 Mastermind Groups PM Referenda";

    /**
     * @notice Returns the bytes of the proposal with the given id
     * @return Bytes representing the proposal
     */
    mapping(uint256 => Proposal) public proposalWithId;

    /**
     * @notice Returns number of proposals created by this contract 
     * @return Proposal count
     */
    uint256 public proposalCount;

    /**
     * @notice Returns the address of the registry used by this contract
     * @return Registry contract address
     */
    address public registryAddress;

    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        uint indexed dateClosed,
        uint256 payoutAmount,
        address payoutRecipient
    );

    enum Status { OPEN, ACCEPTED, REJECTED }

    struct Proposal {
        uint dateOpened;
        uint dateClosed;
        uint256 id;
        bytes32 link;
        uint256 payoutAmount;
        address payoutRecipient;
        address proposer;
        Status status;
        mapping(address => bytes32) voteCastBy; // (voter => voteHash)
        mapping(uint256 => address) voters; // (voteCount => voter)
        uint256 voteCount;
        uint256 yesCount;
    }

    modifier onlyAdmin() {
        (
            bool success,
            bytes memory encoded
        ) = registryAddress.call(abi.encodeWithSignature("hasAdminRole(address)", msg.sender));
        bool isAdmin = abi.decode(encoded, (bool));
        require(isAdmin, "Must be an admin");
        _;
    }

    modifier onlyPMs(address _address) {
        (
            bool success,
            bytes memory encoded
        ) = registryAddress.call(abi.encodeWithSignature("hasPMRole(address)", _address));
        bool isPM = abi.decode(encoded, (bool));
        require(isPM, "Must be a PM");
        _;
    }

    /**
     * @notice Sets the Registry contract for this contract to use
     * @param _registryAddress Address of Registry contract
     */
    constructor(address _registryAddress) public {
        registryAddress = _registryAddress;
    }

    /**
     * @notice Create a proposal to vote on (if caller is PM)
     * @notice Emits a ProposalCreated event
     * @param link Bytes representing url of proposal metadata
     * @param payoutAmount Funds from balance to send if this proposal passes
     * @param payoutRecipient Recipient of funds if this proposal passes
     * @return Id of the proposal
     */
    function createProposal(
        bytes32 link,
        uint256 payoutAmount,
        address payoutRecipient
    ) public onlyPMs(msg.sender) returns (uint256) {
        uint256 id = proposalCount + 1;

        // Because the struct includes a mapping it must be created using a
        // storage reference to ensure the assigned values get added to state.
        Proposal storage proposal = proposalWithId[id];
        proposal.id = id;
        proposal.status = Status.OPEN;
        proposal.proposer = msg.sender;

        uint dateOpened = block.timestamp;
        uint dateClosed = dateOpened + 3 weeks;
        proposal.dateOpened = dateOpened;
        proposal.dateClosed = dateClosed;

        proposal.link = link;
        proposal.payoutAmount = payoutAmount;
        proposal.payoutRecipient = payoutRecipient;

        proposalCount = id;

        emit ProposalCreated(
            id,
            msg.sender,
            dateClosed,
            payoutAmount,
            payoutRecipient
        );

        return proposalCount;
    }

    /**
     * @notice Adds a vote to the specified proposal and emits an event
     * @notice Emits a VoteCounted event
     * @param proposalId Id of proposal to vote on
     * @param yes True to vote in favor of accepting the proposal
     * @param voteHash TODO
     * @param nonce Random integer used to create vote hash
     * @return Updated vote count
     */
    function vote(
        uint256 proposalId,
        bool yes,
        bytes32 voteHash,
        uint256 nonce
    ) public onlyPMs(msg.sender) returns (uint256) {
        Proposal storage proposal = proposalWithId[proposalId];

        require(proposal.id > 0, "Proposal with specified id does not exist");
        require(proposal.dateClosed >= block.timestamp, "Voting period closed");
        require(voteHash != 0, "Vote hash is required");
        require(proposal.voteCastBy[msg.sender] == 0, "One vote per voter. Vote already cast.");

        uint256 currVoteCount = proposal.voteCount;
        uint256 nextVoteCount = currVoteCount + 1;
        // TODO: Check voteHash
        // address prevVoter = proposal.voters[currVoteCount]
        // _voteHash = keccak256(msg.sender, proposalId, yes, prevVoter, nonce);
        // require(voteHash == _voteHash, "Invalid `voteHash`");

        proposal.voteCastBy[msg.sender] = voteHash;
        if (yes) {
            uint256 currYesCount = proposal.yesCount;
            proposal.yesCount = currYesCount + 1;
        }
        proposal.voteCount = nextVoteCount;

        // TODO: Emit event

        return nextVoteCount;
    }
}
