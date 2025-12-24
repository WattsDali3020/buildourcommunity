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

### Blockchain
- Blockchain-agnostic design (EVM-compatible chains)
- Exploring Chainlink Build Program participation for oracles, automation, and cross-chain features
- Wallet connection via RainbowKit + wagmi (connection state managed in Header)

### Third-Party Integrations
- Stripe for payment processing (pending full integration)
- Nodemailer for email notifications
- OpenAI and Google Generative AI for AI features
- Passport.js for authentication

## Recent Updates (December 2024)

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