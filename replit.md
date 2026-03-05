# RevitaHub — AI-Nudged RevitalDAO

## Overview
RevitaHub is a community-owned real estate revitalization platform built on Base (Coinbase L2). It uses blockchain tokenization to enable fractional property ownership, empowering communities to invest in distressed properties and transform them into neighborhood assets. Key features include a $12.50 minimum token pricing for broad financial inclusion, DAO governance with AI-moderated voting, a 4-phase pricing ramp (County → State → National → International), and transparent 1% founder economics. The platform aims to be a blank-state, pre-launch configuration with empty database tables and API-driven pages.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query v5
- **Styling**: Tailwind CSS with shadcn/ui (New York style), dark/light mode support
- **Maps**: Leaflet (homepage, league) and Mapbox GL (properties page)

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API
- **Auth**: Replit Auth (OIDC)
- **File Storage**: Replit Object Storage

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL
- **Schema**: Shared between client and server (`shared/schema.ts`, `shared/models/auth.ts`)
- **Validation**: Zod schemas generated from Drizzle via `drizzle-zod`
- **Storage Pattern**: `IStorage` interface with `DatabaseStorage` (PostgreSQL) and `MemStorage` (dev fallback)

### Core Features
- **Wallet Connection**: RainbowKit + wagmi for Base network.
- **KYC Verification**: User identity verification with admin approval, enforced via middleware.
- **Investor Onboarding Gate**: Linear flow (Auth → KYC Submit → KYC Approved → Risk Disclosure Acknowledged → Purchase Unlocked).
- **Token Purchase Flow**: Phase restrictions, per-person limits, payment processing, two-phase payment reconciliation.
- **Investor Dashboard**: Portfolio metrics, voting power, KYC status, holdings, refund requests.
- **Governance Voting**: API-backed proposals with token-weighted voting.
- **Admin Panel**: Property/nomination approval, KYC management, payment reconciliation.
- **Investor Protection API**: 3% APR refund calculation for unfunded properties.
- **Impact Simulator**: Georgia county-level adoption scenarios, GDP multiplier projections, and founder revenue scaling.
- **Community Wishlist**: Zip-code-driven business voting and community need submission.
- **Service Provider Marketplace**: Platform for service providers to bid on property services.
- **Professional Profiles & Matching**: Licensed professionals (contractors, realtors, attorneys, engineers, architects, lenders, inspectors, appraisers) with verification, endorsements, service areas, and project matching.
- **Agent Tasks**: AI agent task queue for property sourcing, owner outreach, grant research, contractor sourcing, and more.
- **Reputation System**: Event-based reputation scoring for professionals (project completions, ratings, disputes).
- **Owner Detection & Contact**: Automated property owner lookup, contact tracking, and owner response portal.
- **Property Submissions**: Owners can submit properties with document uploads.
- **Grants System**: Tracking federal/state/local/private/nonprofit grants.
- **Private Offerings**: Invite-only offerings with access codes and token allocation limits.
- **Scheduler Service**: Background tasks for funding deadlines, phase advancements, and proposal statuses.
- **Email Service**: Transactional emails for purchases, refunds, proposals, and phase changes.
- **Security**: Helmet.js with CSP enabled (self + Mapbox/Stripe/WalletConnect/Base), session hardening, rate limiting, auth middleware on sensitive write endpoints, server-side userId injection on key create endpoints (properties, submissions, nominations, purchases), ownership authorization on submission mutations (403 for non-owners), owner-lookup endpoints restricted to admin-only, file upload endpoint requires authentication, Stripe webhook signature verification via `constructEvent` with `STRIPE_WEBHOOK_SECRET`.
- **Audit Log**: System-wide event logging in `audit_log` table.
- **Soft Delete**: `deletedAt` columns on financial tables.

### Smart Contract Architecture
- **PropertyToken.sol**: ERC-1155 tokens with phase-based voting power, transfer locks.
- **Escrow.sol**: Handles token purchases, 3% APR refunds, and token burning.
- **Governance.sol**: Manages DAO voting with phase-weighted voting, gasless signatures.
- **PhaseManager.sol**: Chainlink Automation for phase advancement.
- **Treasury.sol**: Manages DAO funds, founder vesting.

## External Dependencies

### Database
- PostgreSQL (via `DATABASE_URL`)
- Drizzle ORM + Drizzle Kit

### Cloud Services
- Replit Object Storage
- Replit Auth

### Blockchain / Smart Contracts
- **Target Network**: Base (Coinbase L2)
- **Framework**: Chainlink Build Program (Oracles, Automation, Cross-chain)
- **Wallet Connection**: RainbowKit + wagmi
- **Smart Contracts**: PropertyToken.sol, Escrow.sol, Governance.sol, PhaseManager.sol, Treasury.sol

### Third-Party Integrations
- Stripe (payment processing + webhooks)
- Nodemailer (email notifications via SMTP)
- OpenAI and Google Generative AI (AI features)
- Leaflet + Mapbox GL JS (interactive maps)