# RevitaHub — Technical Architecture

RevitaHub is a community-owned real estate revitalization platform on Base (Coinbase L2). It uses ERC-1155 tokenization to enable fractional property ownership starting at $12.50/token, DAO governance with phase-weighted voting, and a transparent 1% founder sustainability cut. Built by Build Our Community, LLC.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (New York style) |
| Routing | Wouter |
| State | TanStack React Query v5 |
| Maps | Leaflet (homepage), Mapbox via react-map-gl (properties/nominate) |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend | Node.js, Express, TypeScript (ESM) |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Auth | Replit OpenID Connect (passport) + RainbowKit wallet connection |
| Blockchain | Base L2, wagmi, RainbowKit, Solidity 0.8.20 |
| Contracts | OpenZeppelin (ERC-1155, AccessControl), Chainlink (Automation, Functions) |
| Payments | Stripe |
| Email | Nodemailer |
| File Storage | Google Cloud Storage + Uppy |
| Build | Vite (frontend), esbuild (backend) |

---

## Directory Structure

```
/
├── client/
│   └── src/
│       ├── App.tsx                  # Router — all page routes registered here
│       ├── main.tsx                 # React entry point
│       ├── index.css                # Tailwind + HSL color variables (dark/light)
│       ├── pages/
│       │   ├── home.tsx             # Landing page with AppleHero map
│       │   ├── properties.tsx       # Property listing with Mapbox map
│       │   ├── property-detail.tsx  # Full property view: offerings, impact cards, city competition
│       │   ├── dashboard.tsx        # Investor dashboard: portfolio, holdings, achievements, builder league
│       │   ├── governance.tsx       # Proposals list + voting
│       │   ├── community.tsx        # Community priorities voting
│       │   ├── league.tsx           # RevitaLeague: 4 leagues, leaderboards, rivalries, competition map
│       │   ├── impact-simulator.tsx # Georgia GDP impact simulator with adoption tiers
│       │   ├── services.tsx         # Service provider marketplace (bid submission)
│       │   ├── wishlist.tsx         # Zip-code business voting
│       │   ├── treasury.tsx         # Treasury fund allocation + founder economics
│       │   ├── nominate.tsx         # Property nomination with Mapbox geocoding
│       │   ├── submit.tsx           # Property submission form
│       │   ├── tokenize.tsx         # Tokenization wizard
│       │   ├── admin.tsx            # Admin panel: property/KYC/nomination management
│       │   ├── litepaper.tsx        # Platform litepaper
│       │   ├── tokenization-process.tsx # How-it-works flow diagram
│       │   ├── faq.tsx              # FAQ page
│       │   ├── about.tsx            # About / team
│       │   ├── learn.tsx            # Educational content
│       │   ├── grants.tsx           # Grant funding info
│       │   ├── ai-insights.tsx      # AI-powered insights
│       │   ├── business-layer.tsx   # Business model details
│       │   ├── demand-dashboard.tsx # Market demand analytics
│       │   ├── founder-dashboard.tsx # Founder-specific metrics
│       │   ├── owner-response.tsx   # Owner response to nomination (token-based)
│       │   └── not-found.tsx        # 404 page
│       ├── components/
│       │   ├── Header.tsx           # Main nav: public + authenticated links
│       │   ├── Footer.tsx           # Footer: platform/resources/company links + legal disclaimer
│       │   ├── AppleHero.tsx        # Homepage hero with Leaflet map + phase-colored markers
│       │   ├── WalletButton.tsx     # RainbowKit connect button
│       │   ├── WalletProvider.tsx   # wagmi + RainbowKit provider (Base network)
│       │   ├── ThemeProvider.tsx     # Dark/light mode toggle
│       │   ├── ThemeToggle.tsx      # Theme switch button
│       │   ├── BetaBanner.tsx       # Beta notice banner
│       │   ├── BehavioralNudge.tsx  # AI-nudged engagement prompts
│       │   ├── TokenPurchaseModal.tsx # Token purchase flow modal
│       │   ├── SimplePurchaseModal.tsx # Simplified purchase
│       │   ├── PhaseOfferingCard.tsx # Phase-specific offering display
│       │   ├── CapitalStackDisplay.tsx # Capital stack visualization
│       │   ├── PortfolioOverview.tsx # Portfolio metrics card
│       │   ├── TransactionHistory.tsx # Transaction list
│       │   ├── KYCVerification.tsx  # KYC status + verification
│       │   ├── PropertyCard.tsx     # Property list item card
│       │   ├── ProposalCard.tsx     # Governance proposal card
│       │   ├── ROICalculator.tsx    # ROI projection calculator
│       │   ├── ShareModal.tsx       # Social share modal
│       │   ├── ObjectUploader.tsx   # GCS file uploader (Uppy)
│       │   ├── PrivateAccessGate.tsx # Access code gate for private offerings
│       │   ├── StateComplianceTable.tsx # State regulatory compliance
│       │   ├── StateFilter.tsx      # State filter dropdown
│       │   ├── WaitlistModal.tsx    # Waitlist signup
│       │   ├── FeaturedProperties.tsx # Featured property carousel
│       │   ├── HowItWorks.tsx       # Step-by-step explainer
│       │   ├── CTASection.tsx       # Call-to-action sections
│       │   ├── FourStepCTA.tsx      # 4-step CTA flow
│       │   ├── FundingTimeline.tsx  # Funding deadline timeline
│       │   ├── ImpactStats.tsx      # Impact statistics display
│       │   ├── TrustSection.tsx     # Trust/security badges
│       │   ├── StatCard.tsx         # Metric stat card
│       │   ├── LearnCard.tsx        # Educational card
│       │   ├── SummaryPanel.tsx     # Summary panel
│       │   └── ui/                  # shadcn/ui primitives (40+ components)
│       ├── lib/
│       │   ├── queryClient.ts       # TanStack Query client + apiRequest helper
│       │   ├── utils.ts             # cn() classname merge utility
│       │   ├── georgia-impact-data.ts # 25 GA counties, 10 project types, impact metrics, adoption tiers
│       │   ├── league-data.ts       # RevitaLeague: 4 leagues, city generation, rivalries, RevitaCup
│       │   ├── contracts.ts         # Contract ABIs + addresses
│       │   ├── wagmiConfig.ts       # wagmi chain config (Base)
│       │   └── auth-utils.ts        # Auth helper utilities
│       └── hooks/
│           ├── use-auth.ts          # Auth state hook
│           ├── use-toast.ts         # Toast notification hook
│           ├── use-mobile.tsx       # Mobile breakpoint hook
│           └── use-upload.ts        # File upload hook
├── server/
│   ├── index.ts                     # Express app bootstrap + server start
│   ├── routes.ts                    # All API route handlers (~60 endpoints)
│   ├── storage.ts                   # IStorage interface + MemStorage fallback
│   ├── databaseStorage.ts          # DatabaseStorage — PostgreSQL implementation of IStorage
│   ├── db.ts                        # Drizzle client setup (DATABASE_URL)
│   ├── vite.ts                      # Vite dev server middleware
│   ├── static.ts                    # Static file serving (production)
│   ├── middleware/
│   │   └── rateLimit.ts             # Rate limiting middleware
│   ├── services/
│   │   ├── blockchain.ts            # Web3 contract interaction
│   │   ├── email.ts                 # Nodemailer email service (SMTP)
│   │   ├── notifications.ts         # Notification dispatch
│   │   ├── payments.ts              # Stripe payment processing
│   │   ├── scheduler.ts             # Funding deadlines, phase advances, proposal status
│   │   ├── ownerDetection.ts        # Property owner lookup
│   │   └── tokenizationOrchestrator.ts # End-to-end tokenization workflow
│   └── replit_integrations/         # Replit auth (OpenID Connect)
├── shared/
│   ├── schema.ts                    # All Drizzle tables, enums, Zod schemas, types, config constants
│   └── models/
│       └── auth.ts                  # User + Session tables (Replit auth)
├── contracts/
│   ├── PropertyToken.sol            # ERC-1155 with phase pricing, transfer locks, voting power
│   ├── Escrow.sol                   # Purchase handling, 3% APR refunds, token burning
│   ├── Governance.sol               # DAO voting, AI moderation, gasless signatures, polls
│   ├── PhaseManager.sol             # Chainlink Automation for phase advancement
│   └── Treasury.sol                 # Multi-sig treasury, founder vesting, reserve verification
├── drizzle.config.ts                # Drizzle Kit config
├── vite.config.ts                   # Vite config (aliases: @/, @shared/, @assets/)
├── tailwind.config.ts               # Tailwind config (darkMode: class)
├── tsconfig.json                    # TypeScript config
└── package.json                     # Dependencies + scripts
```

