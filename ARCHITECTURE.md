# RevitaHub — Technical Architecture

RevitaHub is a community-owned real estate revitalization platform on Base (Coinbase L2). It uses ERC-1155 tokenization to enable fractional property ownership starting at $12.50/token, DAO governance with phase-weighted voting, and a transparent 1% founder sustainability cut. Built by Build Our Community, LLC.

> **Platform Status**: Pre-launch / blank-state configuration. All database tables are empty, all pages are API-driven with proper empty-state handling, and no seed or mock data exists.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (New York style) |
| Routing | Wouter |
| State | TanStack React Query v5 |
| Maps | Leaflet (homepage, league), Mapbox via react-map-gl (properties, nominate) |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend | Node.js, Express, TypeScript (ESM) |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Auth | Replit OpenID Connect (passport) + RainbowKit wallet connection |
| Blockchain | Base L2, wagmi, RainbowKit, Solidity 0.8.20 |
| Contracts | OpenZeppelin (ERC-1155, AccessControl), Chainlink (Automation, Functions) |
| Payments | Stripe |
| Email | Nodemailer (SMTP) |
| File Storage | Replit Object Storage |
| Build | Vite (frontend), esbuild (backend) |

---

## Directory Structure

```
/
├── client/
│   └── src/
│       ├── App.tsx                  # Router — all 34 page routes registered here
│       ├── main.tsx                 # React entry point
│       ├── index.css                # Tailwind + HSL color variables (dark/light)
│       ├── pages/
│       │   ├── home.tsx             # Landing: AppleHero Leaflet map, stats, CTAs
│       │   ├── properties.tsx       # Property listing with Mapbox map + filters
│       │   ├── property-detail.tsx  # Full property view: offerings, impact cards, city competition
│       │   ├── dashboard.tsx        # Investor: portfolio, holdings, achievements, refund requests
│       │   ├── governance.tsx       # Proposals list + voting
│       │   ├── community.tsx        # Community priorities voting
│       │   ├── league.tsx           # RevitaLeague: 4 leagues, leaderboards, rivalries, map
│       │   ├── impact-simulator.tsx # Georgia GDP impact simulator with adoption tiers
│       │   ├── services.tsx         # Service provider marketplace (bid submission)
│       │   ├── wishlist.tsx         # Zip-code business voting
│       │   ├── treasury.tsx         # Treasury fund allocation + founder economics
│       │   ├── nominate.tsx         # Property nomination with Mapbox geocoding
│       │   ├── submit.tsx           # Property submission form
│       │   ├── tokenize.tsx         # Tokenization wizard
│       │   ├── admin.tsx            # Admin panel: properties, KYC, nominations, reconciliation
│       │   ├── litepaper.tsx        # Platform litepaper
│       │   ├── tokenization-process.tsx # How-it-works flow diagram
│       │   ├── faq.tsx              # FAQ page
│       │   ├── about.tsx            # About / team
│       │   ├── learn.tsx            # Educational content
│       │   ├── grants.tsx           # Grant funding info
│       │   ├── ai-insights.tsx      # AI-powered engagement analytics
│       │   ├── business-layer.tsx   # Business model details
│       │   ├── demand-dashboard.tsx # Market demand analytics
│       │   ├── founder-dashboard.tsx # Founder-specific metrics
│       │   ├── owner-response.tsx   # Owner response to nomination (token-based)
│       │   ├── transfers.tsx        # Share transfer requests and history
│       │   ├── terms.tsx            # Terms of Service (draft placeholder)
│       │   ├── privacy.tsx          # Privacy Policy (draft placeholder)
│       │   ├── risk-disclosure.tsx  # Risk disclosure with interactive acknowledgment
│       │   ├── professionals.tsx    # Professional directory with filters
│       │   ├── professional-apply.tsx # 6-step professional application wizard
│       │   ├── professional-dashboard.tsx # Dashboard for verified professionals
│       │   └── not-found.tsx        # 404 page
│       ├── components/
│       │   ├── Header.tsx           # Main nav: public + authenticated links
│       │   ├── Footer.tsx           # Footer: platform/resources/company links + legal disclaimer
│       │   ├── AppleHero.tsx        # Homepage hero with Leaflet map + phase-colored markers
│       │   ├── WalletButton.tsx     # RainbowKit connect button
│       │   ├── WalletProvider.tsx   # wagmi + RainbowKit provider (Base network)
│       │   ├── ThemeProvider.tsx    # Dark/light mode toggle
│       │   ├── ThemeToggle.tsx      # Theme switch button
│       │   ├── BetaBanner.tsx       # Beta notice banner
│       │   ├── BehavioralNudge.tsx  # AI-nudged engagement prompts
│       │   ├── InvestorOnboardingGate.tsx # Linear gate: Auth → KYC → Risk Disclosure → Purchase
│       │   ├── TokenPurchaseModal.tsx # Token purchase flow modal
│       │   ├── SimplePurchaseModal.tsx # Simplified purchase
│       │   ├── PhaseOfferingCard.tsx # Phase-specific offering display
│       │   ├── CapitalStackDisplay.tsx # Capital stack visualization
│       │   ├── PortfolioOverview.tsx # Portfolio metrics card
│       │   ├── TransactionHistory.tsx # Transaction list
│       │   ├── KYCVerification.tsx  # KYC status + verification
│       │   ├── PropertyCard.tsx     # Property list item card (optional image with placeholder)
│       │   ├── ProposalCard.tsx     # Governance proposal card
│       │   ├── ROICalculator.tsx    # ROI projection calculator
│       │   ├── ShareModal.tsx       # Social share modal
│       │   ├── ObjectUploader.tsx   # Replit Object Storage file uploader
│       │   ├── PrivateAccessGate.tsx # Access code gate for private offerings
│       │   ├── StateComplianceTable.tsx # State regulatory compliance
│       │   ├── StateFilter.tsx      # State filter dropdown
│       │   ├── WaitlistModal.tsx    # Waitlist signup
│       │   ├── FeaturedProperties.tsx # Featured property carousel (API-driven)
│       │   ├── HowItWorks.tsx       # Step-by-step explainer
│       │   ├── CTASection.tsx       # Call-to-action sections
│       │   ├── FourStepCTA.tsx      # 4-step CTA flow
│       │   ├── FundingTimeline.tsx  # Funding deadline timeline
│       │   ├── ImpactStats.tsx      # Impact statistics display (API-driven)
│       │   ├── TrustSection.tsx     # Trust/security badges
│       │   ├── StatCard.tsx         # Metric stat card
│       │   ├── LearnCard.tsx        # Educational card
│       │   ├── SummaryPanel.tsx     # Summary panel
│       │   ├── SimpleHeader.tsx     # Simplified header variant
│       │   ├── HeroSection.tsx      # Hero section variant
│       │   ├── AIInsightsBanner.tsx # AI insights banner
│       │   ├── NominatePropertyCTA.tsx # Nominate property CTA
│       │   ├── TokenizePropertyCTA.tsx # Tokenize property CTA
│       │   ├── TokenOfferingTimeline.tsx # Token offering timeline
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
│   ├── index.ts                     # Express app bootstrap + Helmet.js (CSP enabled) + server start
│   ├── routes.ts                    # All API route handlers (104 endpoints)
│   ├── storage.ts                   # IStorage interface + MemStorage fallback
│   ├── databaseStorage.ts           # DatabaseStorage — PostgreSQL implementation of IStorage
│   ├── db.ts                        # Drizzle client setup (DATABASE_URL)
│   ├── vite.ts                      # Vite dev server middleware
│   ├── static.ts                    # Static file serving (production)
│   ├── middleware/
│   │   └── rateLimit.ts             # purchaseRateLimit, voteRateLimit, authRateLimit, globalWriteRateLimit
│   ├── services/
│   │   ├── auditLog.ts              # logAuditEvent() — system-wide event logging
│   │   ├── blockchain.ts            # Web3 contract interaction (deploy, mint, read)
│   │   ├── email.ts                 # Nodemailer email service (SMTP)
│   │   ├── notifications.ts         # Notification dispatch
│   │   ├── payments.ts              # Stripe payment processing
│   │   ├── scheduler.ts             # Funding deadlines, phase advances, proposal status
│   │   ├── ownerDetection.ts        # Property owner lookup
│   │   └── tokenizationOrchestrator.ts # End-to-end tokenization workflow
│   └── replit_integrations/
│       ├── auth/
│       │   ├── index.ts             # Exports isAuthenticated, requireKYCApproved, isAdmin
│       │   ├── replitAuth.ts        # Passport OIDC setup, session hardening, KYC middleware, auth routes
│       │   ├── routes.ts            # Auth route wrapper
│       │   └── storage.ts           # Auth user upsert
│       └── object_storage/
│           ├── index.ts             # Object storage client
│           ├── objectStorage.ts     # Storage operations
│           ├── objectAcl.ts         # Access control
│           └── routes.ts            # POST /api/uploads/request-url, GET /objects/:objectPath(*)
├── shared/
│   ├── schema.ts                    # All Drizzle tables, enums, Zod schemas, types, config constants
│   └── models/
│       └── auth.ts                  # User + Session tables (Replit auth)
├── contracts/
│   ├── PropertyToken.sol            # ERC-1155 with phase pricing, transfer locks, voting power
│   ├── Escrow.sol                   # Purchase handling, 3% APR refunds, token burning
│   ├── Governance.sol               # DAO voting, gasless signatures, polls
│   ├── PhaseManager.sol             # Chainlink Automation for engagement-driven phase advancement
│   └── Treasury.sol                 # Multi-sig treasury, founder vesting, reserve verification
├── drizzle.config.ts                # Drizzle Kit config
├── vite.config.ts                   # Vite config (aliases: @/, @shared/, @assets/)
├── tailwind.config.ts               # Tailwind config (darkMode: class)
├── tsconfig.json                    # TypeScript config
└── package.json                     # Dependencies + scripts
```

