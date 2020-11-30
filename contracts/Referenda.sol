// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
// ABIEncoderV2 is not considered experimental as of Solidity 0.6.0
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Registry.sol";

/**
 * @title Web3 Mastermind Groups PM Referenda
 * @author valmack2020@gmail.com
 * @notice Web3MG PMs can create and vote on proposals
 */
contract Referenda {
    using SafeMath for uint256;

    /**
     * @notice Returns the descriptive name of this contract
     * @return Name
     */
    string public constant name = "Web3 Mastermind Groups PM Referenda";

    /**
     * @notice Returns the address of the registry used by this contract
     * @return Registry contract address
     */
    uint8 public constant MAX_VOTES_PER_TALLY = 100;

    /**
     * @notice Returns true if contract functionality is stopped
     * @return Stopped
     */
    bool public stopped = false;

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

    /**
     * @notice Returns number of minutes a proposal is open for voting
     * @return Number of minutes
     */
    uint256 public votingPeriodMinutes;

    /**
     * @notice Returns the bytes of the proposal with the given id
     * @return Bytes representing the proposal
     */
    mapping(uint256 => Proposal) public proposalWithId;

    enum Status { OPEN, ACCEPTED, REJECTED }

    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        uint indexed dateClosed,
        uint256 payoutAmount,
        address payoutRecipient
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 indexed voteCount
    );

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
        mapping(uint256 => address) voterWithId; // (voteCount => voter)
        mapping(address => uint8) voteTalliedFor; // (voter => true/false)
        mapping(address => uint8) voteInvalidFor; // (voter => true/false)
        uint256 voteCount;
        uint256 talliedCount;
        uint256 invalidCount;
        uint256 yesCount;
    }


    modifier stopInEmergency {
        require(!stopped);
        _;
    }

    modifier onlyInEmergency {
        require(stopped);
        _;
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
     * @param _votingPeriodMinutes Amount of minutes that each proposal is open for voting
     */
    constructor(address _registryAddress, uint256 _votingPeriodMinutes) public {
        registryAddress = _registryAddress;
        votingPeriodMinutes = _votingPeriodMinutes;
    }

    /**
     * @notice Returns hash of vote cast
     * @param proposalId Id of proposal to retrieve vote hash from
     * @param voter Address of voter to retrieve vote hash for
     */
    function getProposalVote(uint256 proposalId, address voter) public view returns(bytes32) {
        Proposal storage proposal = proposalWithId[proposalId];

        require(proposal.id > 0, "Proposal with given proposalId was not found");
        return proposal.voteCastBy[voter];
    }

    /**
     * @notice Returns address of voter
     * @param proposalId Id of proposal to retrieve voter address from
     * @param voterId Id of voter for this proposal
     */
    function getProposalVoterById(uint256 proposalId, uint256 voterId) public view returns(address) {
        Proposal storage proposal = proposalWithId[proposalId];

        require(proposal.id > 0, "Proposal with given proposalId was not found");
        return proposal.voterWithId[voterId];
    }

    /**
     * @notice Returns 1 if the voter's vote has been tallied, 0 otherwise
     * @param proposalId Id of proposal to check tally for
     * @param voter Address of voter to check tally for
     */
    function getProposalTalliedVoteByVoter(uint256 proposalId, address voter) public view returns(uint8) {
        Proposal storage proposal = proposalWithId[proposalId];

        require(proposal.id > 0, "Proposal with given proposalId was not found");
        return proposal.voteTalliedFor[voter];
    }

    /**
     * @notice Returns 1 if the voter's vote was found to be invalid, 0 otherwise
     * @param proposalId Id of proposal to check invalid vote for
     * @param voter Address of voter to check invalid vote for
     */
    function getProposalInvalidVoteByVoter(uint256 proposalId, address voter) public view returns(uint8) {
        Proposal storage proposal = proposalWithId[proposalId];

        require(proposal.id > 0, "Proposal with given proposalId was not found");
        return proposal.voteInvalidFor[voter];
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
    ) public onlyPMs(msg.sender) stopInEmergency returns (uint256) {
        uint256 id = proposalCount + 1;

        // Because the struct includes a mapping it must be created using a
        // storage reference to ensure the assigned values get added to state.
        Proposal storage proposal = proposalWithId[id];
        proposal.id = id;
        proposal.status = Status.OPEN;
        proposal.proposer = msg.sender;

        uint dateOpened = block.timestamp;
        uint dateClosed = dateOpened + votingPeriodMinutes.mul(60);
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
     * @notice Removes proposal with id `proposalId`
     * @dev This does not affect any other proposal and does not modify `proposalCount`
     */
    function removeProposal(uint256 proposalId) public onlyAdmin onlyInEmergency {
        delete proposalWithId[proposalId];
    }

    /**
     * @notice Adds a vote to the specified proposal and emits an event
     * @notice Emits a VoteCounted event
     * @param proposalId Id of proposal to vote on
     * @param voteHash TODO
     * @return Updated vote count
     */
    function vote(
        uint256 proposalId,
        bytes32 voteHash
    ) public onlyPMs(msg.sender) stopInEmergency returns (uint256) {
        require(proposalId > 0, "Invalid proposalId. Can not be 0.");
        require(voteHash != bytes32(0), "Vote hash is required");

        Proposal storage proposal = proposalWithId[proposalId];

        require(proposal.id > 0, "Proposal with specified id does not exist");
        require(proposal.dateClosed >= block.timestamp, "Voting period closed");
        require(proposal.voteCastBy[msg.sender] == 0, "One vote per voter. Vote already cast.");

        uint256 nextVoteCount = proposal.voteCount + 1;
        proposal.voterWithId[nextVoteCount] = msg.sender;
        proposal.voteCastBy[msg.sender] = voteHash;
        proposal.voteCount = nextVoteCount;

        emit VoteCast(proposalId, msg.sender, proposal.voteCount);

        return nextVoteCount;
    }

    /**
     * @notice Tallies the votes of `voterIds`
     * @notice Emits a VotesTallied event
     * @dev Either explicitly or just due to normal operation, the number of
     * iterations in a loop can grow beyond the block gas limit which can cause
     * the complete contract to be stalled at a certain point.
     * @param proposalId Id of proposal to tally votes for
     * @param voterIds TODO
     * @param nonces TODO
     * @param voteHashes TODO
     */
    function tallyVotes(
        uint256 proposalId,
        uint256[] calldata voterIds,
        uint256[][] calldata nonces,
        bytes32[] calldata voteHashes
    ) public {
        require(proposalId > 0, "Invalid proposalId. Can not be 0.");
        require(voterIds.length > 0, "Number of voterIds must be greater than 0");
        require(voterIds.length < MAX_VOTES_PER_TALLY + 1, "Too many votes to tally in one call");
        require(voterIds.length == nonces.length, "Number of voterIds does not match number of nonces");
        require(voterIds.length == voteHashes.length, "Number of voterIds does not match number of voteHashes");

        Proposal storage proposal = proposalWithId[proposalId];

        require(proposal.id > 0, "Proposal with specified id does not exist");
        require(proposal.dateClosed < block.timestamp, "Voting period must be closed");

        for (uint idx = 0; idx < voterIds.length; idx++) {
            uint256 voterId = voterIds[idx];
            address voterAddress = proposal.voterWithId[voterId];

            // If vote has not been tallied for this voter yet
            if (proposal.voteTalliedFor[voterAddress] == 0) {
                bytes32 voteHash = proposal.voteCastBy[voterAddress];
                require(voteHash == voteHashes[idx], "Provided voteHash does not match stored");

                uint256[] calldata voterNonces = nonces[idx];

                bytes32 hashForRejectVote = keccak256(abi.encodePacked(
                    proposalId,
                    voterAddress,
                    uint8(0),
                    voterNonces
                ));
                bytes32 hashForAcceptVote = keccak256(abi.encodePacked(
                    proposalId,
                    voterAddress,
                    uint8(1),
                    voterNonces
                ));

                proposal.voteTalliedFor[voterAddress] = 1;
                proposal.talliedCount++;
                if (voteHash == hashForRejectVote) {
                    // pass
                } else if (voteHash == hashForAcceptVote) {
                    proposal.yesCount++;
                } else {
                    proposal.voteInvalidFor[voterAddress] = 1;
                    proposal.invalidCount++;
                }
            }
        }
        // TODO: Emit VotesTallied(proposalId, proposal.talliedCount, remaining);
    }

    /**
     * @notice Sets stopped, disabling or enabling voting and proposal creation
     * @param _stopped True to disable functionality, false to enable it
     */
    function setStopped(bool _stopped) public onlyAdmin {
        stopped = _stopped;
    }

    /**
     * @notice Returns status of closed proposal (accepted or rejected)
     * @notice Emits a ProposalStatusUpdated event
     * @param proposalId Id of proposal to calculate outcome for
     * @return Status of proposal
     */
    function calculateOutcome(uint256 proposalId) public returns (Status) {
        Proposal storage proposal = proposalWithId[proposalId];
        require(proposal.status == Status.OPEN, "Outcome already calculated. Check proposal status.");
        return _calculateOutcome(proposal);
    }

    function _calculateOutcome(Proposal storage proposal) private returns (Status) {
        require(proposal.talliedCount == proposal.voteCount, "All votes must be tallied first");
        uint256 validVoteCount = proposal.voteCount - proposal.invalidCount;
        uint256 acceptanceCriteria = validVoteCount / 2;
        Status status;
        if (proposal.yesCount > acceptanceCriteria) {
            status = Status.ACCEPTED;
        } else {
            status = Status.REJECTED;
        }
        proposal.status = status;
        // TODO: Emit ProposalStatusUpdated(proposalId, status);
        return status;
    }
}
