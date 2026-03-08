# RevitaHub — AI-Nudged RevitalDAO

**Community-owned real estate revitalization on Base (Coinbase L2)**

RevitaHub is a blockchain-powered platform that enables communities to collectively invest in distressed properties and transform them into neighborhood assets. Built on Base with Chainlink oracles, it uses fractional tokenization to lower the barrier to real estate investment — starting at just $12.50 per token.

> Solo Founder: **Build Our Community, LLC**

---

## Key Features

- **$12.50 Minimum Token Pricing** — Broad financial inclusion through fractional property ownership
- **4-Phase Pricing Ramp** — County ($12.50) → State ($18.75) → National ($28.13) → International ($37.50)
- **DAO Governance** — Token-weighted voting with gasless EIP-712 signatures for mass participation
- **2-of-3 Multi-Sig Treasury** — Institutional-grade fund management with 1% founder economics (24-month vesting, 90-day cliff)
- **KYC/AML Compliance** — Automated oracle-based compliance checks on every purchase
- **Investor Protection** — 3% APR refund calculation for unfunded properties
- **Professional Marketplace** — Verified contractors, realtors, attorneys, and more matched to projects
- **Impact Simulator** — Georgia county-level GDP projections and adoption scenarios
- **RevitaLeague Gamification** — Community engagement through SimCity-inspired meters
- **Community Wishlist** — Zip-code-driven business voting and community needs

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Wouter (routing) + TanStack React Query v5
- Leaflet + Mapbox GL (interactive maps)
- RainbowKit + wagmi (wallet connection)

### Backend
- Node.js + Express + TypeScript
- Drizzle ORM + PostgreSQL
- Replit Auth (OIDC)
- Replit Object Storage

### Blockchain
- **Target Network**: Base (Coinbase L2)
- **Testnet**: Base Sepolia (chainId 84532)
- **Framework**: Chainlink Build Program (Oracles, Automation, Cross-chain)
- **Language**: Solidity 0.8.24

---

## Smart Contract Architecture

Five core contracts with full role-based access control:

| Contract | Purpose |
|----------|---------|
| **PropertyToken.sol** | ERC-1155 tokens with phase-based voting power, transfer locks, LLC-backed property structs |
| **Escrow.sol** | Token purchases, 3% APR refunds, AML oracle integration, suspicious activity flagging |
| **Governance.sol** | DAO voting with phase-weighted power, EIP-712 gasless signatures, quorum enforcement |
| **PhaseManager.sol** | Chainlink Automation for phase advancement, geo-verification oracles, engagement bonuses |
| **Treasury.sol** | 2-of-3 multi-sig, 1% founder vesting (24mo/90-day cliff), Chainlink reserve verification, relayer reimbursement |

### Build Gap Enhancements (All Implemented)

1. **AML/KYC Oracle** (Escrow.sol) — Automated compliance scoring on purchases (threshold: 80)
2. **EIP-712 Gasless Voting** (Governance.sol) — Off-chain signatures for zero-cost participation
3. **Suspicious Activity Flagging** (Escrow.sol) — Automated via AML oracle + manual reporting
4. **Geo-Verification** (PhaseManager.sol) — County-local 1.5x bonus tokens via oracle
5. **LLC-Backed Properties** (PropertyToken.sol) — Custodian address + LLC identifier per property
6. **Multi-Sig Treasury** (Treasury.sol) — 2-of-3 with founder vesting + reserve verification

---

## Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Base Sepolia ETH (for testnet deployment)

### Run Locally
```bash
npm install
npm run dev
```

### Deploy Smart Contracts
```bash
# Compile
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.cjs --network base-sepolia

# Deploy to local Hardhat network (for testing)
npx hardhat run scripts/deploy.cjs --network hardhat
```

**Deployment Order** (handled automatically by script):
1. PropertyToken → 2. Escrow → 3. Governance → 4. PhaseManager → 5. Treasury

Post-deployment role assignments are automated in the deploy script. Contract addresses are saved to `deployment-addresses.json`.

---

## Project Structure

```
├── client/src/          # React frontend (34 pages)
│   ├── pages/           # Page components
│   ├── components/      # Shared UI components
│   └── lib/             # Utilities and hooks
├── server/              # Express backend (100+ API endpoints)
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database storage interface
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schema
│   └── schema.ts        # Drizzle ORM schema (35 tables)
├── contracts/           # Solidity smart contracts
│   ├── PropertyToken.sol
│   ├── Escrow.sol
│   ├── Governance.sol
│   ├── PhaseManager.sol
│   └── Treasury.sol
├── scripts/             # Deployment scripts
│   └── deploy.cjs       # Main deployment script
└── hardhat.config.cjs   # Hardhat configuration
```

---

## Platform Stats

- **34 pages** — Full-featured web application
- **100+ API endpoints** — RESTful JSON API
- **35 database tables** — Comprehensive data model
- **5 smart contracts** — Complete on-chain architecture
- **8 professional license types** — Contractor, realtor, attorney, engineer, architect, lender, inspector, appraiser

---

## Chainlink Integration

RevitaHub is built within the **Chainlink Build Program**, leveraging:

- **Chainlink Oracles** — AML/KYC scoring and geo-verification for phase eligibility
- **Chainlink Automation** — Automated phase advancement based on subscription thresholds
- **Chainlink Functions** — Reserve verification for LLC-backed properties
- **Cross-chain** — Future multi-chain expansion capability

---

## License

MIT
