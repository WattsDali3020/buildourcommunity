# RevitaHub - Community Revitalization Platform

## Overview

RevitaHub is a community-owned real estate revitalization platform that enables fractional ownership of properties through blockchain tokenization on Base. The platform allows communities to invest in vacant land, historic buildings, and commercial properties, transforming them into thriving neighborhood assets. Users can browse properties, purchase tokens starting at $50, participate in DAO governance, and earn returns through dividends.

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
- Built for Base network (Coinbase L2)
- Wallet connection patterns in UI (connection state managed in Header)

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
7. **Investor Protection API**: 3% APR refund calculation for failed property funding

### Authentication
- Uses Replit Auth (OAuth2/OIDC) with session-based authentication via `req.session.userId`
- Session storage in PostgreSQL via connect-pg-simple

### Key API Routes
- `POST /api/purchase` - Token purchase with KYC/wallet validation
- `GET /api/investor-protection/:propertyId` - Calculate refund eligibility
- `GET/POST /api/admin/kyc-pending` - Admin KYC management
- `POST /api/user/kyc` - Submit KYC verification
- `POST /api/user/wallet` - Link wallet address