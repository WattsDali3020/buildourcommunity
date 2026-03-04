# RevitaHub - Community Revitalization Platform

## Overview
RevitaHub is a community-owned real estate revitalization platform leveraging blockchain tokenization on EVM-compatible chains to enable fractional property ownership. It empowers communities to invest in various property types, transforming them into neighborhood assets. The platform offers low-entry token pricing starting at $12.50, allowing broad financial inclusion. Investors can purchase tokens, participate in DAO governance, and earn dividends. Property offerings require 100% funding within a one-year deadline, with automatic 3% APR refunds if funding targets are not met. The pricing model scales across phases (County, State, National, International) to encourage early community investment.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS with shadcn/ui (New York style)
- **Build Tool**: Vite
- **Theme**: Dark/light mode support

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API
- **Build**: esbuild

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL
- **Schema**: Shared between client and server (`shared/schema.ts`)
- **Validation**: Zod schemas generated from Drizzle

### Key Domain Models
- **Users**: Authentication with wallet address
- **Properties**: Real estate listings with a lifecycle (draft → approved → live → funded)
- **Token Offerings**: Multi-phase offering system
- **Governance**: Proposals and token-weighted voting
- **Purchases/Holdings**: Token ownership tracking
- **Service Bids**: Service provider marketplace bids (Title Work, Loan Structuring, Property Assessment, etc.)
- **Wishes**: Community needs with zip-code-driven business voting

### Design System
- **Typography**: Inter, JetBrains Mono
- **Color System**: HSL-based CSS variables
- **Component Patterns**: Cards, progress indicators, phase badges
- **Reference Style**: Coinbase, Stripe, Linear

### Core Features
- **Wallet Connection**: RainbowKit + wagmi for Base network.
- **KYC Verification**: User identity verification with admin approval.
- **Token Purchase Flow**: Includes phase restrictions, per-person limits, and payment method selection.
- **Investor Dashboard**: Portfolio metrics, voting power, KYC status, My Holdings with per-property phase multipliers.
- **Governance Voting**: API-backed proposals with token-weighted voting and 75% phase engagement meters.
- **Admin Panel**: Property/nomination approval, KYC management.
- **Investor Protection API**: 3% APR refund calculation for unfunded properties.
- **Impact Simulator**: `/impact` page with Georgia county-level adoption scenarios (5%–100%), GDP multiplier projections, randomized sample projects, founder revenue scaling, and smart contract integration explainers. Data module at `client/src/lib/georgia-impact-data.ts`.
- **Economic Impact Cards**: Property detail pages show county distress level (ARC classification), economic/social/risk scores, GDP multiplier, leverage rank, investment preview with "What Your $12.50 Does" ripple-effect chain, and Chainlink oracle proof placeholder.
- **Community Wishlist**: Public page with zip-code-driven business voting, predefined business categories (Grocery, Medical, etc.), vote percentages, and community need submission.
- **Service Provider Marketplace**: `/services` page where realtors, brokers, tax assessors, and firms can bid on property services. Winners selected by governance vote, payments from Treasury.
- **Interactive Maps**: Leaflet-based map on homepage and Mapbox on properties page with property markers and filtering.
- **Treasury Page**: Authenticated page with fund allocation, transaction history, and 1% founder sustainability cut (24-month vesting, 90-day cliff).
- **RevitaLeague Competition**: `/league` page with 4 live leagues (GDP Growth, Social Impact, Engagement, Builder), seasonal RevitaCup (90-day seasons), cross-county rivalries, Leaflet competition map with glow-intensity markers, and on-chain integration cards. Builder League profile on dashboard, City Competition card on property detail. Data module at `client/src/lib/league-data.ts`.
- **Achievements/Gamification**: Tracks user engagement and milestones.
- **Community Polls**: Non-binding polls that can lead to formal proposals, influencing funding targets.
- **Gasless Voting**: EIP-712 signature verification for off-chain voting via relayers.
- **Multi-Sig Treasury**: 2-of-3 multi-sig for operational disbursements.
- **Regulatory Compliance**: On-chain recording of KYC/AML checks and audit events.
- **Scheduler Service**: Manages funding deadlines, phase advancements, and proposal statuses.
- **Email Service**: For purchase confirmations, refund notifications, and proposal alerts.
- **Rate Limiting**: Applied to critical endpoints.

### Smart Contract Architecture
- **PropertyToken.sol**: ERC-1155 tokens with phase-based voting power, transfer locks, and burner role for escrow.
- **Escrow.sol**: Handles token purchases, 3% APR refunds, and token burning.
- **Governance.sol**: Manages DAO voting with AI moderation, phase-weighted voting, and community polls.
- **PhaseManager.sol**: Chainlink Automation for phase advancement based on engagement thresholds.
- **Treasury.sol**: Manages DAO funds with executor role for governance, dynamic funding targets, relayer reimbursement, and founder vesting.

## External Dependencies

### Database
- PostgreSQL (via `DATABASE_URL`)
- Drizzle Kit

### Cloud Services
- Google Cloud Storage (`@google-cloud/storage`)
- Uppy (file upload UI)

### Blockchain / Smart Contracts
- **Target Network**: Base (Coinbase L2)
- **Framework**: Chainlink Build Program (Oracles, Automation, Cross-chain)
- **Wallet Connection**: RainbowKit + wagmi
- **Smart Contracts**: PropertyToken.sol, Escrow.sol, Governance.sol, PhaseManager.sol, Treasury.sol

### Third-Party Integrations
- Stripe (payment processing)
- Nodemailer (email notifications)
- OpenAI and Google Generative AI (AI features)
- Passport.js (authentication)