---

## Database Schema (shared/schema.ts)

### Enums
| Enum | Values |
|------|--------|
| `kycStatus` | pending, submitted, approved, rejected |
| `propertyType` | residential, commercial, mixed_use, land, industrial |
| `propertyStatus` | draft, pending, approved, live, funded, closed |
| `offeringPhase` | county, state, national, international |
| `offeringType` | public, private |
| `offeringStatus` | draft, active, paused, completed, failed |
| `fundingOutcome` | pending, success, failed, refunded |
| `purchaseStatus` | pending, confirmed, failed, refunded |
| `refundStatus` | pending, processing, completed, failed |
| `shareTransferStatus` | pending, approved, completed, rejected |
| `proposalStatus` | draft, active, passed, rejected, executed |
| `nominationStatus` | pending, approved, rejected, contacted, accepted, declined |
| `ownerDetectionStatus` | pending, searching, found, not_found, verified |
| `submissionStatus` | draft, submitted, under_review, approved, rejected, needs_revision |
| `inviteStatus` | pending, accepted, expired, revoked |
| `waitlistRole` | investor, property_owner, service_provider, community_member |
| `grantLevel` | federal, state, local, private |
| `grantStatus` | identified, applied, approved, received, rejected |
| `grantType` | grant, tax_credit, loan, subsidy, incentive |
| `contactMethod` | email, letter, phone, in_person, public_notice |
| `contactStatus` | pending, sent, delivered, responded, failed |
| `deploymentStatus` | pending, deploying, deployed, failed |
| `serviceBidStatus` | pending, approved, rejected |

