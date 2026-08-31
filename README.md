# RevitaHub — AI-Nudged RevitalDAO

**Community-owned real estate revitalization on Base (Coinbase L2)**

RevitaHub is a blockchain-powered platform that enables communities to collectively invest in distressed properties and transform them into neighborhood assets. Built on Base with Chainlink oracles, it uses fractional tokenization to lower the barrier to real estate investment — starting at just $12.50 per token.

> Solo Founder: **Build Our Community, LLC**
>
> Status: **Alpha prototype**. Pins are RevitaHub properties only. Smart contracts are implemented in-repo; Base Sepolia/mainnet addresses are not live until `deployment-addresses.json` is updated off Hardhat.

---

## Key Features

- **$12.50 Minimum Token Pricing** — County-phase fractional ownership (KYC / whitelist required before mint)
- **4-Phase Pricing Ramp** — County ($12.50) → State ($18.75) → National ($28.13) → International ($37.50)
- **DAO Governance** — Token-weighted voting with gasless EIP-712 signatures
- **2-of-3 Multi-Sig Treasury** — Pass-through treasury. Does **not** skim the founder fee
- **Impact-gated founder economics** — Escrow Payment 1 = 1% of gross **only if** the offering funds **and** Governance impact score ≥ 70. Payment 2 = 1% of quarterly property income. No 24-month Treasury vest. No 5% platform cut
- **KYC/AML Compliance** — Checks on every purchase; transfers locked until funded
- **Investor Protection** — 3% APR refund if an offering misses its target
- **Professional Marketplace** — Verified contractors, realtors, attorneys, and more
- **Impact Simulator** — Georgia county-level GDP projections and adoption scenarios
- **Community Wishlist** — Zip-code-driven nominations and needs

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Wouter (routing) + TanStack React Query v5
- Leaflet + OpenStreetMap tiles by default (MapKit JS when `MAPKIT_JS_TOKEN` is set)
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
| **Escrow.sol** | Purchases, 3% APR refunds, AML gate, impact-gated 1% Payment 1 + quarterly Payment 2 |
| **Governance.sol** | DAO voting, EIP-712 gasless signatures, demand bars, impact report |
| **PhaseManager.sol** | 75% engagement threshold, Chainlink Automation, geo bonuses |
| **Treasury.sol** | 2-of-3 multi-sig pass-through, relayer reimbursement, reserve verification |

### Build Gap Enhancements (All Implemented in source)

1. **AML/KYC Oracle** (Escrow.sol) — Compliance scoring on purchases
2. **EIP-712 Gasless Voting** (Governance.sol)
3. **Suspicious Activity Flagging** (Escrow.sol)
4. **Geo-Verification** (PhaseManager.sol) — County-local bonus via oracle
5. **LLC-Backed Properties** (PropertyToken.sol)
6. **Multi-Sig Treasury** (Treasury.sol) — Pass-through only; founder fee lives in Escrow

---

## Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Base Sepolia ETH (for testnet deployment)
- `PRIVATE_KEY` in env — never commit it

### Run Locally
```bash
npm install
npm run dev
```

### Deploy Smart Contracts
```bash
npx hardhat compile
npx hardhat run scripts/deploy.cjs --network base-sepolia
npx hardhat run scripts/deploy.cjs --network hardhat
```

**Deployment Order** (handled automatically by script):
1. PropertyToken → 2. Escrow → 3. Governance → 4. PhaseManager → 5. Treasury

Post-deployment role assignments are automated. Contract addresses are saved to `deployment-addresses.json`.

`deployment-addresses.json` currently records a **Hardhat local** deploy (chainId 31337). Treat zero-addresses in `client/src/lib/contracts/addresses.ts` as not-live.

---

## Maps and property data

See `docs/MAPKIT_AND_PROPERTY_DATA.md`.

- Apple MapKit JS requires a paid Apple Developer Program token in Replit Secret `MAPKIT_JS_TOKEN`.
- Until that token exists, the hero map uses OpenStreetMap tiles (no vendor key).
- Apple does not supply parcels, owners, or offerings. Pins come from Postgres; parcel geometry from Cherokee County GIS when a nomination is confirmed.

---

## Project Structure

```
├── client/src/          # React frontend
├── server/              # Express backend
├── shared/              # Drizzle schema
├── contracts/           # Five Solidity contracts
├── scripts/             # deploy.cjs
├── docs/                # MapKit + property-data notes
└── hardhat.config.cjs
```

---

## License

MIT