---

## Middleware & Security

### Security Headers (server/index.ts)
- **Helmet.js**: HSTS, X-Frame-Options, X-XSS-Protection, X-Content-Type-Options
- **CSP**: Enabled with directives: `default-src 'self'`, `script-src 'self' 'unsafe-inline' 'unsafe-eval'`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data: blob: https: http:`, `connect-src 'self' + Mapbox/Replit/Stripe/Base/WalletConnect domains`, `frame-src 'self' https://js.stripe.com`, `worker-src 'self' blob:`, `object-src 'none'`
- **Additional middleware**: JSON body parsing with raw-body verify (for Stripe webhooks), URL encoding, API request logging, error handler

### Session Hardening (server/replit_integrations/auth/replitAuth.ts)
- `sameSite: 'lax'` cookie policy
- 8-hour `maxAge` session expiration
- `SESSION_SECRET` environment variable for encryption

### Rate Limiting (server/middleware/rateLimit.ts)

| Middleware | Scope | Limit |
|-----------|-------|-------|
| `globalWriteRateLimit` | All POST/PATCH/PUT/DELETE requests | 30 req/min per IP |
| `purchaseRateLimit` | Purchase endpoints | Endpoint-specific |
| `voteRateLimit` | Vote endpoints | Endpoint-specific |
| `authRateLimit` | Auth endpoints | Endpoint-specific |

