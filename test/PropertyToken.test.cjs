const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("PropertyToken", function () {
  let propertyToken, escrow, owner, buyer1, buyer2;

  beforeEach(async function () {
    [owner, buyer1, buyer2] = await ethers.getSigners();

    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    propertyToken = await PropertyToken.deploy("https://example.com/{id}.json");
    await propertyToken.waitForDeployment();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(await propertyToken.getAddress(), owner.address);
    await escrow.waitForDeployment();

    await propertyToken.grantRole(await propertyToken.MINTER_ROLE(), await escrow.getAddress());
    await propertyToken.grantRole(await propertyToken.BURNER_ROLE(), await escrow.getAddress());
    await propertyToken.grantRole(await propertyToken.MINTER_ROLE(), owner.address);
    await propertyToken.addToWhitelist(buyer1.address, 0);
    await propertyToken.addToWhitelist(buyer2.address, 1);
  });

  async function createOpenProperty(name, supply, target) {
    await propertyToken.createProperty(name, "", supply, target, "GA-LLC-1", owner.address);
    await propertyToken.setPerPersonAllowance(0, supply);
    await propertyToken.startFundingClock(0);
  }

  it("Should mint tokens correctly", async function () {
    const target = ethers.parseEther("1000");
    await createOpenProperty("Test Property", 10000, target);

    const block = await ethers.provider.getBlock("latest");
    await escrow.initializeEscrow(0, target, block.timestamp + 86400, 0);

    const price = await propertyToken.getCurrentPrice(0);
    await escrow.connect(buyer1).purchase(0, 100, { value: price * 100n });

    expect(await propertyToken.balanceOf(buyer1.address, 0)).to.equal(100);
  });

  it("Should burn tokens on escrow failure", async function () {
    const target = ethers.parseEther("9999");
    await createOpenProperty("Fail Property", 10000, target);

    const block = await ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 60;
    await escrow.initializeEscrow(0, target, deadline, 0);

    const price = await propertyToken.getCurrentPrice(0);
    await escrow.connect(buyer1).purchase(0, 50, { value: price * 50n });
    expect(await propertyToken.balanceOf(buyer1.address, 0)).to.equal(50);

    await owner.sendTransaction({ to: await escrow.getAddress(), value: ethers.parseEther("1") });
    await network.provider.send("evm_increaseTime", [120]);
    await network.provider.send("evm_mine");

    await escrow.processRefunds(0);
    expect(await propertyToken.balanceOf(buyer1.address, 0)).to.equal(0);
  });

  it("keeps shares locked through the common funding period", async function () {
    await createOpenProperty("Transfer Test", 10000, ethers.parseEther("100"));
    await propertyToken.mintTokens(0, buyer1.address, 200);
    await propertyToken.recordKYCVerification(buyer1.address, ethers.id("buyer-1"));
    await propertyToken.recordKYCVerification(buyer2.address, ethers.id("buyer-2"));

    await expect(
      propertyToken.connect(buyer1).safeTransferFrom(buyer1.address, buyer2.address, 0, 100, "0x")
    ).to.be.revertedWith("Transfers locked through common funding period");

    await propertyToken.markFunded(0);
    await expect(
      propertyToken.connect(buyer1).safeTransferFrom(buyer1.address, buyer2.address, 0, 100, "0x")
    ).to.be.revertedWith("Transfers locked through common funding period");
  });

  it("Should track holdings by the purchase stage", async function () {
    await createOpenProperty("Phase Test", 10000, ethers.parseEther("100"));
    await propertyToken.mintTokens(0, buyer1.address, 100);
    expect(await propertyToken.holdingsByPhase(0, buyer1.address, 0)).to.equal(100);
  });

  it("Should calculate voting power from county residency", async function () {
    await createOpenProperty("Voting Test", 10000, ethers.parseEther("100"));
    await propertyToken.mintTokens(0, buyer1.address, 100);
    expect(await propertyToken.getVotingPower(0, buyer1.address)).to.equal(150);
  });
});
