// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Web3bridgeModule = buildModule("Web3bridgeModule", (m) => {
  const web3bridge = m.contract("Web3bridge");

  return { web3bridge };
});

export default Web3bridgeModule;