### Auth Middleware (server/replit_integrations/auth/)

| Middleware | Check | Used On |
|-----------|-------|---------|
| `isAuthenticated` | Active session exists | All user-specific endpoints |
| `requireKYCApproved` | `user.kycStatus === "verified"` | All purchase endpoints |
| `isAdmin` | `user.role === "admin"` | All admin endpoints |

### Additional Security
- **Risk Disclosure Enforcement**: Server-side check for `riskDisclosureAcknowledgedAt` on purchase endpoints
- **IDOR Prevention**: Key create endpoints inject identity from session — `POST /api/properties` sets `ownerId`, `POST /api/property-submissions` sets `userId`, `POST /api/nominations` sets `nominatorId`, `POST /api/purchases` sets `userId` from `req.session.userId`. Client-supplied identity fields are overridden server-side.
- **Ownership Authorization**: Property submission mutations (`PATCH`, `submit`, `documents`, `delete document`) verify `submission.userId === req.session.userId` and return 403 if the requesting user is not the submission owner.
- **Soft Deletes**: `deletedAt` columns on financial tables (tokenPurchases, tokenHoldings, tokenOfferings, proposals, tokenRefunds)
- **Stripe Webhook Verification**: `POST /api/webhooks/stripe` uses `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)` for signature verification. Raw body captured via Express JSON `verify` callback. Returns 400 on invalid signature. Includes idempotency check to prevent duplicate payment processing.
- **Audit Log**: All significant actions logged to `audit_log` table with userId, action, IP, timestamp

---

## Database Schema (shared/schema.ts + shared/models/auth.ts)

### Enums (26 total)
| Enum | Values |
|------|--------|
| `kycStatus` | pending, submitted, verified, rejected |
| `propertyType` | vacant_land, historic_building, commercial, downtown |
| `propertyStatus` | draft, submitted, under_review, approved, tokenizing, live, funded, rejected |
| `offeringPhase` | county, state, national, international |
| `offeringType` | public, private |
| `offeringStatus` | upcoming, active, completed, cancelled, failed_funding |
| `fundingOutcome` | in_progress, funded, failed, refunded |
| `purchaseStatus` | pending, confirmed, failed, refunded |
| `reconciliationStatus` | pending_payment, payment_received, minting, confirmed, failed_mint, refund_initiated |
| `refundStatus` | pending, processing, completed, failed |
| `shareTransferStatus` | pending, approved, completed, rejected |
| `proposalStatus` | draft, active, passed, rejected, executed |
| `nominationStatus` | submitted, under_review, approved, in_voting, selected, rejected |
| `ownerDetectionStatus` | pending, searching, found, not_found, verified |
| `useProposalStatus` | proposed, in_voting, approved, rejected |
| `submissionStatus` | draft, submitted, under_review, approved, rejected, needs_revision |
| `inviteStatus` | pending, sent, accepted, declined, expired |
| `waitlistRole` | investor, property_owner, community_member, other |
| `grantLevel` | city, county, state, federal |
| `grantStatus` | identified, applied, under_review, awarded, disbursed, rejected, expired |
| `grantType` | community_development, historic_preservation, brownfield_remediation, affordable_housing, economic_development, infrastructure, environmental, opportunity_zone, tax_credit, other |
| `contactMethod` | email, sms, phone, mail, portal_link |
| `contactStatus` | pending, sent, delivered, opened, responded, bounced, failed |
| `deploymentStatus` | pending, deploying, deployed, verified, failed |
| `serviceBidStatus` | pending, approved, rejected |
| `userRole` | user, admin |

### Tables (35 total)

**users** (via shared/models/auth.ts — Replit Auth)
- `id` (varchar PK), `email`, `firstName`, `lastName`, `profileImageUrl`, `walletAddress`, `county`, `state`, `country`, `kycStatus` (text, default "pending"), `kycVerifiedAt`, `role` (userRole enum, default "user"), `riskDisclosureAcknowledgedAt`, `emailNotificationsEnabled` (boolean, default true), `createdAt`, `updatedAt`

**sessions** (via shared/models/auth.ts)
- `sid` (varchar PK), `sess` (text, JSON), `expire` (timestamp)

**properties**
- `id` (varchar PK, UUID), `ownerId`, `name`, `description`, `propertyType` (enum), `status` (enum, default "draft")
- `streetAddress`, `city`, `county`, `state`, `zipCode`, `parcelNumber`
- `acreage`, `squareFootage`, `yearBuilt`, `currentUse`, `proposedUse`
- `estimatedValue`, `fundingGoal`, `communityBenefits`, `projectedROI`, `projectedJobs`, `projectedHousingUnits`
- `imageUrl`, `documentUrls`, `submittedAt`, `approvedAt`, `createdAt`

**tokenOfferings**
- `id` (varchar PK), `propertyId` (FK), `tokenSymbol`, `tokenName`, `totalSupply`, `tokensSold`
- `contractAddress`, `currentPhase` (enum), `status` (enum), `fundingOutcome` (enum)
- `minimumFundingThreshold`, `fundingDeadline`, `totalFundingRaised`, `interestRateOnRefund`
- `offeringType` (public/private), `accessCode`, `deletedAt`, `createdAt`

