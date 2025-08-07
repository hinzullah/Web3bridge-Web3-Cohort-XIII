// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Erc20.sol";

contract TokenFactory {
    address[] public allTokens;

    event TokenCreated(address indexed tokenAddress, string name, string symbol, uint256 supply, address creator);

    function createToken(string memory name, string memory symbol, uint256 supply) external returns (address) {
        ERC20 newToken = new ERC20(name, symbol, supply);
        allTokens.push(address(newToken));

        emit TokenCreated(address(newToken), name, symbol, supply, msg.sender);
        return address(newToken);
    }

    function getDeployedTokens() external view returns (address[] memory) {
        return allTokens;
    }
}
