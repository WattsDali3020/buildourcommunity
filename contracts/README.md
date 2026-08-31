# RevitaHub Smart Contracts

Solidity smart contracts for the RevitaHub community-owned real estate revitalization platform.

## Contracts Overview

### 1. PropertyToken.sol (ERC-1155)
Fractional property ownership tokens with phase-based pricing, whitelist-only transfers, transfer locks until funded, and phase-weighted voting power.

### 2. Escrow.sol
Purchase and refund handling with:
- 100% funding requirement
- 3% APR refund if the offering fails
- AML / sanctions gate on purchase
- **Payment 1:** 1% of gross to founderWallet only if funding completes **and** Governance impact score ≥ 70
- **Payment 2:** 1% of quarterly property income
- Treasury does not take this fee

### 3. Governance.sol
DAO voting with phase-weighted power (County 1.5x … International 0.75x), EIP-712 gasless votes, demand bars, impact report used by Escrow.

### 4. PhaseManager.sol
75% engagement threshold, poll bonuses, Chainlink Automation, geo-oracle local bonus.

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

Order: PropertyToken → Escrow → Governance → PhaseManager → Treasury.

`deployment-addresses.json` in repo root is currently Hardhat local (chainId 31337) unless replaced after a Sepolia deploy.

## License
MIT