**offeringPhases**
- `id`, `offeringId` (FK), `phase` (county/state/national/international), `phaseOrder`
- `basePrice`, `currentPrice`, `priceMultiplier`, `tokenAllocation`, `tokensSold`, `maxTokensPerPerson`
- `eligibilityCounty`, `eligibilityState`, `eligibilityCountry`
- `startsAt`, `endsAt`, `isActive`

**fundEscrow**
- `id`, `offeringId` (FK), `totalUsdcDeposited`, `escrowWalletAddress`, `isActive` (boolean), `createdAt`

**tokenPurchases**
- `id`, `userId`, `offeringId`, `phaseId`, `tokenCount`, `pricePerToken`, `totalAmount`
- `paymentMethod`, `paymentIntentId`, `status` (purchaseStatus enum), `reconciliationStatus` (enum)
- `deletedAt`, `purchasedAt`

**tokenHoldings**
- `id`, `userId`, `offeringId`, `tokenCount`, `averagePurchasePrice`, `votingPower`
- `lastUpdated`, `deletedAt`

**tokenRefunds**
- `id`, `userId`, `offeringId`, `tokenCount`, `originalAmount`, `interestEarned`, `totalRefundAmount`
- `refundTransactionHash`, `status` (enum), `requestedAt`, `processedAt`, `deletedAt`

**shareTransfers**
- `id`, `userId`, `fromOfferingId` (FK), `toOfferingId` (FK), `tokenCount`
- `originalValue`, `transferValue`, `status` (enum), `requestedAt`, `completedAt`

**proposals**
- `id`, `propertyId`, `offeringId`, `proposerId`, `title`, `description`
- `status` (enum), `votesFor`, `votesAgainst`, `totalVoters`, `quorumRequired`
- `startsAt`, `endsAt`, `deletedAt`, `createdAt`

**votes**
- `id`, `proposalId`, `userId`, `offeringId`, `voteDirection`, `tokenBalance`, `votingPower`, `votedAt`

**propertyNominations**
- `id`, `nominatorId` (FK), `propertyAddress`, `city`, `county`, `state`, `zipCode`
- `latitude`, `longitude`, `parcelId`
- `description`, `whyThisProperty`, `currentCondition`, `estimatedSize`
- `desiredUses` (text array), `topVotedUse`
- `ownerDetectionStatus` (enum), `detectedOwnerName`, `detectedOwnerType`, `detectedOwnerAddress`, `detectedOwnerEmail`, `detectedOwnerPhone`
- `ownerDataSource`, `ownerDataConfidence` (0-100)
- `ownerNotifiedAt`, `ownerNotificationLink`, `ownerResponseStatus` (text: pending/interested/not_interested)
- `status` (enum, default "submitted"), `nominationVotes`, `createdAt`

**nominationVotes**
- `id`, `nominationId`, `userId`, `createdAt`

**propertyUseProposals**
- `id`, `nominationId`, `userId`, `proposedUse`, `description`
- `estimatedBudget`, `estimatedJobs`, `estimatedTimeline`
- `status` (enum), `votesFor`, `votesAgainst`, `totalVoters`, `createdAt`

**useProposalVotes**
- `id`, `proposalId`, `userId`, `voteDirection`, `createdAt`

**communityNeeds**
- `id`, `zipCode`, `category`, `need`, `description`, `voteCount`, `createdAt`

**communityNeedVotes**
- `id`, `needId`, `userId`, `createdAt`

**desiredUseVotes**
- `id`, `nominationId`, `userId`, `desiredUse`, `createdAt`

**propertyGrants**
- `id`, `propertyId`, `grantName`, `grantingAgency`, `amount`, `level` (enum), `grantType` (enum), `status` (enum)
- `applicationDeadline`, `matchRequirement`, `isStackable`, `maxPerProperty`
- `eligibilityCriteria`, `notes`, `appliedAt`, `awardedAt`, `createdAt`

**ownerContactAttempts**
- `id`, `nominationId` (FK), `method` (enum), `recipient`, `subject`, `messagePreview`
- `portalLinkToken`, `status` (enum), `sentAt`, `deliveredAt`, `openedAt`, `respondedAt`, `response`, `createdAt`

**blockchainDeployments**
- `id`, `offeringId` (FK), `propertyId` (FK), `contractType` (ERC20/ERC1155)
- `contractAddress`, `deployerAddress`, `networkId` (default 8453 / Base mainnet), `networkName` (default "Base")
- `deploymentTxHash`, `blockNumber`, `tokenName`, `tokenSymbol`, `totalSupply`, `decimals`
- `status` (enum), `verificationUrl`, `errorMessage`, `deployedAt`, `verifiedAt`, `createdAt`

**propertySubmissions**
- `id`, `userId`, `propertyName`, `description`, `propertyType` (enum)
- `streetAddress`, `city`, `county`, `state`, `zipCode`, `status` (enum)
- `acreage`, `squareFootage`, `yearBuilt`, `currentUse`, `proposedUse`
- `estimatedValue`, `fundingGoal`, `communityBenefits`, `projectedROI`, `projectedJobs`, `projectedHousingUnits`
- `additionalNotes`, `reviewNotes`, `submittedAt`, `reviewedAt`, `createdAt`

**submissionDocuments**
- `id`, `submissionId`, `fileName`, `fileUrl`, `fileType`, `uploadedAt`

**privateOfferingInvites**
- `id`, `offeringId`, `email`, `inviteCode`, `status` (enum), `invitedBy`
- `maxTokens`, `tokensUsed`, `expiresAt`, `acceptedAt`, `createdAt`

**waitlist**
- `id`, `email` (unique), `role` (waitlistRole enum), `message` (varchar 250), `createdAt`

