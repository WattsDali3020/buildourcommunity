# RevitaHub - Community Revitalization Platform

## Overview

RevitaHub is a community-owned real estate revitalization platform that enables fractional ownership of properties through blockchain tokenization on EVM-compatible chains. The platform allows communities to invest in any property type (vacant land, historic buildings, commercial, residential, mixed-use) without size restrictions, transforming them into thriving neighborhood assets. Users can browse properties, purchase tokens starting at $12.50, participate in DAO governance, and earn returns through dividends.

### Funding Model
- **100% Funding Required**: Property loans are only issued when 100% of the funding target is reached
- **1-Year Timeline**: Each property offering has a 1-year funding deadline
- **Investor Protection**: If funding fails, investors receive automatic refunds with 3% APR interest

### Low-Entry Pricing for Financial Inclusion
- **$12.50 Base Price**: Intentionally low token price in Phase 1 (County) to enable participation from lower-income investors
- **Algorithmic Phase Pricing**: Prices increase across phases (County $12.50 → State $18.75 → National $28.13 → International $37.50)
- **Target Demographic**: Designed for the ~231,000 adults in Cherokee County and similar communities typically excluded from real estate investment

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Build Tool**: Vite with path aliases (`@/` for client src, `@shared/` for shared code)
- **Theme**: Dark/light mode support via ThemeProvider context

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API under `/api/*` routes
- **Build**: esbuild for production bundling with selective dependency bundling

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Validation**: Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Storage**: In-memory storage class implementing `IStorage` interface (database-ready pattern)

### Key Domain Models
- **Users**: Authentication with wallet address support for blockchain integration
- **Properties**: Real estate listings with status workflow (draft → approved → live → funded)
- **Token Offerings**: 4-phase community-first offering system (county → state → national → international)
- **Governance**: Proposals and voting with token-weighted voting power
- **Purchases/Holdings**: Token ownership tracking

### Design System
- **Typography**: Inter (primary), JetBrains Mono (monospace for blockchain data)
- **Color System**: HSL-based CSS variables with semantic tokens
- **Component Patterns**: Cards with elevation states, progress indicators, phase badges
- **Reference Style**: Inspired by Coinbase, Stripe, and Linear for professional financial interfaces

## External Dependencies

### Database
- PostgreSQL (via `DATABASE_URL` environment variable)
- Drizzle Kit for migrations (`npm run db:push`)

### Cloud Services
- Google Cloud Storage (`@google-cloud/storage`) for file uploads
- Uppy for file upload UI components

### Blockchain / Smart Contracts
- **Target Network**: Base (Coinbase L2)
- **Chainlink Build Program**: Oracles, automation, cross-chain features
- **Wallet Connection**: RainbowKit + wagmi (connection state managed in Header)

#### Smart Contract Stack (contracts/ folder)
| Contract | Purpose | Key Features |
|----------|---------|--------------|
| PropertyToken.sol | ERC-1155 property tokens | Phase-based holdings, voting power multipliers, transfer locks during funding, BURNER_ROLE for escrow |
| Escrow.sol | Purchase & refund handling | MINTER_ROLE to mint tokens, 3% APR refunds, burns tokens on failed funding |
| Governance.sol | DAO voting with AI moderation | Proposal creation, phase-weighted voting, bias detection |
| PhaseManager.sol | Chainlink Automation | 75% engagement threshold, automatic phase advancement |
| Treasury.sol | DAO fund execution | EXECUTOR_ROLE granted to Governance for approved proposals |

#### Role Assignments (scripts/deploy.js)
- Escrow → PropertyToken: MINTER_ROLE, BURNER_ROLE
- PhaseManager → PropertyToken: PHASE_ADVANCER_ROLE
- Governance → Treasury: EXECUTOR_ROLE
- Deployer → Escrow, PhaseManager: OPERATOR_ROLE

#### Voting Power Multipliers
- County: 1.5x (15000/10000)
- State: 1.25x (12500/10000)
- National: 1.0x (10000/10000)
- International: 0.75x (7500/10000)

#### Key Security Features
- Transfer locks: Tokens cannot be transferred during funding period
- Whitelist-only transfers: Only KYC-verified addresses can receive tokens
- FIFO phase deduction: Transfers maintain voting power consistency
- OpenZeppelin v5.0.0: AccessControl, ReentrancyGuard, ERC1155

