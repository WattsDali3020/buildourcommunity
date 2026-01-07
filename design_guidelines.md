# Design Guidelines: RevitaHub - Premium Fintech Platform

## Design Philosophy

**Reference Platforms**: Cosmos Network, Coinbase, Stripe, Linear
- Premium, trustworthy aesthetic for handling real estate and financial transactions
- Blue/white color scheme with subtle gradients and glow effects
- Clean typography with generous white space
- Glassmorphic elements for depth and sophistication

## Color System

### Primary Palette
- **Primary Blue**: HSL 217 91% 35% (light) / HSL 217 91% 55% (dark)
- **Background**: Clean white (#ffffff) with subtle blue tints
- **Foreground**: Near black for high contrast text

### Premium Effects
- **Gradient Backgrounds**: Subtle blue gradients (`bg-gradient-hero`, `bg-gradient-premium`)
- **Glow Effects**: Soft blue radial glows (`glow-blue`) for hero sections
- **Glassmorphism**: Frosted glass cards (`glass-card`) with backdrop blur
- **Border Glow**: Hover effect with subtle blue glow (`border-glow`)

## Typography System

**Font Families**:
- Primary: Inter - exceptional readability for data-heavy interfaces
- Monospace: JetBrains Mono - for wallet addresses, code, transaction hashes

**Hierarchy**:
- **Hero Headlines**: text-5xl to text-7xl, font-bold, tracking-tight
- **Page Titles**: text-3xl to text-4xl, font-bold
- **Section Headers**: text-2xl lg:text-3xl, font-bold with icon badges
- **Subsection Headers**: text-lg, font-semibold
- **Body Text**: text-base/text-lg, leading-relaxed, text-muted-foreground
- **Financial Metrics**: metric-value class (tabular-nums, tight letter-spacing)

## Layout Patterns

### Section Structure
- Hero sections: Full-width with gradient backgrounds and glow effects
- Content sections: max-w-4xl mx-auto for optimal reading width
- Alternating backgrounds: `section-alt` class for visual rhythm
- Gradient dividers: `divider-gradient` between major sections

### Card Components
- Use `border-glow` class for interactive hover effects
- `stat-card` for metric displays with subtle gradient overlay
- Rounded corners: rounded-xl (12px) for cards, rounded-lg for smaller elements
- Padding: p-5 to p-6 for card content

### Spacing
- Section padding: py-16 lg:py-20 for major sections
- Element gaps: gap-4 to gap-8 depending on density
- Margin between subsections: mb-8 to mb-10

## Component Patterns

### Stat Cards
```jsx
<div className="stat-card rounded-xl border bg-card p-5 border-glow">
  <p className="text-3xl font-bold metric-value text-primary">{value}</p>
  <p className="text-sm text-muted-foreground mt-1">{label}</p>
</div>
```

### Feature Cards
```jsx
<Card className="border-glow">
  <CardContent className="p-6">
    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </CardContent>
</Card>
```

### Section Headers with Icons
```jsx
<div className="flex items-center gap-3 mb-8">
  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
    <Icon className="h-5 w-5 text-primary" />
  </div>
  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h2>
</div>
```

### Highlight Cards
```jsx
<div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6">
  {/* Premium callout content */}
</div>
```

### Code Blocks
```jsx
<div className="rounded-xl overflow-hidden border border-border/50">
  <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
    <Code className="h-4 w-4 text-primary" />
    <span className="text-sm font-medium">{title}</span>
  </div>
  <pre className="text-xs bg-muted/20 p-4 overflow-x-auto font-mono">
    <code>{code}</code>
  </pre>
</div>
```

## Interactive States

### Hover Effects
- Cards: Use `border-glow` class for subtle blue glow on hover
- Buttons: Built-in elevation through shadcn components
- Nav items: Background highlight with `hover:bg-muted/50`

### Active/Current States
- Navigation: `nav-item-active` class with left accent bar
- Tabs: `toggle-elevate toggle-elevated` pattern

## Navigation

### Sticky Sidebar (Litepaper)
- Use `sticky-nav` class for proper sticky positioning
- Include scroll spy for active section highlighting
- Custom scrollbar styling for elegant appearance

### Header
- Sticky with backdrop blur: `sticky top-0 z-50 bg-background/80 backdrop-blur-lg`
- Logo + nav links + CTAs pattern

## Data Visualization

### Tables
- Rounded container: `rounded-xl border overflow-hidden`
- Header row: `bg-muted/50` with `font-semibold`
- Cell padding: `p-4`
- Primary values: `text-primary font-semibold`

### Metrics Grid
- Use `grid grid-cols-2 md:grid-cols-4 gap-4` for stat displays
- Consistent card styling with `stat-card` class

## Responsive Design

### Breakpoints
- Mobile first approach
- md: 768px - tablets, 2-column grids
- lg: 1024px - desktop, sidebar visible
- xl: 1280px - wider containers

### Content Width
- Hero/marketing: max-w-5xl to max-w-6xl
- Content/reading: max-w-4xl
- Full dashboard: max-w-7xl

## Dark Mode

All custom utilities support dark mode via `.dark` class selectors:
- Gradient backgrounds adjust for darker tones
- Glow effects reduce opacity slightly
- Text colors shift to lighter variants
- Border colors become more subtle

## Accessibility

- WCAG AA contrast ratios for all text
- Focus visible states with ring outlines
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
