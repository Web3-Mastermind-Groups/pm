// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Web3 Mastermind Groups PM Registry
 * @author valmack2020@gmail.com
 * @notice Maintains roles of accounts for the Web3MG organization
 */
contract Registry is AccessControl {

    /**
     * @notice Returns contract name
     * @return Name
     */
    string public constant name = "Web3 Mastermind Groups PM Registry";

    /**
     * @notice Returns bytes representation of PM_ROLE
     * @return Keccak256 hash as bytes32
     */
    bytes32 public constant PM_ROLE = keccak256("PM_ROLE");

    constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Returns true if the given address is registered as a PM, false otherwise
     * @return Bool
     */
    function hasPMRole(address _address) public view returns (bool) {
        return hasRole(PM_ROLE, _address);
    }

    /**
     * @notice Returns true if the given address is registered as an admin, false otherwise
     * @return Bool
     */
    function hasAdminRole(address _address) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, _address);
    }
}