**wishes** (Community Wishlist)
- `id`, `title`, `description`, `category`, `location`, `zipCode`
- `votes` (default 0), `email`, `takeItFurther` (boolean), `createdAt`

**serviceBids** (Service Provider Marketplace)
- `id`, `serviceType`, `zipCode`, `companyName`, `contactEmail`, `description`
- `bidAmount`, `status` (enum), `createdAt`

**auditLog**
- `id` (serial), `userId`, `action`, `targetTable`, `targetId`, `metadata`, `ipAddress`, `timestamp`

**professionalProfiles**
- `id` (varchar PK, UUID), `userId` (FK → users), `licenseNumber`, `licenseState`, `licenseType`, `licenseExpiry`
- `isLicenseVerified` (boolean, default false), `licenseVerifiedAt`
- `insuranceProvider`, `insurancePolicyNumber`, `insuranceExpiry`, `isInsuranceVerified` (boolean, default false)
- `bondingAmount`, `isBonded` (boolean, default false)
- `specialties` (text[]), `serviceCounties` (text[]), `serviceStates` (text[])
- `bio`, `companyName`, `website`, `phoneNumber`, `yearsExperience`
- `completedProjects` (default 0), `averageRating`, `totalEndorsements` (default 0), `reputationScore` (default 0)
- `isAvailable` (boolean, default true), `createdAt`, `updatedAt`

**professionalEndorsements**
- `id` (varchar PK, UUID), `professionalId` (FK → professionalProfiles), `userId` (FK → users), `comment`, `createdAt`

**projectProfessionalMatches**
- `id` (varchar PK, UUID), `offeringId` (FK → tokenOfferings), `professionalId` (FK → professionalProfiles)
- `roleNeeded`, `status` (text, default "invited"), `proposalDetails`, `proposedAmount`, `tokenAllocationPercent`, `tokenAllocationAmount`
- `invitedAt`, `respondedAt`, `selectedAt`, `completedAt`, `createdAt`

**professionalServiceAreas**
- `id` (varchar PK, UUID), `professionalId` (FK → professionalProfiles), `county`, `state`, `zipCode`
- `projectTypes` (text[]), `isActive` (boolean, default true), `createdAt`

**agentTasks**
- `id` (serial PK), `agentType`, `status` (text, default "queued"), `priority` (default 3)
- `inputData` (jsonb), `outputData` (jsonb), `relatedPropertyId`, `relatedOfferingId`, `relatedUserId`
- `errorMessage`, `scheduledFor`, `startedAt`, `completedAt`, `retryCount` (default 0), `maxRetries` (default 3), `createdAt`

**reputationEvents**
- `id` (serial PK), `professionalId` (FK → professionalProfiles), `eventType`, `pointsDelta`, `description`
- `relatedProjectId`, `createdAt`

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
  totalDurationDays: 365,
  phaseDurations: {
    county:        { daysMin: 30, daysMax: 90,  targetPercent: 25  },
    state:         { daysMin: 45, daysMax: 120, targetPercent: 50  },
    national:      { daysMin: 60, daysMax: 120, targetPercent: 75  },
    international: { daysMin: 30, daysMax: 35,  targetPercent: 100 },
  },
  refundAPR: 3.0,
  engagementThreshold: 0.75,
}
```

---

## API Routes (server/routes.ts — 104 endpoints)

### Platform
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stats` | No | Platform statistics (properties, raised, investors) |

### Properties
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/properties` | No | List all properties |
| GET | `/api/properties/:id` | No | Get property detail |
| POST | `/api/properties` | Yes | Create property (ownerId set from session) |

### Token Offerings & Phases
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/offerings/:offeringId/phases` | No | List phases for offering |
| GET | `/api/offerings/:offeringId/active-phase` | No | Get current active phase |
| GET | `/api/offerings/:offeringId/with-access` | No | Get offering with access check |
| POST | `/api/offerings/:offeringId/advance-phase` | Yes + Admin | Advance to next phase |
| POST | `/api/offerings/:offeringId/process-refunds` | Yes + Admin | Process 3% APR refunds |

### Purchases & Holdings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/purchases/check-eligibility` | No | Check purchase eligibility |
| POST | `/api/purchases` | Yes + KYC + Rate | Create purchase |
| POST | `/api/purchase` | Yes + KYC + Rate | Authenticated purchase (primary flow) |
| POST | `/api/purchase/confirm` | Yes + KYC + Rate | Confirm purchase (two-phase reconciliation) |
| GET | `/api/users/:userId/holdings` | No | Get user holdings |
| GET | `/api/users/:userId/voting-power/:offeringId` | No | Get voting power |

### User Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/user` | Yes | Current user profile |
| GET | `/api/user/holdings` | Yes | Authenticated user holdings |
| GET | `/api/user/purchases` | Yes | User purchase history |
| POST | `/api/user/kyc` | Yes | Submit KYC verification |
| POST | `/api/user/wallet` | Yes | Save wallet address |
| POST | `/api/user/acknowledge-risks` | Yes | Acknowledge risk disclosure |
| PATCH | `/api/user/email-preferences` | Yes | Toggle email notifications |

### Transfers & Refunds
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/user/transfers` | Yes | Get user transfer history |
| POST | `/api/transfers` | Yes | Request share transfer |
| GET | `/api/user/refunds` | Yes | Get user refund history |
| POST | `/api/refunds` | Yes | Request refund |

### Governance
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/proposals` | No | List proposals (optional offeringId filter) |
| GET | `/api/proposals/:id` | No | Get proposal detail |
| POST | `/api/proposals` | Yes | Create proposal |
| POST | `/api/proposals/:id/vote` | Yes + Rate | Cast vote (rate-limited) |

