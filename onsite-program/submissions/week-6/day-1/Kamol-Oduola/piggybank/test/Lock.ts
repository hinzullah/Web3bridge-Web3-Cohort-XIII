import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Piggybank", function () {
  async function deployPiggybankFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const depositAmount = hre.ethers.parseEther("1");
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const [owner, otherAccount] = await hre.ethers.getSigners();

    const Piggybank = await hre.ethers.getContractFactory("Piggybank");
    const piggybank = await Piggybank.deploy(unlockTime);

    // Mock ERC20 token for testing
    const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
    const token = await ERC20Mock.deploy(
      "TestToken",
      "TT",
      owner.address,
      hre.ethers.parseEther("1000")
    );

    return { piggybank, token, unlockTime, depositAmount, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { piggybank, unlockTime } = await loadFixture(
        deployPiggybankFixture
      );
      expect(await piggybank.unlockTime()).to.equal(unlockTime);
    });

    it("Should set the right owner", async function () {
      const { piggybank, owner } = await loadFixture(deployPiggybankFixture);
      expect(await piggybank.owner()).to.equal(owner.address);
    });
  });

  describe("ETH Deposits", function () {
    it("Should receive ETH deposits", async function () {
      const { piggybank, depositAmount } = await loadFixture(
        deployPiggybankFixture
      );
      await piggybank.depositETH({ value: depositAmount });
      expect(await hre.ethers.provider.getBalance(piggybank.target)).to.equal(
        depositAmount
      );
    });
  });

  describe("ERC20 Deposits", function () {
    it("Should receive ERC20 token deposits", async function () {
      const { piggybank, token, owner } = await loadFixture(
        deployPiggybankFixture
      );
      await token.approve(piggybank.target, hre.ethers.parseEther("10"));
      await piggybank.depositToken(token.target, hre.ethers.parseEther("10"));
      expect(await token.balanceOf(piggybank.target)).to.equal(
        hre.ethers.parseEther("10")
      );
    });
  });

  describe("Withdrawals", function () {
    describe("ETH Withdrawals", function () {
      it("Should revert if called too soon", async function () {
        const { piggybank, depositAmount } = await loadFixture(
          deployPiggybankFixture
        );
        await piggybank.depositETH({ value: depositAmount });
        await expect(piggybank.withdrawETH()).to.be.revertedWith(
          "You can't withdraw yet"
        );
      });

      it("Should revert if called from another account", async function () {
        const { piggybank, unlockTime, depositAmount, otherAccount } =
          await loadFixture(deployPiggybankFixture);
        await piggybank.depositETH({ value: depositAmount });
        await time.increaseTo(unlockTime);
        await expect(
          piggybank.connect(otherAccount).withdrawETH()
        ).to.be.revertedWith("You aren't the owner");
      });

      it("Should transfer ETH to owner after unlock", async function () {
        const { piggybank, unlockTime, depositAmount, owner } =
          await loadFixture(deployPiggybankFixture);
        await piggybank.depositETH({ value: depositAmount });
        await time.increaseTo(unlockTime);
        await expect(piggybank.withdrawETH()).to.changeEtherBalances(
          [owner, piggybank],
          [depositAmount, -depositAmount]
        );
      });
    });

    describe("ERC20 Withdrawals", function () {
      it("Should revert if called too soon", async function () {
        const { piggybank, token } = await loadFixture(deployPiggybankFixture);
        await token.approve(piggybank.target, hre.ethers.parseEther("10"));
        await piggybank.depositToken(token.target, hre.ethers.parseEther("10"));
        await expect(piggybank.withdrawToken(token.target)).to.be.revertedWith(
          "You can't withdraw yet"
        );
      });

      it("Should revert if called from another account", async function () {
        const { piggybank, token, unlockTime, otherAccount } =
          await loadFixture(deployPiggybankFixture);
        await token.approve(piggybank.target, hre.ethers.parseEther("10"));
        await piggybank.depositToken(token.target, hre.ethers.parseEther("10"));
        await time.increaseTo(unlockTime);
        await expect(
          piggybank.connect(otherAccount).withdrawToken(token.target)
        ).to.be.revertedWith("You aren't the owner");
      });

      it("Should transfer ERC20 tokens to owner after unlock", async function () {
        const { piggybank, token, unlockTime, owner } = await loadFixture(
          deployPiggybankFixture
        );
        await token.approve(piggybank.target, hre.ethers.parseEther("10"));
        await piggybank.depositToken(token.target, hre.ethers.parseEther("10"));
        await time.increaseTo(unlockTime);
        await piggybank.withdrawToken(token.target);
        expect(await token.balanceOf(owner.address)).to.equal(
          hre.ethers.parseEther("1000")
        );
      });
    });
  });
});
