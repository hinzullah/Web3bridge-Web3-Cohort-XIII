// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interface/IERC7432.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";


interface IMINT{
    function mint(address to) external ;
}

contract GatedDAO {

    IERC7432 public roleContract;
    address public membershipNFT;
    bytes32 public constant VOTER_ROLE = keccak256("VOTER");

    string[] public proposals;
    mapping(uint256 => uint256) public votes;

    constructor(address _roleContract, address _membershipNFT) {
    roleContract = IERC7432(_roleContract);
    membershipNFT = _membershipNFT;
    }

    function initializeMembership(address to) external {
        IMINT(membershipNFT).mint(to);
    }

    modifier onlyVoter(uint256 tokenId) {
        require(
            roleContract.hasRole(
                VOTER_ROLE,
                membershipNFT,
                tokenId,
                membershipNFT,
                msg.sender
            ),
            "Not authorized: Missing voter role"
        );
        _;
    }

    function createProposal(string memory description, uint256 tokenId) external onlyVoter(tokenId) {
        proposals.push(description);
    }

    function vote(uint256 proposalId, uint256 tokenId) external onlyVoter(tokenId) {
        require(proposalId < proposals.length, "Invalid proposal");
        votes[proposalId] += 1;
    }

    function getProposals() external view returns (string[] memory) {
        return proposals;
    }
}