### Property Submissions (Owner Flow)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/property-submissions` | Yes | Create submission (userId set from session) |
| GET | `/api/property-submissions/:id` | No | Get submission |
| GET | `/api/property-submissions` | No | List submissions |
| PATCH | `/api/property-submissions/:id` | Yes + Owner | Update submission (owner-only) |
| POST | `/api/property-submissions/:id/submit` | Yes + Owner | Submit for review (owner-only) |
| PATCH | `/api/property-submissions/:id/status` | Yes + Admin | Update status (admin) |
| POST | `/api/property-submissions/:id/documents` | Yes + Owner | Add document (owner-only) |
| GET | `/api/property-submissions/:id/documents` | No | List documents |
| DELETE | `/api/property-submissions/:submissionId/documents/:docId` | Yes + Owner | Delete document (owner-only) |
| GET | `/api/submissions` | No | List submissions (alternate) |

### Property Nominations (Community Flow)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/nominations` | Yes | Create nomination (nominatorId set from session) |
| GET | `/api/nominations` | No | List nominations |
| GET | `/api/nominations/:id` | No | Get nomination |
| POST | `/api/nominations/:id/vote` | No | Vote on nomination |
| POST | `/api/nominations/:id/approve` | Yes + Admin | Approve nomination |
| POST | `/api/nominations/:id/lookup-owner` | Yes + Admin | Trigger owner detection |
| POST | `/api/nominations/:id/notify-owner` | Yes + Admin | Send owner notification |
| GET | `/api/owner-response/:token` | No | Get owner response page |
| POST | `/api/owner-response/:token` | No | Submit owner response |

### Owner Lookup
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/owner-lookup/address` | Yes + Admin | Owner lookup by address |
| POST | `/api/owner-lookup/coordinates` | Yes + Admin | Owner lookup by coordinates |

### Tokenization & Blockchain
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/tokenize` | Yes + Admin | Start tokenization process |
| GET | `/api/tokenization-status/:propertyId` | No | Check tokenization status |
| GET | `/api/blockchain/explorer/:type/:value` | No | Block explorer lookup |

### Grants & Capital Stack
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/properties/:propertyId/grants` | No | List grants for property |
| GET | `/api/properties/:propertyId/capital-stack` | No | Capital stack summary |
| POST | `/api/properties/:propertyId/grants` | Yes | Add grant |
| PATCH | `/api/grants/:grantId` | Yes | Update grant |
| DELETE | `/api/grants/:grantId` | Yes | Delete grant |

### Private Offerings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/private-offerings/:offeringId/invites` | Yes | Create invite |
| GET | `/api/private-offerings/:offeringId/invites` | Yes | List invites |
| POST | `/api/private-offerings/validate-access` | No | Validate access code |
| POST | `/api/private-offerings/invites/:inviteId/accept` | Yes | Accept invite |

### Investor Protection
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/investor-protection/:propertyId` | No | 3% APR refund calculation |

### Community Features
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/wishes` | No | List wishes (optional zipCode filter) |
| POST | `/api/wishes` | No | Create wish |
| POST | `/api/wishes/:id/vote` | No | Vote on wish |
| GET | `/api/service-bids` | No | List service bids |
| POST | `/api/service-bids` | No | Submit service bid |
| PATCH | `/api/service-bids/:id/status` | Yes + Admin | Update bid status |

### Admin Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/offerings` | Admin | List all offerings |
| GET | `/api/admin/kyc-pending` | Admin | List pending KYC verifications |
| POST | `/api/admin/kyc/:userId/approve` | Admin | Approve KYC |
| POST | `/api/admin/kyc/:userId/reject` | Admin | Reject KYC |
| GET | `/api/admin/reconciliation/stuck` | Admin | List stuck purchases (>10 min pending) |
| GET | `/api/admin/reconciliation/all` | Admin | List all purchases with reconciliation status |
| POST | `/api/admin/reconciliation/:purchaseId/retry` | Admin | Retry stuck purchase |
| POST | `/api/admin/reconciliation/:purchaseId/refund` | Admin | Refund stuck purchase |

### Object Storage (Replit Integration)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/uploads/request-url` | Yes | Request signed upload URL (authenticated users only) |
| GET | `/objects/:objectPath(*)` | No | Serve stored object/file |

### Other
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/waitlist` | No | Join waitlist |
| POST | `/api/webhooks/stripe` | Stripe Sig | Stripe webhook (verified via `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`) |

### Professional Matching
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/professionals` | No | List verified professionals (filters: county, state, specialty, role) |
| GET | `/api/professionals/available/:county` | No | Professionals by county |
| GET | `/api/professionals/opportunities/:county` | Yes | Opportunities for professionals in county |
| GET | `/api/professionals/:id` | No | Professional detail with endorsement count |
| POST | `/api/professionals/apply` | Yes | Create professional profile |
| PATCH | `/api/professionals/:id` | Yes + Owner | Update own professional profile |
| POST | `/api/professionals/express-interest` | Yes | Express interest in opportunity |
| GET | `/api/professionals/:id/matches` | Yes + Owner | Professional's matches |
| GET | `/api/professionals/:id/endorsements` | No | Get endorsements for professional |
| POST | `/api/professionals/:id/endorse` | Yes | Create endorsement |
| POST | `/api/professionals/:id/service-areas` | Yes + Owner | Add service area |
| DELETE | `/api/professionals/:id/service-areas/:areaId` | Yes + Owner | Delete service area |
| POST | `/api/professionals/matches/:matchId/respond` | Yes | Respond to match invitation |
| GET | `/api/admin/professionals/pending` | Admin | List pending professional verifications |
| POST | `/api/admin/professionals/:id/verify` | Admin | Verify professional |
| POST | `/api/admin/professionals/:id/reject` | Admin | Reject professional |
| POST | `/api/admin/professionals/:id/suspend` | Admin | Suspend professional |
| GET | `/api/offerings/:offeringId/professionals` | No | List matched professionals for offering |
| POST | `/api/offerings/:offeringId/professionals/invite` | Admin | Invite professional to offering |
| POST | `/api/offerings/:offeringId/professionals/select` | Admin | Select professional for offering |