### Core Tables

**users** (via shared/models/auth.ts — Replit Auth)
- `id` (varchar PK), `email`, `firstName`, `lastName`, `profileImageUrl`, `kycStatus`, `walletAddress`, `createdAt`, `updatedAt`

**properties**
- `id` (varchar PK, UUID), `name`, `description`, `address`, `city`, `state`, `zipCode`, `county`
- `propertyType` (enum), `status` (enum), `latitude`, `longitude`
- `estimatedValue`, `targetFunding`, `imageUrl`, `createdBy`
- `submittedAt`, `approvedAt`, `createdAt`, `updatedAt`

**tokenOfferings**
- `id` (varchar PK), `propertyId` (FK), `totalTokenSupply`, `baseTokenPrice` ($12.50)
- `offeringType` (public/private), `status`, `fundingOutcome`, `fundingDeadline`
- `tokensSold`, `totalFundingRaised`, `contractAddress`

**offeringPhases**
- `id`, `offeringId` (FK), `phase` (county/state/national/international)
- `tokenAllocation`, `pricePerToken`, `maxPerPerson`, `tokensSold`
- `startDate`, `endDate`, `engagementThreshold` (75%), `isActive`

**tokenPurchases**
- `id`, `userId`, `offeringId`, `phaseId`, `tokenCount`, `pricePerToken`, `totalAmount`
- `paymentMethod` (stripe/crypto/wire), `status`, `transactionHash`, `paymentIntentId`

**tokenHoldings**
- `id`, `userId`, `offeringId`, `tokenCount`, `averagePurchasePrice`, `votingPower`

**fundEscrow**
- `id`, `offeringId`, `totalDeposited`, `totalRefunded`, `status`
- `refundInterestRate` (default "3.00"), `lastInterestCalculation`

**tokenRefunds**
- `id`, `userId`, `offeringId`, `tokenCount`, `refundAmount`, `interestAmount`
- `totalRefund`, `status`, `transactionHash`

**proposals**
- `id`, `offeringId`, `title`, `description`, `proposedBy`
- `votesFor`, `votesAgainst`, `quorumRequired`, `status`
- `executionData`, `executionTransactionHash`, `votingEndsAt`

**votes**
- `id`, `proposalId`, `userId`, `voteDirection` (boolean), `votingPower`

