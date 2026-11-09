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
  phase: "county" | "state" | "national";
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
    
    // Access stages. No reserved buckets and no price ramp.
    enum Phase { County, State, National }
    Phase public currentPhase;

    // Single price parameter in USDC cents. Not a marketing constant.
    uint256 public basePriceCents;
    // Same per-person allowance for every eligible person. 0 = not chosen.
    uint256 public perPersonAllowance;
    
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
        
        basePriceCents = 0; // Set with setBasePrice. Do not hard-code a public quote.
        perPersonAllowance = 0;

        // Mint total supply to contract for distribution
        _mint(address(this), _totalSupply * 10**decimals());
        
        currentPhase = Phase.County;
    }

    function setBasePrice(uint256 cents) external onlyOwner {
        require(cents > 0, "Price required");
        basePriceCents = cents;
    }

    function setPerPersonAllowance(uint256 allowance) external onlyOwner {
        require(allowance > 0, "Allowance required");
        perPersonAllowance = allowance;
    }
    
    function advancePhase() external pure {
        revert("Access stages follow the common funding clock");
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
        return basePriceCents;
    }
    
    function getMaxTokensForPhase() public view returns (uint256) {
        return perPersonAllowance;
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
 * Three access stages over the common 365-day clock.
 * Price is the supplied parameter (multiplier 1). Allowance is unset (0).
 */
export function calculatePhasePricing(basePrice: number, clockStart: Date = new Date()): TokenPhaseConfig[] {
  const day = 24 * 60 * 60 * 1000;
  void basePrice;
  return [
    {
      phase: "county",
      priceMultiplier: 1,
      maxTokensPerPerson: 0,
      startDate: clockStart,
      endDate: new Date(clockStart.getTime() + 90 * day),
    },
    {
      phase: "state",
      priceMultiplier: 1,
      maxTokensPerPerson: 0,
      startDate: new Date(clockStart.getTime() + 90 * day),
      endDate: new Date(clockStart.getTime() + 180 * day),
    },
    {
      phase: "national",
      priceMultiplier: 1,
      maxTokensPerPerson: 0,
      startDate: new Date(clockStart.getTime() + 180 * day),
      endDate: new Date(clockStart.getTime() + 365 * day),
    },
  ];
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
