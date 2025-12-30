# RevitaHub - External Partner Requirements

This document outlines the remaining integrations and features that require external partners to complete before production deployment.

---

## 1. Smart Contract Deployment (Republic.co / Canton Network)

### Required:
- **ERC-20 Token Contract with ERC-1400 Extensions**: Deploy security token contracts with transfer restrictions for KYC/AML compliance
- **Escrow Smart Contract**: USDC escrow with multi-sig security for holding funds during the 1-year funding period
- **Governance Contract**: On-chain DAO voting with token-weighted voting power multipliers
  - County: 1.5x
  - State: 1.25x
  - National: 1.0x
  - International: 0.75x
- **Dividend Distribution Contract**: Automated USDC dividend payouts to token holders
- **Refund Contract**: Automatic refunds with 3% APR calculation when funding fails

### Partners:
- **Republic.co**: Regulatory compliance, tokenization infrastructure
- **Canton Network**: Privacy-preserving smart contracts, compliance layer

### Technical Integration Points:
- Token minting endpoint after 100% funding reached
- Wallet verification linkage to KYC status
- Cross-chain bridge support (Chainlink CCIP)

---

## 2. KYC/AML Provider

### Required:
- **Identity Verification Service**: Document verification, liveness checks, sanctions screening
- **Ongoing Monitoring**: AML transaction monitoring, adverse media screening
- **Investor Accreditation**: Verification for qualified purchaser status (if applicable)

### Current Status:
- Basic KYC form implemented (name, DOB, address, SSN, document upload)
- Manual admin approval workflow in place
- Needs automated verification provider integration

### Recommended Providers:
- Jumio
- Onfido  
- Persona
- Plaid Identity Verification

### Integration Points:
- POST `/api/user/kyc` - Trigger verification
- Webhook for verification status updates
- Link wallet address to verified identity

---

## 3. Refund Disbursement System

### Required:
- **Automated Refund Processing**: When 1-year deadline passes without 100% funding
- **Interest Calculation**: 3% APR on original investment amount
- **Payment Rails**: USDC on-chain and/or ACH bank transfers

### Current Status:
- `calculateRefundWithInterest()` function implemented in schema
- Refund tracking tables ready (`tokenRefunds` table)
- Scheduler service monitors funding deadlines

### Missing:
- Actual fund disbursement mechanism
- Bank account linking for ACH transfers
- USDC transfer execution on-chain

---

## 4. Chainlink Build Program Integration

### Opportunities:
- **Price Feeds**: Property valuation oracles
- **Automation**: Phase transition triggers, dividend distribution scheduling, refund processing
- **CCIP**: Cross-chain token transfers
- **Functions**: Off-chain data integration (property records, market data)

### Application Status:
- Whitepaper completed at `/whitepaper`
- Platform designed for Chainlink integration
- Awaiting Build Program acceptance

---

## 5. Stripe Production Configuration

### Current Status:
- Stripe integration implemented with payment intents
- Webhook handler with signature verification
- Test mode operational

### Required for Production:
- Production API keys
- STRIPE_WEBHOOK_SECRET for production endpoint
- Account verification and approval
- PCI compliance review

---

## 6. Email Service (Production)

### Current Status:
- Nodemailer configured
- Email templates for purchase confirmation, refund notification, vote confirmation

### Required:
- Production SMTP credentials (current SMTP_* secrets)
- Email deliverability monitoring
- Transactional email service (SendGrid, AWS SES, Postmark)

---

## Summary Timeline

| Item | Priority | Dependency | Est. Timeline |
|------|----------|------------|---------------|
| KYC Provider | High | None | 2-4 weeks |
| Stripe Production | High | None | 1-2 weeks |
| Smart Contracts | High | KYC, Legal | 4-8 weeks |
| Refund Disbursement | Medium | Smart Contracts | 2-4 weeks |
| Chainlink Integration | Medium | Smart Contracts | 4-6 weeks |
| Email Production | Low | None | 1 week |

---

## Contact

**Build Our Community, LLC**
- Founder: Daniel Emery
- Email: DEmery@buildourcommunity.co
- Location: Georgia, USA
- Website: buildourcommunity.co
