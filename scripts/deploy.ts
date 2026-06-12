import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy PropertyToken (ERC-1155)
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy();
  await propertyToken.waitForDeployment();
  const propertyTokenAddress = await propertyToken.getAddress();
  console.log("PropertyToken deployed to:", propertyTokenAddress);

  // 2. Deploy Escrow (core for 1% founder economics + quarterly automation)
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(propertyTokenAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("Escrow deployed to:", escrowAddress);

  // 3. Deploy PhaseManager
  const PhaseManager = await ethers.getContractFactory("PhaseManager");
  const phaseManager = await PhaseManager.deploy();
  await phaseManager.waitForDeployment();
  const phaseManagerAddress = await phaseManager.getAddress();
  console.log("PhaseManager deployed to:", phaseManagerAddress);

  // 4. Deploy Governance
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy();
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("Governance deployed to:", governanceAddress);

  // 5. Deploy Treasury (update signers for production)
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(deployer.address, deployer.address, deployer.address);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("Treasury deployed to:", treasuryAddress);

  const deploymentInfo = {
    network: "base-sepolia", // Change to base-mainnet for production
    chainId: 84532,
    deployer: deployer.address,
    contracts: {
      propertyToken: propertyTokenAddress,
      escrow: escrowAddress,
      phaseManager: phaseManagerAddress,
      governance: governanceAddress,
      treasury: treasuryAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  console.log("\n=== Deployment Complete ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // TODO: Save to deployments/ folder or update frontend addresses
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
