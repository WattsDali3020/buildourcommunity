# Design Guidelines: Community Revitalization Platform

## Design Approach

**Reference-Based Approach**: Drawing inspiration from trusted financial and blockchain platforms:
- **Coinbase**: Clean, trustworthy crypto interfaces with clear wallet connection patterns
- **Stripe**: Professional financial dashboards with excellent data visualization
- **Linear**: Modern B2B SaaS with superior information density and hierarchy
- **Carta**: Equity management platforms with sophisticated ownership visualization

**Design Principles**:
1. **Trust First**: Professional polish to handle real estate and financial transactions
2. **Clarity Over Creativity**: Complex blockchain/legal concepts require crystal-clear UI
3. **Progressive Disclosure**: Multi-tier information architecture for varying user expertise
4. **Data Density with Breathing Room**: Show comprehensive information without overwhelming

## Typography System

**Font Families**:
- Primary: Inter (via Google Fonts CDN) - exceptional readability for data-heavy interfaces
- Monospace: JetBrains Mono - for wallet addresses, token IDs, transaction hashes

**Hierarchy**:
- **Hero Headlines**: text-5xl to text-6xl, font-bold (landing pages, major sections)
- **Page Titles**: text-3xl to text-4xl, font-semibold
- **Section Headers**: text-2xl, font-semibold
- **Subsection Headers**: text-xl, font-medium
- **Body Text**: text-base, font-normal, leading-relaxed
- **Small Print**: text-sm (metadata, disclaimers)
- **Micro Text**: text-xs (labels, helper text)
- **Financial Data**: text-lg to text-2xl, font-semibold (token prices, ROI figures)
- **Legal/Compliance**: text-sm, leading-loose (enhanced readability for dense content)

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 24** for consistency
- Component internal padding: p-4 to p-6
- Section padding: py-12 to py-24
- Card spacing: gap-6 to gap-8
- Form field spacing: space-y-4

**Grid Structure**:
- **Property Listings**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Dashboard Cards**: grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6
- **Data Tables**: Single column on mobile, multi-column responsive tables
- **Filters Sidebar**: Sticky sidebar (w-64 to w-80) on desktop, collapsible drawer on mobile

**Container Strategy**:
- Marketing pages: max-w-7xl mx-auto px-4
- Application pages: max-w-screen-2xl mx-auto (wider for dashboards)
- Content pages: max-w-4xl mx-auto (educational resources)
- Form pages: max-w-2xl mx-auto

## Component Library

### Navigation
- **Global Header**: Fixed top navigation with logo, main nav links, wallet connection button, user menu
- **Breadcrumbs**: For deep navigation (Property > State > City > Specific Listing)
- **Tab Navigation**: For multi-section pages (Property Details: Overview, Financials, Documents, Community)
- **Sidebar Navigation**: Sticky left sidebar for admin/dashboard areas with collapsible sections

### Property Cards
- **Image**: 16:9 aspect ratio thumbnail
- **Property Type Badge**: Small pill badge (Vacant Land, Historic Building, etc.)
- **Location**: State/City with icon
- **Tokenization Status**: Progress indicator showing % tokenized
- **Key Metrics**: Token price, total supply, funding goal in compact grid
- **CTA**: Primary "View Details" button

### Financial Components
- **ROI Calculator**: Multi-step form with real-time calculation display
- **Portfolio Summary Cards**: Large number display with trend indicators
- **Dividend Tracker**: Table with payment history and next payment countdown
- **Token Holdings Visualization**: Pie chart showing portfolio allocation across properties

### Governance Components
- **Proposal Cards**: Status badge, voting deadline, current vote tally with progress bars
- **Voting Interface**: Radio buttons with token-weighted voting power display
- **Discussion Threads**: Nested comment system with upvoting

### Forms
- **Multi-Step Property Submission**: Progress stepper at top, navigation buttons, auto-save indicators
- **Document Upload**: Drag-and-drop zones with file type validation and preview thumbnails
- **KYC Forms**: Clear field labels, inline validation, required field indicators
- **Search/Filter Forms**: Combination of dropdowns, range sliders, checkboxes with "Apply Filters" action

### Data Displays
- **State Compliance Matrix**: Interactive table showing requirements for all 50 states
- **Project Impact Dashboard**: Stat cards with icons (jobs created, housing units, sustainability score)
- **Transaction History**: Sortable table with blockchain explorer links for verified transactions
- **Financial Projections Table**: 50-year timeline with collapsible year ranges

### Trust Elements
- **Verification Badges**: Icons for verified properties, KYC-approved users, audited smart contracts
- **Legal Disclaimers**: Expandable accordions for SEC compliance notices
- **Security Indicators**: SSL badge, wallet connection status, transaction confirmation steps
- **Progress Indicators**: For blockchain transactions (pending, confirmed, completed)

### Educational Content
- **Guide Cards**: Icon, title, estimated reading time, difficulty level
- **Interactive Glossary**: Hover tooltips for blockchain/legal terminology
- **Video Embeds**: Responsive 16:9 containers for educational content
- **FAQ Accordions**: Collapsible Q&A sections by topic

## Images

**Landing Page Hero**: Large hero image (h-screen or min-h-[600px]) showing community revitalization - renovated historic building or vibrant downtown area. Image should convey transformation and community impact. Text overlay with blur-backed buttons.

**Property Detail Hero**: 21:9 ultra-wide hero image of the specific property with location info overlay

**Section Background Images**: Subtle, semi-transparent background textures for trust/credibility sections showing architectural blueprints or cityscapes

**Thumbnail Images**: All property cards, team members, and case studies use 16:9 ratio images

**Icon Library**: Heroicons (via CDN) for all UI icons - use outline style for navigation, solid for emphasizing active states

## Animations

**Minimal Motion**:
- Smooth page transitions (fade-in on route change)
- Hover state transitions on cards (subtle elevation increase)
- Loading states for blockchain transactions (spinner with status text)
- Success animations only for critical actions (token purchase confirmation)
- NO scroll-triggered animations, parallax effects, or decorative motion

## Accessibility

- WCAG AA contrast ratios for all text
- Keyboard navigation for all interactive elements
- ARIA labels for wallet connection status, transaction states
- Focus visible states with clear outlines (ring-2 ring-offset-2)
- Screen reader text for financial data and blockchain addresses