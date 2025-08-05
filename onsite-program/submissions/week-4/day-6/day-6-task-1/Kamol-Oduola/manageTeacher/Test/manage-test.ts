import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("ManageTeacher Contract", function () {
  async function deployFixture() {
    const [admin, teacher1, teacher2] = await ethers.getSigners();

    const ContractFactory = await ethers.getContractFactory("ManageTeacher");
    const contract = await ContractFactory.deploy();

    return { contract, admin, teacher1, teacher2 };
  }

  it("Should set deployer as admin", async () => {
    const { contract, admin } = await loadFixture(deployFixture);
    expect(await contract.admin()).to.equal(admin.address);
  });

  it("Should allow admin to register a teacher", async () => {
    const { contract, teacher1 } = await loadFixture(deployFixture);

    await contract.regTeacher(teacher1.address, ethers.parseEther("1"));

    const teacher = await contract.getTeacher(teacher1.address);
    expect(teacher.salary).to.equal(ethers.parseEther("1"));
    expect(teacher.status).to.equal(0); // Status.Employed enum = 0
    expect(teacher.employed).to.equal(true);
    expect(teacher.exists).to.equal(true);
  });

  it("Should not allow non-admin to register a teacher", async () => {
    const { contract, teacher1 } = await loadFixture(deployFixture);

    await expect(
      contract.connect(teacher1).regTeacher(teacher1.address, 1000)
    ).to.be.revertedWithCustomError(contract, "NotAuthorised");
  });

  it("Should allow admin to update teacher status", async () => {
    const { contract, teacher1 } = await loadFixture(deployFixture);

    await contract.regTeacher(teacher1.address, 1000);
    await contract.updateTeacherStatus(teacher1.address, 1); // Status.OnLeave

    const teacher = await contract.getTeacher(teacher1.address);
    expect(teacher.status).to.equal(1); // OnLeave
  });

  it("Should revert if updating status for non-existing teacher", async () => {
    const { contract, teacher1 } = await loadFixture(deployFixture);

    await expect(
      contract.updateTeacherStatus(teacher1.address, 2)
    ).to.be.revertedWithCustomError(contract, "TeacherNotFound");
  });

  it("Should allow admin to pay teacher", async () => {
    const { contract, admin, teacher1 } = await loadFixture(deployFixture);

    const salary = ethers.parseEther("1");
    await contract.regTeacher(teacher1.address, salary);

    // Send Ether to contract first
    await admin.sendTransaction({
      to: contract.getAddress(),
      value: ethers.parseEther("5"),
    });

    const beforeBalance = await ethers.provider.getBalance(teacher1.address);

    const tx = await contract.payTeacher(teacher1.address);
    const receipt = await tx.wait();

    const afterBalance = await ethers.provider.getBalance(teacher1.address);

    expect(afterBalance - beforeBalance).to.equal(salary);
  });
});
