const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");

describe("ERC20", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployErc20() {
    // Contracts are deployed using the first signer/account by default
    const [owner, address_from, address_to] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("ERC20");
    const token = await ERC20.deploy();

    return { token, owner, address_from, address_to };
  }

  describe("Deployment", function () {
    //Should have correct token data
    it("Should have correct token data", async function () {
      const { token } = await loadFixture(deployErc20);

      expect(await token.name()).to.equal("EBA");
      expect(await token.symbol()).to.equal("Garri");
      expect(await token.decimals()).to.equal(18);
    });

    //Should assign total supply to owner
    it("Should assign total supply to owner", async function () {
      const { token, owner } = await loadFixture(deployErc20);
      const totalSupply = await token.totalSupply();
      const ownerBalance = await token.balanceOf(owner.address);

      expect(ownerBalance).to.equal(totalSupply);
      expect(totalSupply).to.equal(1000000);
    });

    //checking for owner balance
    it("Should get the balance of the owner", async function () {
      const { token, owner } = await loadFixture(deployErc20);

      const balance = await token.balanceOf(owner.address);
      expect(balance).to.equal(1000000n);
    });

    //to approve a transaction by the owner or spender
    it("Should approve a transaction by the owner or spender", async function () {
      const { token, owner, address_from, address_to } = await loadFixture(
        deployErc20
      );
      await token.approve(address_from, 1000n);
      expect(await token.allowance(owner.address, address_from.address));

      await token
        .connect(address_from, 1000)
        .transferFrom(owner.address, address_to.address, 500);
      expect(await token.balanceOf(address_to)).to.equal(500);
    });

    //Should not allow transfer of more than balance
    it("Should not allow transfer of more than balance", async function () {
      const { token, address_from } = await loadFixture(deployErc20);

      await expect(
        token.connect(address_from).transfer(address_from.address, 1)
      ).to.be.revertedWith("Insufficient balance");
    });

    //it should approve and update approval
    it("Should approve and update approval ", async function () {
      const { token, owner, address_from } = await loadFixture(deployErc20);

      await token.approve(address_from.address, 1000n);
      expect(
        await token.allowance(owner.address, address_from.address)
      ).to.equal(1000n);
    });
    //Should emit Transfer event
    it("Should emit Transfer event", async () => {
      const { token, address_from, owner } = await loadFixture(deployErc20);
      await expect(token.transfer(address_from.address, 500))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, address_from.address, 500);
    });
    //Should fail transferFrom without enough allowance
    it("Should fail transferFrom without enough allowance", async function () {
      const { token, owner, address_from, address_to } = await loadFixture(
        deployErc20
      );

      // Send some tokens to address_from so balance isn't the reason it fails
      await token.transfer(address_from.address, 1000);

      // address_from tries to transferFrom without approval
      await expect(
        token
          .connect(address_to)
          .transferFrom(address_from.address, owner.address, 500)
      ).to.be.revertedWith("Not allowed");
    });
  });
});