### Third-Party Integrations
- Stripe for payment processing (pending full integration)
- Nodemailer for email notifications
- OpenAI and Google Generative AI for AI features
- Passport.js for authentication

## Recent Updates (February 2026)

### Feature Integration (February 26, 2026)
Integrated features from community-wishlist and revita-hub-merge apps:

1. **Community Wishlist** (`/wishlist`):
   - Public page for submitting and voting on community wishes
   - 9 categories: Housing, Retail, Entertainment, Parks & Recreation, Restaurant, Healthcare, Education, Services, Transportation
   - 12 seed wishes with vote counts from external database
   - Schema: `wishes` table (id, title, description, category, location, votes, email, take_it_further)
   - API: `GET /api/wishes`, `POST /api/wishes`, `POST /api/wishes/:id/vote`

2. **Interactive Map on Properties Page**:
   - Mapbox map view with grid/map toggle (uses existing VITE_MAPBOX_TOKEN)
   - Property markers with popup cards showing phase, funding progress, price, ROI
   - Sidebar list with map pan-to-property on click
   - Coordinates added to all mock property data

3. **Treasury Page** (`/treasury`, authenticated):
   - Fund allocation breakdown (Property Dev 40%, Community 20%, Operating 15%, Maintenance 15%, Emergency 10%)
   - Transaction history with inflow/outflow filtering
   - On-chain verification links

4. **Achievements/Gamification** (Dashboard):
   - 8 achievement types: First Investment, Diversified Portfolio, Phase Pioneer, Community Champion, Governance Voter, Diamond Hands, Whale Investor, Active Participant
   - Progress bars for multi-step achievements
   - Earned vs locked states computed from user holdings data

5. **Navigation Updates**:
   - Public: Wishlist link added
   - Authenticated: Treasury link added

## Previous Updates (January 2026)

### VC-Recommended Features (January 30, 2026)
Added 5 new VC-recommended features based on institutional feedback:

1. **Community Polls (Governance.sol)**:
   - Non-binding demand gauges via `createPoll()`, `votePoll()`, `endPoll()`
   - Poll-to-proposal pipeline: >30% support polls convert to proposals
   - 5% quorum bonus for poll-backed proposals
   - No token holdings required to create or vote on polls

2. **Dynamic Funding Targets (Escrow.sol)**:
   - `updatePollDemand()` adjusts funding targets based on poll scores
   - High-demand properties (>70% support) get up to 25% premium
   - `getDemandAdjustedTarget()` for transparency

3. **Relayer Reimbursement (Treasury.sol)**:
   - `fundReimbursementPool()` for gasless voting subsidies
   - `reimburseRelayer()` with max 0.01 ETH per transaction
   - Ensures financial inclusion for all voters

4. **24-Month Founder Vesting (Treasury.sol)**:
   - 730-day vesting with 90-day cliff
   - `getClaimableVested()`, `claimVestedCuts()` functions
   - Linear vesting after cliff period

5. **Poll Participation Bonuses (PhaseManager.sol)**:
   - `recordPollParticipation()` for engagement credit
   - `updateEngagementWithPolls()` with 0.5x poll bonus
   - `claimPollBoostBonus()` for 2x bonus tokens

### Litepaper v1.4
- Added Community Polls section to DAO Governance
- Added Founder Vesting & Relayer Subsidies section to Investor Protections

### Governance Enhancements (January 23, 2026)
Based on Amundi Fund Tokenization report recommendations for institutional credibility:

1. **Gasless Voting (Governance.sol)**:
   - EIP-712 signature verification for off-chain voting
   - `castVoteBySignature()` allows relayers to submit signed votes on behalf of lower-income investors
   - Replay attack protection via nonces
   - RELAYER_ROLE for authorized vote submission

2. **Multi-Sig Treasury (Treasury.sol)**:
   - 2-of-3 multi-sig requirement for operational disbursements
   - `submitTransaction()`, `confirmTransaction()`, `revokeConfirmation()`, `executeTransaction()` workflow
   - SIGNER_ROLE for multi-sig participants
   - Dual execution paths: Multi-sig for operations, direct execute() for DAO-approved proposals

3. **Regulatory Compliance (PropertyToken.sol)**:
   - KYC verification recording with external verification IDs
   - AML check recording and failure tracking
   - Compliance checkpoint events for audit trails
   - Regulator audit request events
   - `getKYCStatus()` view function

