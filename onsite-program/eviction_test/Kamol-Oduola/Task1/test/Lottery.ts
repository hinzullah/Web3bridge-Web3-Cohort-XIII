const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Lottery Contract", function () {
  async function deployLotteryFixture() {
    const [owner, ...players] = await ethers.getSigners();
    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy();
    return { lottery, owner, players };
  }

  it("Should deploy with initial round number = 1", async function () {
    const { lottery } = await loadFixture(deployLotteryFixture);
    expect(await lottery.getRoundNumber()).to.equal(1);
  });

  it("Should allow a participant to enter with correct cost", async function () {
    const { lottery, players } = await loadFixture(deployLotteryFixture);

    await expect(
      lottery
        .connect(players[0])
        .enterLottery({ value: ethers.parseEther("0.01") })
    )
      .to.emit(lottery, "ParticipantEntered")
      .withArgs(players[0].address, 1, 1);

    expect(await lottery.getParticipantCount()).to.equal(1);
    expect(await lottery.getRewardPool()).to.equal(ethers.parseEther("0.01"));
    expect(await lottery.hasParticipantEntered(players[0].address)).to.be.true;
  });

  it("Should revert if incorrect participation cost is sent", async function () {
    const { lottery, players } = await loadFixture(deployLotteryFixture);

    await expect(
      lottery
        .connect(players[0])
        .enterLottery({ value: ethers.parseEther("0.005") })
    ).to.be.revertedWithCustomError(lottery, "IncorrectParticipationCost");
  });

  it("Should revert if participant enters twice in same round", async function () {
    const { lottery, players } = await loadFixture(deployLotteryFixture);

    await lottery
      .connect(players[0])
      .enterLottery({ value: ethers.parseEther("0.01") });

    await expect(
      lottery
        .connect(players[0])
        .enterLottery({ value: ethers.parseEther("0.01") })
    ).to.be.revertedWithCustomError(lottery, "AlreadyEntered");
  });

  it("Should auto-select champion after 10 participants", async function () {
    const { lottery, players } = await loadFixture(deployLotteryFixture);

    const participants = players.slice(0, 10);

    for (let i = 0; i < 9; i++) {
      await lottery
        .connect(participants[i])
        .enterLottery({ value: ethers.parseEther("0.01") });
    }

    // last participant triggers champion selection
    await expect(
      lottery
        .connect(participants[9])
        .enterLottery({ value: ethers.parseEther("0.01") })
    ).to.emit(lottery, "ChampionSelected");

    expect(await lottery.getParticipantCount()).to.equal(0); // reset
    expect(await lottery.getRewardPool()).to.equal(0);
    expect(await lottery.getRoundNumber()).to.equal(2);
  });

  it("Should revert if trying to enter after round is full", async function () {
    const { lottery, players } = await loadFixture(deployLotteryFixture);

    const participants = players.slice(0, 10);

    for (let i = 0; i < 10; i++) {
      await lottery
        .connect(participants[i])
        .enterLottery({ value: ethers.parseEther("0.01") });
    }

    await expect(
      lottery
        .connect(players[11])
        .enterLottery({ value: ethers.parseEther("0.01") })
    ).to.be.revertedWithCustomError(lottery, "RoundFull");
  });

  it("Should track contract balance correctly", async function () {
    const { lottery, players } = await loadFixture(deployLotteryFixture);

    await lottery
      .connect(players[0])
      .enterLottery({ value: ethers.parseEther("0.01") });
    await lottery
      .connect(players[1])
      .enterLottery({ value: ethers.parseEther("0.01") });

    expect(await lottery.getContractBalance()).to.equal(
      ethers.parseEther("0.02")
    );
  });
});