**propertyNominations**
- `id`, `nominatorId`, `propertyAddress`, `latitude`, `longitude`, `city`, `state`, `zipCode`
- `ownerDetectionStatus`, `detectedOwnerName/Type/Address/Email/Phone`
- `ownerNotifiedAt`, `ownerResponseStatus`, `status`, `adminNotes`, `voteCount`, `desiredUses`

**propertySubmissions**
- `id`, `ownerId`, `propertyAddress`, `status`, `estimatedValue`, `targetFunding`
- `reviewedBy`, `reviewNotes`, `submittedAt`, `reviewedAt`

**wishes** (Community Wishlist)
- `id`, `category`, `description`, `votes`, `zipCode`, `createdAt`

**serviceBids** (Service Provider Marketplace)
- `id`, `propertyId`, `providerName`, `serviceType`, `bidAmount`
- `description`, `contactEmail`, `status`, `createdAt`

**Other tables**: `sessions`, `shareTransfers`, `blockchainDeployments`, `ownerContactAttempts`, `submissionDocuments`, `privateOfferingInvites`, `waitlist`, `communityNeeds`, `propertyUseProposals`, `nominationVotes`, `useProposalVotes`, `communityNeedVotes`, `desiredUseVotes`, `propertyGrants`

### Key Constants (shared/schema.ts)

```typescript
PHASE_CONFIG = {
  county:        { multiplier: 1.0,  allocation: 0.30, maxPerPerson: 100, votingMultiplier: 1.5  },
  state:         { multiplier: 1.5,  allocation: 0.30, maxPerPerson: 75,  votingMultiplier: 1.25 },
  national:      { multiplier: 2.25, allocation: 0.25, maxPerPerson: 50,  votingMultiplier: 1.0  },
  international: { multiplier: 3.0,  allocation: 0.15, maxPerPerson: 25,  votingMultiplier: 0.75 },
}
// Base price: $12.50 → $18.75 → $28.13 → $37.50

FUNDING_TIMELINE_CONFIG = {
  maxDurationDays: 365,
  refundAPR: 3.0,     // 3% APR refund if funding fails
  minPhaseDurationDays: 7,
  engagementThreshold: 0.75,
}
```

---

## API Routes (server/routes.ts)

### Properties
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/properties` | No | List all properties |
| GET | `/api/properties/:id` | No | Get property detail |
| POST | `/api/properties` | No | Create property |

### Token Offerings & Phases
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/offerings/:offeringId/phases` | No | List phases for offering |
| GET | `/api/offerings/:offeringId/active-phase` | No | Get current active phase |
| GET | `/api/offerings/:offeringId/with-access` | No | Get offering with access check |
| POST | `/api/offerings/:offeringId/advance-phase` | No | Advance to next phase |
| POST | `/api/offerings/:offeringId/process-refunds` | No | Process 3% APR refunds |

### Purchases & Holdings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/purchases/check-eligibility` | No | Check purchase eligibility |
| POST | `/api/purchases` | No | Create purchase (rate-limited) |
| POST | `/api/purchase` | Yes | Authenticated purchase |
| POST | `/api/purchase/confirm` | Yes | Confirm purchase |
| GET | `/api/users/:userId/holdings` | No | Get user holdings |
| GET | `/api/users/:userId/voting-power/:offeringId` | No | Get voting power |
| GET | `/api/user/holdings` | Yes | Get authenticated user holdings |

### Governance
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/proposals` | No | List proposals (optional offeringId filter) |
| GET | `/api/proposals/:id` | No | Get proposal detail |
| POST | `/api/proposals/:id/vote` | Yes | Cast vote (rate-limited) |

### Property Submissions (Owner Flow)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/property-submissions` | No | Create submission |
| GET | `/api/property-submissions/:id` | No | Get submission |
| GET | `/api/property-submissions` | No | List submissions |
| PATCH | `/api/property-submissions/:id` | No | Update submission |
| POST | `/api/property-submissions/:id/submit` | No | Submit for review |
| PATCH | `/api/property-submissions/:id/status` | No | Update status (admin) |
| POST | `/api/property-submissions/:id/documents` | No | Add document |
| GET | `/api/property-submissions/:id/documents` | No | List documents |
| DELETE | `/api/property-submissions/:submissionId/documents/:docId` | No | Delete document |

