const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("PropertyToken", function () {
  let PropertyToken, propertyToken, Escrow, escrow, owner, buyer1, buyer2, treasury;

  beforeEach(async function () {
    [owner, buyer1, buyer2, treasury] = await ethers.getSigners();

    PropertyToken = await ethers.getContractFactory("PropertyToken");
    propertyToken = await PropertyToken.deploy("https://example.com/{id}.json");
    await propertyToken.waitForDeployment();

    Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(await propertyToken.getAddress());
    await escrow.waitForDeployment();

    // Grant roles
    await propertyToken.grantRole(await propertyToken.MINTER_ROLE(), await escrow.getAddress());
    await propertyToken.grantRole(await propertyToken.BURNER_ROLE(), await escrow.getAddress());
    await propertyToken.addToWhitelist(buyer1.address, 0); // County eligible
    await propertyToken.addToWhitelist(buyer2.address, 1); // State eligible
  });

  it("Should mint tokens correctly", async function () {
    await propertyToken.createProperty("Test Property", "", 10000, ethers.parseEther("1000"), 30 * 24 * 3600);

    await escrow.initializeEscrow(0, ethers.parseEther("1000"), Math.floor(Date.now() / 1000) + 86400);

    const price = await propertyToken.getCurrentPrice(0);
    await escrow.connect(buyer1).purchase(0, 100, { value: price * 100n });

    expect(await propertyToken.balanceOf(buyer1.address, 0)).to.equal(100);
  });

  it("Should burn tokens on escrow failure", async function () {
    await propertyToken.createProperty("Fail Property", "", 10000, ethers.parseEther("9999"), 1); // short deadline

    await escrow.initializeEscrow(0, ethers.parseEther("9999"), Math.floor(Date.now() / 1000) + 1);

    const price = await propertyToken.getCurrentPrice(0);
    await escrow.connect(buyer1).purchase(0, 50, { value: price * 50n });

    // Fast forward time
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    // Process refund + burn
    await escrow.processRefunds(0);

    expect(await propertyToken.balanceOf(buyer1.address, 0)).to.equal(0);
  });

  it("Should block transfers during funding period", async function () {
    await propertyToken.createProperty("Transfer Test", "", 10000, ethers.parseEther("100"), 86400);

    await escrow.initializeEscrow(0, ethers.parseEther("100"), Math.floor(Date.now() / 1000) + 86400);
    await propertyToken.grantRole(await propertyToken.MINTER_ROLE(), owner.address);

    // Mint directly (simulate escrow purchase)
    await propertyToken.mintTokens(0, buyer1.address, 200);

    // During funding: transfer should fail even to whitelisted addresses
    await expect(
      propertyToken.connect(buyer1).safeTransferFrom(buyer1.address, buyer2.address, 0, 100, "0x")
    ).to.be.revertedWith("Transfers locked during funding");

    // Mark funded
    await propertyToken.markFunded(0);

    // Now transfer should succeed (buyer2 is whitelisted)
    await propertyToken.connect(buyer1).safeTransferFrom(buyer1.address, buyer2.address, 0, 100, "0x");
    expect(await propertyToken.balanceOf(buyer2.address, 0)).to.equal(100);
  });

  it("Should track holdings by phase correctly", async function () {
    await propertyToken.createProperty("Phase Test", "", 10000, ethers.parseEther("100"), 86400);
    await propertyToken.grantRole(await propertyToken.MINTER_ROLE(), owner.address);

    // Mint in County phase
    await propertyToken.mintTokens(0, buyer1.address, 100);

    // Check holdings tracked by phase
    const countyHoldings = await propertyToken.holdingsByPhase(0, buyer1.address, 0); // Phase 0 = County
    expect(countyHoldings).to.equal(100);
  });

  it("Should calculate voting power with phase multipliers", async function () {
    await propertyToken.createProperty("Voting Test", "", 10000, ethers.parseEther("100"), 86400);
    await propertyToken.grantRole(await propertyToken.MINTER_ROLE(), owner.address);

    // Mint 100 tokens in County phase (1.5x multiplier)
    await propertyToken.mintTokens(0, buyer1.address, 100);

    const votingPower = await propertyToken.getVotingPower(0, buyer1.address);
    // 100 tokens * 15000 / 10000 = 150 voting power
    expect(votingPower).to.equal(150);
  });
});
