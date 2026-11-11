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
│   └── deploy.cjs           # Hardhat deployment script
├── hardhat.config.js        # Hardhat configuration
├── .env.example             # Environment variables template
└── package.json
```

## Contracts Overview

### 1. PropertyToken.sol (ERC-1155)
Fractional property tokens. Staged access to the full supply (no reserved buckets), residency-weighted votes (1.5 / 1.0 / 0.75), and a common 365-day transfer lock. Post-period liquidity is not decided. Residency checks are an admin or oracle stub. No KYC provider is integrated.

### 2. Escrow.sol
Purchase and refund handling with:
- 100% funding requirement
- 3% APR refund if the offering fails
- AML / sanctions gate on purchase
- **Payment 1:** 1% of gross to founderWallet only if funding completes **and** Governance impact score ≥ 70
- **Payment 2:** 1% of quarterly property income
- Treasury does not take this fee

### 3. Governance.sol
DAO voting with residency-weighted power (county 1.5x, other in-state 1.0x, other US 0.75x). Outside holders vote. EIP-712 gasless votes, demand bars, impact report used by Escrow.

### 4. PhaseManager.sol
Engagement metrics and nudges. It does not advance sale stages. Token bonuses are disabled because they are outside the confirmed sale rules.

### 5. Treasury.sol
2-of-3 multi-sig pass-through, relayer reimbursement, reserve verification. No founder vest schedule on this contract.

## Deployment

```bash
npm install
cp .env.example .env
npx hardhat compile
npx hardhat run scripts/deploy.cjs --network hardhat
npx hardhat run scripts/deploy.cjs --network base-sepolia
```

### Deploy (Local)
```bash
npx hardhat run scripts/deploy.cjs --network hardhat
```

### Deploy (Base Sepolia Testnet)
```bash
npx hardhat run scripts/deploy.cjs --network base-sepolia
```

### Deploy (Base Mainnet)
```bash
npx hardhat run scripts/deploy.cjs --network base-mainnet
```

After a Base Sepolia or Base Mainnet deploy, the script also writes the deployed
addresses back into the app's frontend config
(`client/src/lib/contracts/addresses.ts` and `client/src/lib/contracts.ts`) in
addition to `deployment-addresses.json`.

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

Order: PropertyToken → Escrow → Governance → PhaseManager → Treasury.

`deployment-addresses.json` in repo root is currently Hardhat local (chainId 31337) unless replaced after a Sepolia deploy.

## License
MIT