### Property Nominations (Community Flow)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/nominations` | No | Create nomination |
| GET | `/api/nominations` | No | List nominations |
| GET | `/api/nominations/:id` | No | Get nomination |
| POST | `/api/nominations/:id/vote` | No | Vote on nomination |
| POST | `/api/nominations/:id/approve` | No | Approve nomination (admin) |
| POST | `/api/nominations/:id/lookup-owner` | No | Trigger owner detection |
| POST | `/api/nominations/:id/notify-owner` | No | Send owner notification |
| GET | `/api/owner-response/:token` | No | Get owner response page |
| POST | `/api/owner-response/:token` | No | Submit owner response |

### Tokenization & Blockchain
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/tokenize` | No | Start tokenization process |
| GET | `/api/tokenization-status/:propertyId` | No | Check tokenization status |
| GET | `/api/blockchain/explorer/:type/:value` | No | Block explorer lookup |

### Community Features
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/wishes` | No | List wishes (optional zipCode filter) |
| POST | `/api/wishes` | No | Create wish |
| POST | `/api/wishes/:id/vote` | No | Vote on wish |
| GET | `/api/service-bids` | No | List service bids |
| POST | `/api/service-bids` | No | Submit service bid |
| PATCH | `/api/service-bids/:id/status` | Yes+Admin | Update bid status |

