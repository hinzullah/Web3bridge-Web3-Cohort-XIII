import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "ethers";

describe("MultiSigWallet", function () {
  async function deployMultisigWallet() {
    const [owner1, owner2, owner3, owner4, recipient] =
      await hre.ethers.getSigners();

    const MultiSigWallet = await hre.ethers.getContractFactory(
      "MultiSigWallet"
    );
    const multisig = await MultiSigWallet.deploy(
      [owner1.address, owner2.address, owner3.address],
      2
    );
    return { multisig, owner1, owner2, owner3, recipient };
  }

  describe("submitTransaction", function () {
    it("should allow an owner to submit a transaction", async function () {
      const { multisig, owner1, recipient } = await loadFixture(
        deployMultisigWallet
      );

      const amount = hre.ethers.parseEther("1");

      await multisig
        .connect(owner1)
        .submitTransaction(recipient.address, amount);

      const txn = await multisig.transactions(0);

      expect(txn.to).to.equal(recipient.address);
      expect(txn.amount).to.equal(amount);
      expect(txn.approvals).to.equal(0);
      expect(txn.executed).to.equal(false);
    });
    it("should revert if a non-owner tries to submit a transaction", async function () {
      const { multisig, recipient } = await loadFixture(deployMultisigWallet);
      const [_, __, ___, notOwner] = await hre.ethers.getSigners();

      const amount = hre.ethers.parseEther("1");

      await expect(
        multisig.connect(notOwner).submitTransaction(recipient.address, amount)
      ).to.be.rejectedWith("Not an owner");
    });
  });
});
