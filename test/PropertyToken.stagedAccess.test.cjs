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

  async function openSale(allowance) {
    await token.setPerPersonAllowance(0, allowance);
    await token.startFundingClock(0);
  }

  it("refuses purchases until the clock and allowance are set", async function () {
    await expect(token.mintTokens(0, countyBuyer.address, 1)).to.be.revertedWith(
      "Funding clock not started"
    );
    await token.startFundingClock(0);
    await expect(token.mintTokens(0, countyBuyer.address, 1)).to.be.revertedWith(
      "Per-person allowance not configured"
    );
  });

  it("gives county residents the full supply and blocks other tiers on day 0", async function () {
    await openSale(1000);
    await token.mintTokens(0, countyBuyer.address, 1000);
    expect(await token.balanceOf(countyBuyer.address, 0)).to.equal(1000);
    expect(await token.unsoldRemainder(0)).to.equal(0);

    await expect(token.mintTokens(0, stateBuyer.address, 1)).to.be.revertedWith(
      "Not eligible for current stage"
    );
    await expect(token.mintTokens(0, nationalBuyer.address, 1)).to.be.revertedWith(
      "Not eligible for current stage"
    );
  });

  it("rolls only the unsold remainder into later stages", async function () {
    await openSale(400);
    await token.mintTokens(0, countyBuyer.address, 100);
    expect(await token.unsoldRemainder(0)).to.equal(900);

    await increaseDays(90);
    expect(await token.stageOf(0)).to.equal(1);
    await expect(token.mintTokens(0, nationalBuyer.address, 1)).to.be.revertedWith(
      "Not eligible for current stage"
    );

    await token.mintTokens(0, stateBuyer.address, 400);
    await token.mintTokens(0, countyBuyer.address, 400);
    expect(await token.unsoldRemainder(0)).to.equal(100);

    await expect(token.mintTokens(0, stateBuyer.address, 1)).to.be.revertedWith(
      "Exceeds per-person allowance"
    );

    await increaseDays(90);
    expect(await token.stageOf(0)).to.equal(2);
    await token.mintTokens(0, nationalBuyer.address, 100);
    expect(await token.unsoldRemainder(0)).to.equal(0);
    await expect(token.mintTokens(0, nationalBuyer.address, 1)).to.be.revertedWith(
      "Exceeds unsold remainder"
    );
  });

  it("weights votes by residency and lets outside holders vote", async function () {
    await openSale(100);
    await token.mintTokens(0, countyBuyer.address, 100);
    await increaseDays(90);
    await token.mintTokens(0, stateBuyer.address, 100);
    await increaseDays(90);
    await token.mintTokens(0, nationalBuyer.address, 100);
    await token.mintTokens(0, outsider.address, 100);
    await token.setResidency(outsider.address, 3, false);

    expect(await token.getVotingPower(0, countyBuyer.address)).to.equal(150);
    expect(await token.getVotingPower(0, stateBuyer.address)).to.equal(100);
    expect(await token.getVotingPower(0, nationalBuyer.address)).to.equal(75);
    expect(await token.getVotingPower(0, outsider.address)).to.equal(75);
    expect(await token.getTotalWeightedVotingPower(0)).to.equal(150 + 100 + 75 + 75);
  });

  it("uses one 365-day lock and does not unlock on early completion or the TODO flags", async function () {
    await openSale(100);
    await token.mintTokens(0, countyBuyer.address, 50);
    await token.recordKYCVerification(countyBuyer.address, ethers.id("county-kyc"));
    await token.recordKYCVerification(stateBuyer.address, ethers.id("state-kyc"));

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
