# RevitaHub Smart Contracts

Solidity smart contracts for the RevitaHub community-owned real estate revitalization platform.

## Project Structure

```
your-project/
├── contracts/
│   ├── PropertyToken.sol    # ERC-1155 fractional ownership
│   ├── Escrow.sol           # Purchase & refund handling
│   ├── Governance.sol       # DAO voting system
│   ├── PhaseManager.sol     # Dynamic phase advancement
│   └── README.md
├── scripts/
│   └── deploy.js            # Hardhat deployment script
├── hardhat.config.js        # Hardhat configuration
├── .env.example             # Environment variables template
└── package.json
```

## Contracts Overview

### 1. PropertyToken.sol (ERC-1155)
Fractional property ownership tokens with:
- ERC1155Supply for total supply tracking
- ERC1155Burnable for token burning on failed offerings
- EnumerableSet for property enumeration
- Phase-based pricing ($12.50 base, increasing through phases)
- Whitelist-only transfers (KYC compliance)
- Phase-weighted voting power multipliers

### 2. Escrow.sol
Purchase and refund handling with:
- 100% funding requirement enforcement
- 3% APR refund calculation for failed offerings
- Chainlink Automation for deadline monitoring
- Multi-signature fund release

### 3. Governance.sol
DAO voting system with:
- Phase-weighted voting (County 1.5x, State 1.25x, National 1.0x, International 0.75x)
- Proposal types: Property Development, Treasury, Parameters, Emergency
- Weighted quorum calculation (votes vs weighted supply)
- Vote-to-earn bonus APR tracking

### 4. PhaseManager.sol
Dynamic phase advancement with:
- 75% engagement threshold for early advancement
- Behavioral nudge event triggers
- Chainlink Automation integration
- Subscription-based advancement (when phase sells out)

## Deployment

### Prerequisites
- Node.js 18+
- Hardhat with toolbox
- OpenZeppelin Contracts 5.0+

### Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your PRIVATE_KEY and other values
```

### Compile
```bash
npx hardhat compile
```

### Deploy (Local)
```bash
npx hardhat run scripts/deploy.js --network hardhat
```

### Deploy (Base Sepolia Testnet)
```bash
npx hardhat run scripts/deploy.js --network base-sepolia
```

### Deploy (Base Mainnet)
```bash
npx hardhat run scripts/deploy.js --network base-mainnet
```

## Contract Addresses (Testnet)
To be populated after deployment.

## Security Considerations
- All contracts use OpenZeppelin's battle-tested implementations
- ReentrancyGuard on all fund-handling functions
- AccessControl for role-based permissions
- Pausable for emergency stops

## Chainlink Integration
- **Price Feeds**: USD/ETH for accurate token pricing
- **Automation**: Deadline monitoring and phase advancement
- **CCIP**: Cross-chain expansion (future)

## License
MIT
