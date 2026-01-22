const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=".repeat(60));
  console.log("RevitaHub Smart Contract Deployment");
  console.log("=".repeat(60));
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // 1. Deploy PropertyToken (core token contract)
  console.log("1. Deploying PropertyToken...");
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy("https://revitahub.com/api/metadata/{id}.json");
  await propertyToken.waitForDeployment();
  const propertyTokenAddress = await propertyToken.getAddress();
  console.log("   PropertyToken deployed to:", propertyTokenAddress);

  // 2. Deploy Escrow (handles purchases and refunds)
  console.log("2. Deploying Escrow...");
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(propertyTokenAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("   Escrow deployed to:", escrowAddress);

  // 3. Deploy Governance (DAO voting)
  console.log("3. Deploying Governance...");
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(propertyTokenAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("   Governance deployed to:", governanceAddress);

  // 4. Deploy PhaseManager (Chainlink Automation for phase advancement)
  console.log("4. Deploying PhaseManager...");
  const PhaseManager = await ethers.getContractFactory("PhaseManager");
  const phaseManager = await PhaseManager.deploy(propertyTokenAddress, governanceAddress);
  await phaseManager.waitForDeployment();
  const phaseManagerAddress = await phaseManager.getAddress();
  console.log("   PhaseManager deployed to:", phaseManagerAddress);

  // 5. Deploy Treasury (DAO-controlled fund execution)
  console.log("5. Deploying Treasury...");
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(deployer.address); // Founder wallet = deployer for now
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("   Treasury deployed to:", treasuryAddress);

  console.log("");
  console.log("=".repeat(60));
  console.log("Setting up role assignments...");
  console.log("=".repeat(60));

  // Role constants (matching contract definitions)
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
  const PHASE_ADVANCER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PHASE_ADVANCER_ROLE"));
  const EXECUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EXECUTOR_ROLE"));

  // Grant Escrow MINTER_ROLE and BURNER_ROLE on PropertyToken
  console.log("- Granting Escrow MINTER_ROLE on PropertyToken...");
  await propertyToken.grantRole(MINTER_ROLE, escrowAddress);
  console.log("- Granting Escrow BURNER_ROLE on PropertyToken...");
  await propertyToken.grantRole(BURNER_ROLE, escrowAddress);

  // Grant PhaseManager PHASE_ADVANCER_ROLE on PropertyToken
  console.log("- Granting PhaseManager PHASE_ADVANCER_ROLE on PropertyToken...");
  await propertyToken.grantRole(PHASE_ADVANCER_ROLE, phaseManagerAddress);

  // Grant Governance EXECUTOR_ROLE on Treasury
  console.log("- Granting Governance EXECUTOR_ROLE on Treasury...");
  await treasury.grantRole(EXECUTOR_ROLE, governanceAddress);

  console.log("");
  console.log("=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("");
  console.log("Contract Addresses:");
  console.log("-".repeat(60));
  console.log(`PropertyToken:  ${propertyTokenAddress}`);
  console.log(`Escrow:         ${escrowAddress}`);
  console.log(`Governance:     ${governanceAddress}`);
  console.log(`PhaseManager:   ${phaseManagerAddress}`);
  console.log(`Treasury:       ${treasuryAddress}`);
  console.log("-".repeat(60));
  console.log("");
  console.log("Role Assignments:");
  console.log("- Escrow -> PropertyToken: MINTER_ROLE, BURNER_ROLE");
  console.log("- PhaseManager -> PropertyToken: PHASE_ADVANCER_ROLE");
  console.log("- Governance -> Treasury: EXECUTOR_ROLE");
  console.log("");
  console.log("Next Steps:");
  console.log("1. Save these addresses to your frontend config");
  console.log("2. Verify contracts on Basescan (optional)");
  console.log("3. Test with a small property listing");
  console.log("");

  // Return addresses for programmatic use
  return {
    propertyToken: propertyTokenAddress,
    escrow: escrowAddress,
    governance: governanceAddress,
    phaseManager: phaseManagerAddress,
    treasury: treasuryAddress,
  };
}

main()
  .then((addresses) => {
    console.log("Deployment successful!");
    console.log(JSON.stringify(addresses, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