### Other
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stats` | No | Platform statistics |
| GET | `/api/user` | Yes | Current user profile |
| POST | `/api/waitlist` | No | Join waitlist |
| POST | `/api/webhooks/stripe` | No | Stripe webhook handler |
| POST | `/api/owner-lookup/address` | No | Owner lookup by address |
| POST | `/api/owner-lookup/coordinates` | No | Owner lookup by coordinates |
| POST/GET | `/api/private-offerings/*` | Yes | Private offering invite management |
| POST/GET/PATCH/DELETE | `/api/properties/:propertyId/grants` | Mixed | Grant management |
| GET | `/api/properties/:propertyId/capital-stack` | No | Capital stack summary |

### Auth Routes (Replit Integration)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/user` | Get current authenticated user |
| GET | `/api/login` | Redirect to Replit OAuth |
| GET | `/api/callback` | OAuth callback |
| GET | `/api/logout` | Logout |

---

## Frontend Pages & Routes

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/` | home.tsx | Landing: AppleHero Leaflet map, featured properties, stats, CTAs |
| `/properties` | properties.tsx | Property listing with Mapbox map + filters |
| `/properties/:id` | property-detail.tsx | Full property view: offerings, phases, economic impact cards, city competition |
| `/dashboard` | dashboard.tsx | Investor: portfolio, holdings, achievements, builder league |
| `/governance` | governance.tsx | Proposal list + voting |
| `/community` | community.tsx | Community priorities and needs voting |
| `/league` | league.tsx | RevitaLeague: 4 leagues, leaderboards, rivalries, map, RevitaCup |
| `/impact` | impact-simulator.tsx | Georgia GDP impact simulator with 4 adoption tiers |
| `/services` | services.tsx | Service provider bid submission |
| `/wishlist` | wishlist.tsx | Zip-code business category voting |
| `/treasury` | treasury.tsx | Treasury allocation, founder economics |
| `/nominate` | nominate.tsx | Property nomination with Mapbox geocoding |
| `/submit` | submit.tsx | Property owner submission form |
| `/tokenize` | tokenize.tsx | Tokenization wizard |
| `/admin` | admin.tsx | Admin panel: properties, KYC, nominations |
| `/litepaper` | litepaper.tsx | Platform litepaper |
| `/how-it-works` | tokenization-process.tsx | Tokenization flow diagram |
| `/faq` | faq.tsx | FAQ |
| `/about` | about.tsx | About/team/contact |
| `/learn` | learn.tsx | Educational content |
| `/grants` | grants.tsx | Grant funding info |
| `/ai-insights` | ai-insights.tsx | AI-powered insights |
| `/business` | business-layer.tsx | Business model details |
| `/demand` | demand-dashboard.tsx | Market demand analytics |
| `/founder` | founder-dashboard.tsx | Founder-specific metrics |
| `/owner-response/:token` | owner-response.tsx | Owner response to nomination |

---

## Frontend Data Modules

### georgia-impact-data.ts
- 25 representative Georgia counties with ARC distress classifications, populations, regions, and top needs
- 10 project types: Grocery, Healthcare, Housing, etc. with GDP multiplier ranges and job estimates
- 4 adoption tiers: 5% (7 counties), 20% (32), 50% (79), 100% (159)
- `calculateImpactMetrics(county, projectType, budget)` → `ImpactMetrics` (economicScore, socialScore, leverageRank, projectedAnnualROI, riskAdjustedScore)
- `getInvestmentPreview(county, projectType, budget)` → token price breakdown, jobs, GDP impact, dividends
- `generateRandomProjects(tier)` → sample projects for simulator
- `calculateFounderRevenue(tier)` → 1% treasury + 0.25% certification fee scaling

### league-data.ts
- 4 leagues: GDP Growth, Social Impact, Engagement, Builder
- `generateLeagueCities(count)` → mock cities from GA counties with scores, glow intensity, season wins, rivalries
- `generateRivalries(cities)` → auto-paired county matchups by region
- `getCurrentSeason(cities)` → 90-day RevitaCup season info + bonus pool
- `getBuilderProfile(tokensHeld, properties, votes, cities)` → personal competition stats
- `getRankBadge(rank)` → gold/silver/bronze styling for top ranks
- `getGlowColor(intensity)` → green/blue/purple/amber/gray by rank tier

### contracts.ts
- Contract ABIs and deployed addresses for PropertyToken, Escrow, Governance, PhaseManager, Treasury

### wagmiConfig.ts
- wagmi chain configuration for Base network
- RainbowKit wallet connector setup

---

## Server Services

| Service | File | Purpose |
|---------|------|---------|
| Blockchain | `server/services/blockchain.ts` | Web3 contract interaction (deploy, mint, read) |
| Email | `server/services/email.ts` | SMTP via Nodemailer (purchase confirmations, refund notifications, proposal alerts) |
| Payments | `server/services/payments.ts` | Stripe payment intents, webhook processing |
| Scheduler | `server/services/scheduler.ts` | Cron-like service for funding deadlines, phase auto-advance, proposal status updates |
| Owner Detection | `server/services/ownerDetection.ts` | Property owner lookup by address/coordinates |
| Tokenization | `server/services/tokenizationOrchestrator.ts` | End-to-end: create offering → deploy contract → set phases → go live |
| Notifications | `server/services/notifications.ts` | Notification dispatch layer |
| Rate Limiting | `server/middleware/rateLimit.ts` | Applied to purchase and voting endpoints |

---

## Smart Contracts (contracts/)

### PropertyToken.sol (ERC-1155)
- **Roles**: DEFAULT_ADMIN, MINTER, PAUSER, WHITELIST_ADMIN, PHASE_ADVANCER, BURNER
- **Property struct**: id, name, uri, totalSupply, mintedSupply, fundingTarget, fundingDeadline, currentPhase, isActive, isFunded, leagueScore
- **Phase pricing**: County 1.0x → State 1.5x → National 2.25x → International 3.0x (base $12.50)
- **Voting power**: Phase multipliers — County 1.5x, State 1.25x, National 1.0x, International 0.75x
- **Transfer locks**: Whitelist-only transfers until property is funded
- **Key functions**: `mintTokens()`, `advancePhase()`, `markFunded()`, `updateLeagueScore()`, `burnFromOnFailure()`
- **RevitaLeague**: `leagueScore` field + `seasonWins` mapping updated by PhaseManager

### Escrow.sol
- **Roles**: DEFAULT_ADMIN
- **Core**: Holds ETH deposits per property, tracks per-user contributions
- **Purchase flow**: `purchase()` → mint tokens via PropertyToken → update league score
- **Refund flow**: 3% APR calculated from deposit timestamp, tokens burned on refund
- **Automation**: Chainlink AutomationCompatible for deadline monitoring
- **Key functions**: `purchase()`, `processRefund()`, `checkUpkeep()`, `performUpkeep()`

### Governance.sol
- **Roles**: PROPOSER, EXECUTOR, RELAYER
- **Voting**: Phase-weighted via PropertyToken.getVotingPower()
- **Gasless voting**: EIP-712 typed signatures, relayer submits on behalf of voters
- **Community polls**: Non-binding polls that can escalate to formal proposals
- **AI moderation**: Proposal content screening before activation
- **Key functions**: `createProposal()`, `castVote()`, `castVoteWithSignature()`, `executeProposal()`
- **RevitaLeague**: Top-10 city proposals auto-mint bonus tokens; +0.75% APR for top-50 cities

### PhaseManager.sol
- **Roles**: DEFAULT_ADMIN
- **Automation**: Chainlink Automation calls `checkUpkeep()`/`performUpkeep()` to auto-advance phases
- **Threshold**: 75% engagement (ENGAGEMENT_THRESHOLD = 7500 BPS) + 7-day minimum per phase
- **League updates**: `runLeagueUpdate()` called daily — calculates Forrester GDP scores, updates PropertyToken.leagueScore
- **Key functions**: `registerProperty()`, `checkUpkeep()`, `performUpkeep()`, `runLeagueUpdate()`

### Treasury.sol
- **Roles**: EXECUTOR, SIGNER
- **Multi-sig**: 2-of-3 confirmations required for disbursements
- **Founder cut**: 1% (FOUNDER_CUT_BPS = 100), 24-month vesting, 90-day cliff
- **Reserve verification**: Chainlink Functions oracle for on-chain reserve proof
- **Competition fees**: 0.35% competition fee + 0.1% visit fee on RevitaLeague events
- **Key functions**: `submitTransaction()`, `confirmTransaction()`, `executeTransaction()`, `claimFounderVesting()`

### Contract Interaction Flow
```
User Purchase → Escrow.purchase()
  → PropertyToken.mintTokens() (mints ERC-1155)
  → PropertyToken.updateLeagueScore() (boost rank)
  → Treasury receives funds
  → Treasury auto-deducts 1% founder cut (vested)

Phase Advance → PhaseManager.performUpkeep() (Chainlink Automation)
  → PropertyToken.advancePhase()
  → Price increases (1.0x → 1.5x → 2.25x → 3.0x)

Funding Failure → Escrow.processRefund()
  → 3% APR interest calculated
  → PropertyToken.burnFromOnFailure() (burns tokens)
  → ETH + interest returned to investor

Governance → Governance.createProposal()
  → castVote() with phase-weighted voting power
  → executeProposal() → Treasury.submitTransaction()
```

---

## Authentication Flow

1. User clicks "Log In" → redirects to Replit OAuth (`/api/login`)
2. Replit OpenID Connect callback → `/api/callback` → session created
3. User record upserted in `users` table (Replit profile data)
4. Frontend checks `/api/auth/user` for session state
5. Optional: User connects wallet via RainbowKit → `walletAddress` saved to user record
6. KYC: User submits verification → admin approves/rejects via admin panel

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Express session encryption |
| `VITE_MAPBOX_TOKEN` | Mapbox API token (frontend) |
| `SMTP_HOST` | Email server host |
| `SMTP_PORT` | Email server port |
| `SMTP_USER` | Email username |
| `SMTP_PASS` | Email password |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | GCS bucket ID |
| `PUBLIC_OBJECT_SEARCH_PATHS` | GCS public paths |
| `PRIVATE_OBJECT_DIR` | GCS private directory |
| `PRIVATE_KEY` | Blockchain wallet private key (for contract deployment) |

---

## Key Patterns

- **Data flow**: Frontend → TanStack Query → `fetch(/api/...)` → Express route → IStorage → Drizzle → PostgreSQL
- **Cache invalidation**: `queryClient.invalidateQueries({ queryKey: [...] })` after mutations
- **Form handling**: react-hook-form + zodResolver with Drizzle insert schemas
- **Component imports**: `@/components/ui/*` (shadcn), `@/components/*` (app), `@/lib/*` (utils), `@shared/*` (schema)
- **Styling**: Tailwind utility classes + HSL CSS variables for theming. Always use explicit `dark:` variants when not using configured utility classes
- **Maps**: Leaflet for lightweight/homepage use, Mapbox for geocoding/advanced features
- **Icons**: lucide-react for UI icons, react-icons/si for brand logos
