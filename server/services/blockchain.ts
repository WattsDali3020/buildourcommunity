/**
 * Blockchain Tokenization Service for Base Network
 * 
 * Handles deployment of ERC-20 property tokens on Base (Coinbase L2).
 * Uses Hardhat/ethers.js patterns for contract deployment.
 */

export interface TokenDeploymentConfig {
  propertyId: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  propertyValue: number; // USD value of the property
  fundingGoal: number; // 100% funding target required for loan issuance
  fundingDeadline: Date; // 1-year deadline
}

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  gasUsed?: string;
  networkId?: number;
}

export interface TokenPhaseConfig {
  phase: "county" | "state" | "national" | "international";
  priceMultiplier: number;
  maxTokensPerPerson: number;
  startDate: Date;
  endDate: Date;
}

// Base network configuration
export const BASE_MAINNET = {
  chainId: 8453,
  name: "Base",
  rpcUrl: "https://mainnet.base.org",
  blockExplorer: "https://basescan.org",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
};

export const BASE_SEPOLIA = {
  chainId: 84532,
  name: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org", 
  blockExplorer: "https://sepolia.basescan.org",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
};

// Use testnet for development
const ACTIVE_NETWORK = process.env.NODE_ENV === "production" ? BASE_MAINNET : BASE_SEPOLIA;

/**
 * ERC-20 Property Token Contract Template (Solidity)
 * This is the template used for deploying property tokens on Base.
 */
export const PROPERTY_TOKEN_CONTRACT = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PropertyToken
 * @dev ERC-20 token representing fractional ownership of a real estate property
 */
