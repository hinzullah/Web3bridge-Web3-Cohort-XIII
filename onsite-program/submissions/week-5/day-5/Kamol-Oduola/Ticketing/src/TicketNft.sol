// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721}from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract TicketNft is ERC721 {
    uint256 public nextId;

    constructor() ERC721("EventTicketNFT", "ETN") {}

    function mint(address to, uint256 ticketType) external returns (uint256) {
        nextId++;
        _mint(to, nextId);
        return nextId;
    }
}