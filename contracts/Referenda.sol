// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./Registry.sol";


contract Referenda {
    string public constant name = "Web3 Mastermind Groups PM Referenda";

    event ProposalCreated(uint256 indexed id, address indexed proposer, uint indexed dateClosed);

    enum Status { OPEN, ACCEPTED, REJECTED }

    struct Proposal {
        uint dateOpened;
        uint dateClosed;
        uint256 id;
        bytes32 link;
        uint256 payoutAmount;
        address payoutRecipiet;
        address proposer;
        Status status;
        mapping(address => bytes32) voteCastBy;
        uint256 voteCount;
        uint256 yeaCount;
    }

    mapping(uint256 => Proposal) public proposalWithId;

    uint256 public proposalCount;

    address public registryAddress;

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

    constructor(address _registryAddress) public {
        registryAddress = _registryAddress;
    }

    function createProposal(bytes32 link, bytes32 script) public onlyPMs(msg.sender) returns (uint256) {
        uint256 id = proposalCount + 1;
        Proposal storage proposal = proposalWithId[id];
        proposal.id = id;

        proposal.proposer = msg.sender;

        uint dateOpened = block.timestamp;
        uint dateClosed = dateOpened + 3 weeks;
        proposal.dateOpened = dateOpened;
        proposal.dateClosed = dateClosed;

        proposal.link = link;
        proposal.script = script;
        proposal.status = Status.OPEN;

        proposalCount = id;

        emit ProposalCreated(id, msg.sender, dateClosed);

        return proposalCount;
    }
}
