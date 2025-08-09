// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./TicketToken.sol";
import "./TicketNft.sol";
import {Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicketing is Ownable{
    TicketToken public token;
    TicketNft public nft;
    


    struct TicketDetails {
        uint256 id;
        uint256 ticket_price;
        uint256 ticket_supply;
        uint256 sold;
    }

    mapping(uint256 => TicketDetails) public tickets;
    uint256 public ticketCount;

    event TicketCreated(uint256 id, uint256 ticket_price, uint256 ticket_supply);
    event TicketBought(address buyer, uint256 ticketId, uint256 nftId);

    constructor(address _token, address _nft) Ownable(msg.sender){
        token = TicketToken(_token);
        nft = TicketNft(_nft);
    }

    function createTicket(uint256 _ticket_price, uint256 _ticket_supply) external onlyOwner {
        require(_ticket_price > 0 , "Ticket price must be greater than 0");
        require(_ticket_supply > 0, "Ticket supply must be greater than 0");

        ticketCount++;
        tickets[ticketCount] = TicketDetails(ticketCount, _ticket_price, _ticket_supply, 0);

        emit TicketCreated(ticketCount, _ticket_price, _ticket_supply);

    }

    function buyTicket(uint256 ticketId) external {
        TicketDetails storage t = tickets[ticketId];

        require(t.id != 0, "Ticket type does not exist");
        require(t.sold < t.ticket_supply, "Sold out");

        // Transfer ERC20 tokens from buyer to owner
        require(token.transferFrom(msg.sender, owner(), t.ticket_price), "Payment failed");

        // Mint the NFT to buyer
        uint256 nftId = nft.mint(msg.sender, ticketId);

        t.sold++;

        emit TicketBought(msg.sender, ticketId, nftId);
    }
}