### Agent Tasks
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/agent-tasks` | Admin | List agent tasks (optional status filter) |
| POST | `/api/admin/agent-tasks` | Admin | Create agent task |
| PATCH | `/api/admin/agent-tasks/:id/status` | Admin | Update agent task status |

### Auth Routes (Replit Integration — replitAuth.ts)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/user` | Get current authenticated user |
| GET | `/api/login` | Redirect to Replit OAuth |
| GET | `/api/callback` | OAuth callback |
| GET | `/api/logout` | Logout |

---

## Frontend Pages & Routes (34 total)

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/` | home.tsx | Landing: AppleHero Leaflet map, featured properties, stats, CTAs |
| `/properties` | properties.tsx | Property listing with Mapbox map + filters |
| `/properties/:id` | property-detail.tsx | Full property view: offerings, phases, economic impact cards, city competition |
| `/dashboard` | dashboard.tsx | Investor: portfolio, holdings, achievements, refund requests |
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
| `/admin` | admin.tsx | Admin panel: properties, KYC, nominations, reconciliation |
| `/litepaper` | litepaper.tsx | Platform litepaper |
| `/how-it-works` | tokenization-process.tsx | Tokenization flow diagram |
| `/faq` | faq.tsx | FAQ |
| `/about` | about.tsx | About/team/contact |
| `/learn` | learn.tsx | Educational content |
| `/grants` | grants.tsx | Grant funding info |
| `/ai-insights` | ai-insights.tsx | AI-powered engagement analytics |
| `/business` | business-layer.tsx | Business model details |
| `/demand` | demand-dashboard.tsx | Market demand analytics |
| `/founder` | founder-dashboard.tsx | Founder-specific metrics |
| `/owner-response/:token` | owner-response.tsx | Owner response to nomination |
| `/transfers` | transfers.tsx | Share transfer requests and history |
| `/terms` | terms.tsx | Terms of Service (draft placeholder) |
| `/privacy` | privacy.tsx | Privacy Policy (draft placeholder) |
| `/risk-disclosure` | risk-disclosure.tsx | Risk categories with interactive acknowledgment |
| `/professionals` | professionals.tsx | Professional directory with filters |
| `/professionals/apply` | professional-apply.tsx | 6-step professional application wizard |
| `/dashboard/professional` | professional-dashboard.tsx | Dashboard for verified professionals |

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
| Audit Log | `server/services/auditLog.ts` | `logAuditEvent()` helper for system-wide event logging |
| Blockchain | `server/services/blockchain.ts` | Web3 contract interaction (deploy, mint, read) |
| Email | `server/services/email.ts` | SMTP via Nodemailer (purchase confirmations, refund notifications, proposal alerts, phase change notices) |
| Notifications | `server/services/notifications.ts` | Notification dispatch layer |
| Owner Detection | `server/services/ownerDetection.ts` | Property owner lookup by address/coordinates |
| Payments | `server/services/payments.ts` | Stripe payment intents, webhook processing |
| Scheduler | `server/services/scheduler.ts` | Cron-like service for funding deadlines, phase auto-advance, proposal status updates |
| Tokenization | `server/services/tokenizationOrchestrator.ts` | End-to-end: create offering → deploy contract → set phases → go live |

---

## Smart Contracts (contracts/)

### PropertyToken.sol (ERC-1155)
- **Roles**: DEFAULT_ADMIN, MINTER, PAUSER, WHITELIST_ADMIN, PHASE_ADVANCER, BURNER
- **Property struct**: id, name, uri, totalSupply, mintedSupply, fundingTarget, fundingDeadline, currentPhase, isActive, isFunded
- **Phase pricing**: County 1.0x → State 1.5x → National 2.25x → International 3.0x (base $12.50)
- **Voting power**: Phase multipliers — County 1.5x, State 1.25x, National 1.0x, International 0.75x
- **Transfer locks**: Whitelist-only transfers until property is funded
- **Key functions**: `createProperty()`, `mintTokens()`, `advancePhase()`, `markFunded()`, `burnFromOnFailure()`, `getCurrentPrice()`, `getVotingPower()`, `addToWhitelist()`, `autoWhitelist()`

### Escrow.sol
- **Roles**: DEFAULT_ADMIN, OPERATOR
- **Core**: Holds ETH deposits per property, tracks per-user contributions, demand-adjusted targets
- **Purchase flow**: `purchase()` → mint tokens via PropertyToken
- **Refund flow**: 3% APR calculated from deposit timestamp, tokens burned on refund via `processRefunds()`
- **Automation**: Chainlink AutomationCompatible for deadline monitoring (`checkUpkeep()`/`performUpkeep()`)
- **Key functions**: `initializeEscrow()`, `purchase()`, `processRefunds()`, `calculateRefund()`, `releaseFunds()`, `updatePollDemand()`, `getDemandAdjustedTarget()`, `reportSuspiciousActivity()`

### Governance.sol
- **Roles**: PROPOSER, EXECUTOR, RELAYER
- **Voting**: Phase-weighted via PropertyToken.getVotingPower()
- **Gasless voting**: EIP-712 typed signatures via `castVoteBySignature()`, relayer submits on behalf of voters
- **Vote-to-earn**: `getVoteToEarnBonus()` for participation incentives
- **Key functions**: `createProposal()`, `castVote()`, `castVoteBySignature()`, `finalizeProposal()`, `executeProposal()`, `cancelProposal()`, `getActiveProposals()`

### PhaseManager.sol
- **Roles**: DEFAULT_ADMIN, OPERATOR
- **Automation**: Chainlink Automation calls `checkUpkeep()`/`performUpkeep()` to auto-advance phases
- **Threshold**: 75% engagement (ENGAGEMENT_THRESHOLD = 7500 BPS) + minimum phase duration
- **Engagement tracking**: `startTracking()`, `updateEngagement()`, `calculateEngagement()` with nudge system
- **Poll integration**: `recordPollParticipation()`, `updateEngagementWithPolls()`, `claimPollBoostBonus()`
- **Key functions**: `startTracking()`, `updateEngagement()`, `checkSubscriptionAdvancement()`, `claimEngagementBonus()`, `getCommunityHealth()`

### Treasury.sol
- **Roles**: DEFAULT_ADMIN, SIGNER, EXECUTOR
- **Multi-sig**: Configurable required confirmations for disbursements
- **Founder cut**: 1% (FOUNDER_CUT_BPS = 100), accrued via `_accrueVestedCut()`, claimed via `claimVestedCuts()`
- **Reserve verification**: Chainlink oracle via `verifyReserves()` and `verifyAndRecordReserves()`
- **Key functions**: `submitTransaction()`, `confirmTransaction()`, `executeTransaction()`, `revokeConfirmation()`, `claimVestedCuts()`, `getClaimableVested()`, `verifyReserves()`

### Contract Interaction Flow
```
User Purchase → Escrow.purchase()
  → PropertyToken.mintTokens() (mints ERC-1155)
  → Treasury receives funds
  → Treasury._accrueVestedCut() (1% founder cut accrued)

