const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy PropertyToken
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy("https://revitahub.io/metadata/{id}.json");
  await propertyToken.waitForDeployment();
  console.log("PropertyToken deployed:", await propertyToken.getAddress());

  // 2. Deploy PhaseManager
  const PhaseManager = await ethers.getContractFactory("PhaseManager");
  const phaseManager = await PhaseManager.deploy(await propertyToken.getAddress());
  await phaseManager.waitForDeployment();
  console.log("PhaseManager deployed:", await phaseManager.getAddress());

  // 3. Deploy Escrow
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(await propertyToken.getAddress());
  await escrow.waitForDeployment();
  console.log("Escrow deployed:", await escrow.getAddress());

  // 4. Deploy Treasury
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  console.log("Treasury deployed:", await treasury.getAddress());

  // 5. Deploy Governance (with actual Treasury address)
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(
    await propertyToken.getAddress(),
    await phaseManager.getAddress(),
    await treasury.getAddress()
  );
  await governance.waitForDeployment();
  console.log("Governance deployed:", await governance.getAddress());

  // 6. Grant roles on PropertyToken
  await propertyToken.grantRole(await propertyToken.MINTER_ROLE(), await escrow.getAddress());
  await propertyToken.grantRole(await propertyToken.BURNER_ROLE(), await escrow.getAddress());
  await propertyToken.grantRole(await propertyToken.PHASE_ADVANCER_ROLE(), await phaseManager.getAddress());
  console.log("PropertyToken roles granted");

  // 7. Grant roles on Escrow
  await escrow.grantRole(await escrow.OPERATOR_ROLE(), deployer.address);
  console.log("Escrow OPERATOR_ROLE granted to deployer");

  // 8. Grant roles on PhaseManager
  await phaseManager.grantRole(await phaseManager.OPERATOR_ROLE(), deployer.address);
  console.log("PhaseManager OPERATOR_ROLE granted to deployer");

  // 9. Grant roles on Treasury (Governance can execute treasury actions)
  await treasury.grantRole(await treasury.EXECUTOR_ROLE(), await governance.getAddress());
  console.log("Treasury EXECUTOR_ROLE granted to Governance");

  // 10. Grant roles on Governance
  await governance.grantRole(await governance.PROPOSER_ROLE(), deployer.address);
  console.log("Governance PROPOSER_ROLE granted to deployer");

  console.log("\n=== Deployment Complete ===");
  console.log("PropertyToken:", await propertyToken.getAddress());
  console.log("PhaseManager:", await phaseManager.getAddress());
  console.log("Escrow:", await escrow.getAddress());
  console.log("Treasury:", await treasury.getAddress());
  console.log("Governance:", await governance.getAddress());

  console.log("\n=== Role Summary ===");
  console.log("Escrow -> PropertyToken: MINTER_ROLE, BURNER_ROLE");
  console.log("PhaseManager -> PropertyToken: PHASE_ADVANCER_ROLE");
  console.log("Governance -> Treasury: EXECUTOR_ROLE");
  console.log("Deployer -> Escrow, PhaseManager: OPERATOR_ROLE");
  console.log("Deployer -> Governance: PROPOSER_ROLE");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
