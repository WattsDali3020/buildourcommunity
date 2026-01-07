/**
 * RevitaHub Contract Deployment Script
 * 
 * Deploys all core contracts in order:
 * 1. PropertyToken (ERC-1155)
 * 2. Escrow (with PropertyToken address)
 * 3. Governance (with PropertyToken address)
 * 4. PhaseManager (with PropertyToken and Governance addresses)
 * 
 * Then grants necessary roles between contracts.
 */

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 1. Deploy PropertyToken
  console.log("\n1. Deploying PropertyToken...");
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy("https://api.revitahub.com/metadata/{id}");
  await propertyToken.waitForDeployment();
  const propertyTokenAddress = await propertyToken.getAddress();
  console.log("   PropertyToken deployed to:", propertyTokenAddress);

  // 2. Deploy Escrow
  console.log("\n2. Deploying Escrow...");
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(propertyTokenAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("   Escrow deployed to:", escrowAddress);

  // 3. Deploy Governance
  console.log("\n3. Deploying Governance...");
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(propertyTokenAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("   Governance deployed to:", governanceAddress);

  // 4. Deploy PhaseManager
  console.log("\n4. Deploying PhaseManager...");
  const PhaseManager = await ethers.getContractFactory("PhaseManager");
  const phaseManager = await PhaseManager.deploy(propertyTokenAddress, governanceAddress);
  await phaseManager.waitForDeployment();
  const phaseManagerAddress = await phaseManager.getAddress();
  console.log("   PhaseManager deployed to:", phaseManagerAddress);

  // 5. Grant roles
  console.log("\n5. Granting roles...");
  
  // Grant MINTER_ROLE to Escrow (so it can mint tokens on purchase)
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  await propertyToken.grantRole(MINTER_ROLE, escrowAddress);
  console.log("   Granted MINTER_ROLE to Escrow");

  // Grant PHASE_ADVANCER_ROLE to PhaseManager (so it can advance phases)
  const PHASE_ADVANCER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PHASE_ADVANCER_ROLE"));
  await propertyToken.grantRole(PHASE_ADVANCER_ROLE, phaseManagerAddress);
  console.log("   Granted PHASE_ADVANCER_ROLE to PhaseManager");

  // Summary
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("PropertyToken:", propertyTokenAddress);
  console.log("Escrow:", escrowAddress);
  console.log("Governance:", governanceAddress);
  console.log("PhaseManager:", phaseManagerAddress);
  console.log("========================================");

  // Return addresses for verification/testing
  return {
    propertyToken: propertyTokenAddress,
    escrow: escrowAddress,
    governance: governanceAddress,
    phaseManager: phaseManagerAddress,
  };
}

main()
  .then((addresses) => {
    console.log("\nContract addresses exported for frontend configuration.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
