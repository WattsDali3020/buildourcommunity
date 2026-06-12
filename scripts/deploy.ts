import { ethers, network as hreNetwork } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = hreNetwork.name;

  console.log("=".repeat(60));
  console.log("RevitaHub Smart Contract Deployment");
  console.log("=".repeat(60));
  console.log("Network:", network.name, `(chainId: ${network.chainId})`);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // 1. Deploy PropertyToken (ERC-1155) — constructor(string uri_)
  console.log("1. Deploying PropertyToken...");
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy("https://revitahub.com/api/metadata/{id}.json");
  await propertyToken.waitForDeployment();
  const propertyTokenAddress = await propertyToken.getAddress();
  console.log("   PropertyToken deployed to:", propertyTokenAddress);

  // 2. Deploy Escrow — constructor(address _propertyToken, address _founderWallet)
  console.log("2. Deploying Escrow...");
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(propertyTokenAddress, deployer.address);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("   Escrow deployed to:", escrowAddress);
  console.log("   Founder wallet:", deployer.address);

  // 3. Deploy Governance — constructor(address _propertyToken)
  console.log("3. Deploying Governance...");
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(propertyTokenAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("   Governance deployed to:", governanceAddress);

  // 4. Deploy PhaseManager — constructor(address _propertyToken, address _governance)
  console.log("4. Deploying PhaseManager...");
  const PhaseManager = await ethers.getContractFactory("PhaseManager");
  const phaseManager = await PhaseManager.deploy(propertyTokenAddress, governanceAddress);
  await phaseManager.waitForDeployment();
  const phaseManagerAddress = await phaseManager.getAddress();
  console.log("   PhaseManager deployed to:", phaseManagerAddress);

  // 5. Deploy Treasury — constructor()
  console.log("5. Deploying Treasury...");
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("   Treasury deployed to:", treasuryAddress);

  console.log("");
  console.log("=".repeat(60));
  console.log("Setting up role assignments...");
  console.log("=".repeat(60));

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
  const PHASE_ADVANCER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PHASE_ADVANCER_ROLE"));
  const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
  const EXECUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EXECUTOR_ROLE"));
  const PROPOSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROPOSER_ROLE"));
  const SIGNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SIGNER_ROLE"));

  console.log("- Granting Escrow MINTER_ROLE on PropertyToken...");
  await (await propertyToken.grantRole(MINTER_ROLE, escrowAddress)).wait();

  console.log("- Granting Escrow BURNER_ROLE on PropertyToken...");
  await (await propertyToken.grantRole(BURNER_ROLE, escrowAddress)).wait();

  console.log("- Granting PhaseManager PHASE_ADVANCER_ROLE on PropertyToken...");
  await (await propertyToken.grantRole(PHASE_ADVANCER_ROLE, phaseManagerAddress)).wait();

  console.log("- Granting Deployer OPERATOR_ROLE on Escrow...");
  await (await escrow.grantRole(OPERATOR_ROLE, deployer.address)).wait();

  console.log("- Granting Deployer OPERATOR_ROLE on PhaseManager...");
  await (await phaseManager.grantRole(OPERATOR_ROLE, deployer.address)).wait();

  console.log("- Granting Governance EXECUTOR_ROLE on Treasury...");
  await (await treasury.grantRole(EXECUTOR_ROLE, governanceAddress)).wait();

  console.log("- Granting Deployer PROPOSER_ROLE on Governance...");
  await (await governance.grantRole(PROPOSER_ROLE, deployer.address)).wait();

  console.log("- Adding Deployer as Treasury SIGNER...");
  await (await treasury.grantRole(SIGNER_ROLE, deployer.address)).wait();

  console.log("- Setting Governance address on Escrow (impact-gated founder fee)...");
  await (await escrow.setGovernanceContract(governanceAddress)).wait();

  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      PropertyToken: propertyTokenAddress,
      Escrow: escrowAddress,
      Governance: governanceAddress,
      PhaseManager: phaseManagerAddress,
      Treasury: treasuryAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "..", "deployment-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("");
  console.log("=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log(`Addresses saved to: ${outputPath}`);
  console.log(`(Network: ${networkName})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