4. **Compliance Events (Escrow.sol)**:
   - CompliancePurchaseRecorded emitted on every purchase
   - InvestorLimitChecked emitted for AML monitoring
   - RefundComplianceRecorded emitted on refunds
   - `reportSuspiciousActivity()` for compliance officers
   - `getPurchaseForAudit()` and `getInvestorContribution()` for audits

### Smart Contract Development (January 2026)
1. **PropertyToken.sol**: ERC-1155 with phase-based voting power, transfer locks during funding, BURNER_ROLE
2. **Escrow.sol**: Token purchases with minting, 3% APR refunds with token burning on failure
3. **Governance.sol**: DAO voting with AI bias detection, phase-weighted voting power
4. **PhaseManager.sol**: Chainlink Automation for 75% engagement threshold phase advancement
5. **Treasury.sol**: DAO-controlled fund execution via EXECUTOR_ROLE
6. **Test Suite**: 5 passing tests covering minting, burning, transfer locks, phase tracking, voting power
7. **Litepaper v1.2**: Updated technical architecture with actual contract code

## Previous Updates (December 2024)

### Production Features Implemented
1. **Wallet Connection**: RainbowKit + wagmi integration for Base network wallet connectivity
2. **KYC Verification**: User identity verification with form submission and admin approval workflow
3. **Token Purchase Flow**: SimplePurchaseModal with phase restrictions, per-person limits, and payment method selection
4. **Investor Dashboard**: Portfolio metrics, voting power display, KYC status, and investor protection info
5. **Governance Voting**: API-backed proposal listing with real voting power from holdings
6. **Admin Panel**: Property/nomination approval, KYC verification management
7. **Investor Protection API**: 3% APR refund calculation for failed property funding (100% funding required)
8. **Whitepaper**: Comprehensive 14-section whitepaper for Chainlink Build Program application (/whitepaper)

### Authentication
- Uses Replit Auth (OAuth2/OIDC) with session-based authentication via `req.session.userId`
- Session storage in PostgreSQL via connect-pg-simple

### Key API Routes
- `POST /api/purchase` - Token purchase with phase enforcement, KYC/wallet validation, and Stripe payment intent creation
- `POST /api/purchase/confirm` - Verify Stripe payment and update holdings (derives data from trusted payment metadata)
- `POST /api/proposals/:id/vote` - Cast vote on governance proposals with token-weighted voting power
- `GET /api/investor-protection/:propertyId` - Calculate refund eligibility with 3% APR
- `GET/POST /api/admin/kyc-pending` - Admin KYC management
- `POST /api/user/kyc` - Submit KYC verification
- `POST /api/user/wallet` - Link wallet address

### Security Features
- Phase enforcement: Purchases rejected if requested phase is not active
- Price validation: Server-side check against phase pricing to prevent manipulation
- Payment verification: Stripe payment intent metadata used as source of truth for holdings updates
- Voting power multipliers: County (1.5x), State (1.25x), National (1.0x), International (0.75x)
- Rate limiting: Applied to all purchase and vote endpoints (10 requests/minute for purchases, 20/minute for votes)
- Stripe webhook idempotency: Checks for existing purchase by paymentIntentId before processing

### Infrastructure Services (December 2024)
1. **Scheduler Service** (`server/services/scheduler.ts`):
   - Runs every 5 minutes on server startup
   - Checks funding deadlines and triggers refund flows
   - Advances phases when current phase sells out
   - Updates proposal statuses when voting ends
   - Graceful shutdown via SIGTERM/SIGINT handlers

2. **Email Service** (`server/services/email.ts`):
   - Purchase confirmations with token and amount details
   - Refund notifications with 3% APR interest calculation
   - Proposal notifications for token holders
   - Vote confirmations with voting power used

3. **Rate Limiting** (`server/middleware/rateLimit.ts`):
   - purchaseRateLimit: 10 requests/minute per IP+path
   - voteRateLimit: 20 requests/minute per IP+path
   - authRateLimit: 5 requests/15 minutes per IP+path
   - Automatic cleanup of expired rate limit entries

4. **Stripe Webhook** (`/api/webhooks/stripe`):
   - Signature verification with STRIPE_WEBHOOK_SECRET
   - Idempotency check via paymentIntentId
   - Updates holdings, offerings, and phases on payment_intent.succeeded
   - Sends purchase confirmation email after successful processing