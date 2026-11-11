const { expect } = require("chai");
const { ethers, network } = require("hardhat");

const DAY = 24 * 60 * 60;

async function increaseDays(days) {
  await network.provider.send("evm_increaseTime", [days * DAY]);
  await network.provider.send("evm_mine");
}

describe("PropertyToken staged access, votes, and common lock", function () {
  let token, owner, countyBuyer, stateBuyer, nationalBuyer, outsider;

  beforeEach(async function () {
    [owner, countyBuyer, stateBuyer, nationalBuyer, outsider] = await ethers.getSigners();
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    token = await PropertyToken.deploy("https://example.com/{id}.json");
    await token.waitForDeployment();

    await token.createProperty(
      "Cherokee Workshop",
      "",
      1000,
      ethers.parseEther("1000"),
      "GA-LLC-1",
      owner.address
    );
    await token.grantRole(await token.MINTER_ROLE(), owner.address);
    await token.addToWhitelist(countyBuyer.address, 0);
    await token.addToWhitelist(stateBuyer.address, 1);
    await token.addToWhitelist(nationalBuyer.address, 2);
    await token.addToWhitelist(outsider.address, 2);
  });

  async function verify(account, label) {
    await token.recordKYCVerification(account, ethers.id(label));
  }

  async function openCounty(adults) {
    await verify(countyBuyer.address, "county");
    await verify(stateBuyer.address, "state");
    await verify(nationalBuyer.address, "national");
    await verify(outsider.address, "outsider");
    await token.setAdultCensus(0, 0, adults, ethers.encodeBytes32String("CENSUS-PEP"), ethers.encodeBytes32String("2024"));
    await token.startFundingClock(0);
  }

  it("stays closed until the clock, KYC, and the open stage's adult count are set", async function () {
    await expect(token.mintTokens(0, countyBuyer.address, 1)).to.be.revertedWith(
      "Funding clock not started"
    );
    await token.startFundingClock(0);
    await expect(token.mintTokens(0, countyBuyer.address, 1)).to.be.revertedWith("KYC required");
    await verify(countyBuyer.address, "county");
    await expect(token.mintTokens(0, countyBuyer.address, 1)).to.be.revertedWith(
      "Adult count not set for this stage"
    );
    expect(await token.getVotingPower(0, countyBuyer.address)).to.equal(0);
  });

  it("floors the county share and blocks other tiers on day 0", async function () {
    await openCounty(30);
    expect(await token.stageAllowance(0, 0)).to.equal(33);
    await token.mintTokens(0, countyBuyer.address, 33);
    await expect(token.mintTokens(0, countyBuyer.address, 1)).to.be.revertedWith(
      "Exceeds per-person allowance"
    );
    await expect(token.mintTokens(0, stateBuyer.address, 1)).to.be.revertedWith(
      "Not eligible for current stage"
    );
    await expect(token.mintTokens(0, nationalBuyer.address, 1)).to.be.revertedWith(
      "Not eligible for current stage"
    );
  });

  it("lets earlier residents buy later allowances on top, from the unsold remainder", async function () {
    await openCounty(10);
    await token.mintTokens(0, countyBuyer.address, 100);
    expect(await token.unsoldRemainder(0)).to.equal(900);

    await increaseDays(90);
    await token.setAdultCensus(0, 1, 10, ethers.encodeBytes32String("CENSUS-PEP"), ethers.encodeBytes32String("2024"));
    expect(await token.stageOf(0)).to.equal(1);
    await expect(token.mintTokens(0, nationalBuyer.address, 1)).to.be.revertedWith(
      "Not eligible for current stage"
    );

    await token.mintTokens(0, stateBuyer.address, 90);
    await token.mintTokens(0, countyBuyer.address, 90);
    expect(await token.purchasedInStage(0, 0, countyBuyer.address)).to.equal(100);
    expect(await token.purchasedInStage(0, 1, countyBuyer.address)).to.equal(90);
    await expect(token.mintTokens(0, stateBuyer.address, 1)).to.be.revertedWith(
      "Exceeds per-person allowance"
    );

    await increaseDays(90);
    await token.setAdultCensus(0, 2, 8, ethers.encodeBytes32String("CENSUS-PEP"), ethers.encodeBytes32String("2024"));
    expect(await token.stageOf(0)).to.equal(2);
    expect(await token.unsoldRemainder(0)).to.equal(720);
    await token.mintTokens(0, nationalBuyer.address, 90);
    await token.mintTokens(0, stateBuyer.address, 90);
    await token.mintTokens(0, countyBuyer.address, 90);
    expect(await token.purchasedInStage(0, 2, nationalBuyer.address)).to.equal(90);
    expect(await token.stageAllowance(0, 2)).to.equal(90);
  });

  it("gives verified US holders their tier weight and zero weight without KYC", async function () {
    await openCounty(10);
    await token.mintTokens(0, countyBuyer.address, 100);
    await increaseDays(90);
    await token.setAdultCensus(0, 1, 10, ethers.encodeBytes32String("CENSUS-PEP"), ethers.encodeBytes32String("2024"));
    await token.mintTokens(0, stateBuyer.address, 90);
    await increaseDays(90);
    await token.setAdultCensus(0, 2, 10, ethers.encodeBytes32String("CENSUS-PEP"), ethers.encodeBytes32String("2024"));
    await token.mintTokens(0, nationalBuyer.address, 81);
    await token.mintTokens(0, outsider.address, 81);

    expect(await token.getVotingPower(0, countyBuyer.address)).to.equal(150);
    expect(await token.getVotingPower(0, stateBuyer.address)).to.equal(90);
    expect(await token.getVotingPower(0, nationalBuyer.address)).to.equal(60);
    expect(await token.getVotingPower(0, outsider.address)).to.equal(60);

    await token.revokeKYCVerification(outsider.address, "expired");
    expect(await token.getVotingPower(0, outsider.address)).to.equal(0);
    expect(await token.balanceOf(outsider.address, 0)).to.equal(81);
  });

  it("uses one 365-day lock and does not unlock on early completion or the TODO flags", async function () {
    await openCounty(20);
    await token.mintTokens(0, countyBuyer.address, 50);

    const propertyBefore = await token.getProperty(0);
    const start = propertyBefore.fundingClockStart;
    expect(propertyBefore.fundingDeadline).to.equal(start + 365n * BigInt(DAY));

    await token.markFunded(0);
    await expect(
      token.connect(countyBuyer).safeTransferFrom(
        countyBuyer.address,
        stateBuyer.address,
        0,
        10,
        "0x"
      )
    ).to.be.revertedWith("Transfers locked through common funding period");

    await token.setTransferExceptionsEnabled(true);
    await token.setPostPeriodTransfersEnabled(true);
    await expect(
      token.connect(countyBuyer).safeTransferFrom(
        countyBuyer.address,
        stateBuyer.address,
        0,
        10,
        "0x"
      )
    ).to.be.revertedWith("Transfers locked through common funding period");

    await increaseDays(365);
    await expect(
      token.connect(countyBuyer).safeTransferFrom(
        countyBuyer.address,
        stateBuyer.address,
        0,
        10,
        "0x"
      )
    ).to.be.revertedWith("Post-period liquidity policy undecided");

    expect(await token.isComplianceTransferAllowed(0, countyBuyer.address, stateBuyer.address)).to.equal(true);
    expect(await token.isTransferAllowed(0, countyBuyer.address, stateBuyer.address, 10)).to.equal(false);
  });
});
