// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more: https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MembershipNFTModule = buildModule("MembershipNFTModule", (m) => {
  const membership = m.contract("MembershipNFT");
  const simpleERC7432 = m.contract("SimpleERC7432");
  const gatedDao = m.contract("GatedDAO", [simpleERC7432, membership]);

  return { membership, gatedDao, simpleERC7432 };
});

export default MembershipNFTModule;
