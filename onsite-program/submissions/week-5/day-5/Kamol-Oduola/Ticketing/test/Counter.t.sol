// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {EventTicketing} from "../src/EventTicketing.sol";
import {TicketNft} from "../src/TicketNft.sol";
import {TicketToken} from "../src/TicketToken.sol";

contract EventTicketingTest is Test {
    EventTicketing public eventTicketing;
    TicketNft public ticketNft;
    TicketToken public ticketToken;

    address ownerAddr = address(this);
    address buyer = address(1);

    uint256 ticketPrice = 50;
    uint256 ticketSupply = 5;

    function setUp() public {
        // Deploy ERC20 and ERC721
        ticketToken = new TicketToken(10000); // Minted to msg.sender (this contract)
        ticketNft = new TicketNft();

        // Deploy EventTicketing with token and NFT addresses
        eventTicketing = new EventTicketing(address(ticketToken), address(ticketNft));

        // Transfer some ERC20 tokens to buyer
        ticketToken.transfer(buyer, 200);

        // Create ticket as owner
        eventTicketing.createTicket(ticketPrice, ticketSupply);
    }

    function test_buyTicket() public {
        // Buyer approves EventTicketing to spend tokens
        vm.startPrank(buyer);
        ticketToken.approve(address(eventTicketing), ticketPrice);

        // Buy ticket (ticketId = 1)
        eventTicketing.buyTicket(1);
        vm.stopPrank();

        // Assert NFT ownership
        assertEq(ticketNft.ownerOf(1), buyer);

        // Assert token balance changes
        assertEq(ticketToken.balanceOf(ownerAddr), 10000 - 200 + ticketPrice); // owner received ticket price
        assertEq(ticketToken.balanceOf(buyer), 200 - ticketPrice);
    }
}
