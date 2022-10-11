// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Whitelist {
    uint8 public maxWhiteListedAddresses;

    // no of addresses whitelisted till now
    uint8 public numAddressesWhiteListed;

    mapping(address => bool) public whiteListedAddresses;

    constructor(uint8 _maxWhiteListedAddresses) {
        maxWhiteListedAddresses = _maxWhiteListedAddresses;
    }

    function addAddressToWhiteList() public {
        require(
            !whiteListedAddresses[msg.sender],
            "Sender already in the whitelist"
        );
        require(
            numAddressesWhiteListed < maxWhiteListedAddresses,
            "Max limit Reached"
        );
        whiteListedAddresses[msg.sender] = true;
        numAddressesWhiteListed += 1;
    }
}
