// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/AccessControl.sol";


contract Registry is AccessControl {
    string public constant name = "Web3 Mastermind Groups PM Registry";

    bytes32 public constant PM_ROLE = keccak256("PM_ROLE");

    constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function hasPMRole(address _address) public view returns (bool) {
        return hasRole(PM_ROLE, _address);
    }

    function hasAdminRole(address _address) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, _address);
    }
}