Phase Advance → PhaseManager.performUpkeep() (Chainlink Automation)
  → PropertyToken.advancePhase()
  → Price increases (1.0x → 1.5x → 2.25x → 3.0x)

Funding Failure → Escrow.processRefunds()
  → 3% APR interest calculated via calculateRefund()
  → PropertyToken.burnFromOnFailure() (burns tokens)
  → ETH + interest returned to investor

Governance → Governance.createProposal()
  → castVote() or castVoteBySignature() with phase-weighted voting power
  → finalizeProposal() → executeProposal() → Treasury.submitTransaction()
```

---

## Core Features

### Investor Onboarding Gate
Linear flow enforced by `InvestorOnboardingGate` component and server middleware:
1. **Authenticate** via Replit Auth
2. **Submit KYC** verification
3. **Admin approves** KYC (status → `verified`)
4. **Acknowledge risk disclosure** (writes timestamp to user record)
5. **Purchase unlocked** — can now buy tokens

### Token Purchase & Reconciliation
Two-phase payment reconciliation:
1. `POST /api/purchase` — create Stripe payment intent, purchase record with `reconciliationStatus: pending_payment`
2. Stripe webhook confirms payment → `payment_received`
3. Blockchain minting → `minting`
4. Confirmation → `confirmed`
5. Failure path: `failed_mint` or `refund_initiated` (only marks refunded after Stripe confirms)

### Admin Reconciliation Dashboard
- Lists stuck purchases (>10 minutes in pending state)
- Retry action: re-attempts minting
- Refund action: initiates Stripe refund

### Email Notifications
Transactional emails via SMTP/Nodemailer for:
- Purchase confirmations
- Refund notifications
- Proposal alerts
- Phase advancement notices
- User can toggle via `emailNotificationsEnabled` preference

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
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Replit Object Storage bucket ID |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Object Storage public paths |
| `PRIVATE_OBJECT_DIR` | Object Storage private directory |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification secret |
| `PRIVATE_KEY` | Blockchain wallet private key (for contract deployment) |

---

## Key Patterns

- **Data flow**: Frontend → TanStack Query → `fetch(/api/...)` → Express route → IStorage → Drizzle → PostgreSQL
- **Storage**: `IStorage` interface with `DatabaseStorage` (primary, PostgreSQL) and `MemStorage` (dev fallback) in `server/storage.ts`
- **Cache invalidation**: `queryClient.invalidateQueries({ queryKey: [...] })` after mutations
- **Form handling**: react-hook-form + zodResolver with Drizzle insert schemas
- **Component imports**: `@/components/ui/*` (shadcn), `@/components/*` (app), `@/lib/*` (utils), `@shared/*` (schema)
- **Styling**: Tailwind utility classes + HSL CSS variables for theming. Always use explicit `dark:` variants when not using configured utility classes
- **Maps**: Leaflet for lightweight/homepage use, Mapbox for geocoding/advanced features
- **Icons**: lucide-react for UI icons, react-icons/si for brand logos
- **KYC note**: `kycStatus` is a `text` column (not enum) in `users` table, with values managed application-side. `requireKYCApproved` checks `kycStatus !== "verified"`
- **Leaflet version**: react-leaflet@4.2.1 (v5 requires React 19, project uses React 18)
- **db:push workaround**: If drizzle-kit push fails on enum prompts, use `psql "$DATABASE_URL" -c "..."` directly
