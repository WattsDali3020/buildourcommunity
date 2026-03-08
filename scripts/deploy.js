const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy("https://revitahub.com/api/metadata/{id}.json");
  await propertyToken.waitForDeployment();
  console.log("PropertyToken deployed:", await propertyToken.getAddress());

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(await propertyToken.getAddress(), deployer.address);
  await escrow.waitForDeployment();
  console.log("Escrow deployed:", await escrow.getAddress());
  console.log("Founder wallet:", deployer.address);

  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(await propertyToken.getAddress());
  await governance.waitForDeployment();
  console.log("Governance deployed:", await governance.getAddress());

  const PhaseManager = await ethers.getContractFactory("PhaseManager");
  const phaseManager = await PhaseManager.deploy(
    await propertyToken.getAddress(),
    await governance.getAddress()
  );
  await phaseManager.waitForDeployment();
  console.log("PhaseManager deployed:", await phaseManager.getAddress());

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  console.log("Treasury deployed:", await treasury.getAddress());

  await propertyToken.grantRole(await propertyToken.MINTER_ROLE(), await escrow.getAddress());
  await propertyToken.grantRole(await propertyToken.BURNER_ROLE(), await escrow.getAddress());
  await propertyToken.grantRole(await propertyToken.PHASE_ADVANCER_ROLE(), await phaseManager.getAddress());
  console.log("PropertyToken roles granted");

  await escrow.grantRole(await escrow.OPERATOR_ROLE(), deployer.address);
  console.log("Escrow OPERATOR_ROLE granted to deployer");

  await phaseManager.grantRole(await phaseManager.OPERATOR_ROLE(), deployer.address);
  console.log("PhaseManager OPERATOR_ROLE granted to deployer");

  await treasury.grantRole(await treasury.EXECUTOR_ROLE(), await governance.getAddress());
  console.log("Treasury EXECUTOR_ROLE granted to Governance");

  await treasury.grantRole(await treasury.SIGNER_ROLE(), deployer.address);
  console.log("Treasury SIGNER_ROLE granted to deployer");

  await governance.grantRole(await governance.PROPOSER_ROLE(), deployer.address);
  console.log("Governance PROPOSER_ROLE granted to deployer");

  await escrow.setGovernanceContract(await governance.getAddress());
  console.log("Escrow governance set (impact-gated founder fee)");

  console.log("\n=== Deployment Complete ===");
  console.log("PropertyToken:", await propertyToken.getAddress());
  console.log("Escrow:", await escrow.getAddress());
  console.log("Governance:", await governance.getAddress());
  console.log("PhaseManager:", await phaseManager.getAddress());
  console.log("Treasury:", await treasury.getAddress());

  console.log("\n=== Role Summary ===");
  console.log("Escrow       -> PropertyToken: MINTER_ROLE, BURNER_ROLE");
  console.log("PhaseManager -> PropertyToken: PHASE_ADVANCER_ROLE");
  console.log("Deployer     -> Escrow:        OPERATOR_ROLE");
  console.log("Deployer     -> PhaseManager:  OPERATOR_ROLE");
  console.log("Governance   -> Treasury:      EXECUTOR_ROLE");
  console.log("Deployer     -> Treasury:      SIGNER_ROLE");
  console.log("Deployer     -> Governance:    PROPOSER_ROLE");
  console.log("Escrow       -> Governance:    setGovernanceContract (impact scoring)");
  console.log("Escrow       -> Founder:       1% at funding (impact-gated) + 1% quarterly");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
