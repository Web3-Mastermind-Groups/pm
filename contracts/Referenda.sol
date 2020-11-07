// SPDX-License-Identifier: MIT
pragma solidity >=0.7.4 <0.8.0;

contract Referenda {
    address public admin;
    string public name = "Web3 Mastermind Groups PM Referenda";

    modifier onlyAdmin () {
        require(msg.sender == admin);
        _;
    }

    modifier onlyPMs () {
        _;
    }

    constructor() {
        admin = msg.sender;
    }
}