contract PropertyToken is ERC20, ERC20Burnable, Ownable, Pausable {
    // Property metadata
    string public propertyId;
    uint256 public propertyValue;
    uint256 public fundingGoal;
    uint256 public fundingDeadline;
    uint256 public totalFundsRaised;
    
    // Offering phases
    enum Phase { County, State, National, International }
    Phase public currentPhase;
    
    // Phase pricing (in USDC cents, e.g., 1250 = $12.50)
    mapping(Phase => uint256) public phasePrices;
    mapping(Phase => uint256) public phaseMaxPerPerson;
    
    // Investor tracking
    mapping(address => uint256) public investorContributions;
    address[] public investors;
    
    // Funding status
    bool public fundingSuccessful;
    bool public fundingFinalized;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 price, Phase phase);
    event FundingSuccessful(uint256 totalRaised);
    event FundingFailed(uint256 totalRaised);
    event RefundClaimed(address indexed investor, uint256 amount, uint256 interest);
    event DividendDistributed(uint256 amount);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _propertyId,
        uint256 _totalSupply,
        uint256 _propertyValue,
        uint256 _fundingGoal,
        uint256 _fundingDeadline
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        propertyId = _propertyId;
        propertyValue = _propertyValue;
        fundingGoal = _fundingGoal;
        fundingDeadline = _fundingDeadline;
        
        // Set phase pricing (in cents)
        phasePrices[Phase.County] = 1250;        // $12.50
        phasePrices[Phase.State] = 1875;          // $18.75
        phasePrices[Phase.National] = 2813;       // $28.13
        phasePrices[Phase.International] = 3750;  // $37.50
        
        // Set max tokens per person per phase
        phaseMaxPerPerson[Phase.County] = 1000;       // $12,500 max at county
        phaseMaxPerPerson[Phase.State] = 500;          // $9,375 max at state
        phaseMaxPerPerson[Phase.National] = 250;       // $7,032 max at national
        phaseMaxPerPerson[Phase.International] = 100;  // $3,750 max at international
        
        // Mint total supply to contract for distribution
        _mint(address(this), _totalSupply * 10**decimals());
        
        currentPhase = Phase.County;
    }
    
    function advancePhase() external onlyOwner {
        require(currentPhase != Phase.International, "Already at final phase");
        currentPhase = Phase(uint(currentPhase) + 1);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function finalizeFunding() external onlyOwner {
        require(!fundingFinalized, "Already finalized");
        require(block.timestamp >= fundingDeadline || totalFundsRaised >= fundingGoal, "Cannot finalize yet");
        
        fundingFinalized = true;
        fundingSuccessful = totalFundsRaised >= fundingGoal;
        
        if (fundingSuccessful) {
            emit FundingSuccessful(totalFundsRaised);
        } else {
            emit FundingFailed(totalFundsRaised);
        }
    }
    
    function getCurrentPrice() public view returns (uint256) {
        return phasePrices[currentPhase];
    }
    
    function getMaxTokensForPhase() public view returns (uint256) {
        return phaseMaxPerPerson[currentPhase];
    }
}
`;

/**
 * Generate contract deployment bytecode
 */
export function generateDeploymentConfig(config: TokenDeploymentConfig): {
  contractName: string;
  constructorArgs: any[];
  networkConfig: typeof BASE_MAINNET;
} {
  const fundingDeadlineTimestamp = Math.floor(config.fundingDeadline.getTime() / 1000);
  
  return {
    contractName: "PropertyToken",
    constructorArgs: [
      config.tokenName,
      config.tokenSymbol,
      config.propertyId,
      config.totalSupply,
      Math.floor(config.propertyValue * 100), // Convert to cents
      Math.floor(config.fundingGoal * 100), // Convert to cents
      fundingDeadlineTimestamp,
    ],
    networkConfig: ACTIVE_NETWORK,
  };
}

/**
 * Simulate contract deployment (for demo without actual blockchain)
 * In production, this would use ethers.js + private key to deploy
 */
export async function simulateDeployment(config: TokenDeploymentConfig): Promise<DeploymentResult> {
  console.log(`[Blockchain] Simulating deployment for property: ${config.propertyId}`);
  console.log(`[Blockchain] Token: ${config.tokenName} (${config.tokenSymbol})`);
  console.log(`[Blockchain] Total Supply: ${config.totalSupply}`);
  console.log(`[Blockchain] Property Value: $${config.propertyValue.toLocaleString()}`);
  console.log(`[Blockchain] Funding Goal: $${config.fundingGoal.toLocaleString()} (100% required)`);
  console.log(`[Blockchain] Network: ${ACTIVE_NETWORK.name}`);
  
  // Simulate deployment delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock contract address (deterministic based on property ID)
  const mockAddress = `0x${Buffer.from(config.propertyId).toString('hex').padEnd(40, '0').slice(0, 40)}`;
  const mockTxHash = `0x${Buffer.from(Date.now().toString()).toString('hex').padEnd(64, 'f').slice(0, 64)}`;
  
  console.log(`[Blockchain] Contract deployed at: ${mockAddress}`);
  console.log(`[Blockchain] Transaction hash: ${mockTxHash}`);
  
  return {
    success: true,
    contractAddress: mockAddress,
    transactionHash: mockTxHash,
    blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
    gasUsed: "2500000",
    networkId: ACTIVE_NETWORK.chainId,
  };
}

/**
 * Calculate phase pricing based on 5-phase community-first model
 */
export function calculatePhasePricing(basePrice: number): TokenPhaseConfig[] {
  const now = new Date();
  const phases: TokenPhaseConfig[] = [
    {
      phase: "county",
      priceMultiplier: 1.0, // $12.50 base
      maxTokensPerPerson: 1000,
      startDate: now,
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
      phase: "state", 
      priceMultiplier: 1.5, // $18.75
      maxTokensPerPerson: 500,
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
    {
      phase: "national",
      priceMultiplier: 2.25, // $28.13
      maxTokensPerPerson: 250,
      startDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), // 180 days
    },
    {
      phase: "international",
      priceMultiplier: 3.0, // $37.50
      maxTokensPerPerson: 100,
      startDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 365 days
    },
  ];
  
  return phases;
}

/**
 * Calculate refund with 3% APR interest for failed fundings
 */
export function calculateRefundWithInterest(
  investmentAmount: number,
  investmentDate: Date,
  refundDate: Date
): { principal: number; interest: number; total: number } {
  const annualRate = 0.03; // 3% APR
  const daysHeld = Math.floor((refundDate.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24));
  const yearFraction = daysHeld / 365;
  const interest = investmentAmount * annualRate * yearFraction;
  
  return {
    principal: investmentAmount,
    interest: Math.round(interest * 100) / 100,
    total: Math.round((investmentAmount + interest) * 100) / 100,
  };
}

/**
 * Get Base network explorer URL for contract/transaction
 */
export function getExplorerUrl(type: "address" | "tx", value: string): string {
  const baseUrl = ACTIVE_NETWORK.blockExplorer;
  return type === "address" 
    ? `${baseUrl}/address/${value}`
    : `${baseUrl}/tx/${value}`;
}

/**
 * Validate wallet address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format token amount with proper decimals (18 decimals for ERC-20)
 */
export function formatTokenAmount(amount: number, decimals: number = 18): string {
  return (amount * Math.pow(10, decimals)).toString();
}

/**
 * Parse token amount from wei to human-readable
 */
export function parseTokenAmount(weiAmount: string, decimals: number = 18): number {
  return parseInt(weiAmount) / Math.pow(10, decimals);
}
