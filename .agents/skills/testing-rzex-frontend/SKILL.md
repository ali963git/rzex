# RZEX Frontend Testing

## Overview
The RZEX platform is a cryptocurrency trading frontend built with Next.js 14 + React 18 + Tailwind CSS. It uses demo/mock data (no backend required for UI testing).

## Setup

```bash
cd frontend/web
npm install
npx next dev -p 3010
```

Wait ~10 seconds for the dev server to start, then verify with:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/
```

## Page Routes

| Route | Page | Key Elements |
|---|---|---|
| `/` | Trading | Chart, OrderBook, TradeForm, PairSelector, MarketStats, DepthChart, RecentTrades |
| `/markets` | Markets | "Markets Overview" heading, USDT/BTC filter tabs, search bar, trading pairs table |
| `/wallet` | Wallet | Total Balance, Overview/Deposit/Withdraw/History tabs, asset table |
| `/orders` | Orders | Open Orders/Order History/Trade History tabs, order statistics cards |
| `/dashboard` | Dashboard | Portfolio value ($69,108.21 with demo data), allocation chart, recent activity |
| `/login` | Login | Email/Password inputs, Remember me, Sign In button, Register link |
| `/register` | Register | Email/Username/Password/Confirm Password, Terms checkbox, password strength indicator |

## What to Test

### Trading Page
- Verify 3-column layout: OrderBook (left), Chart+DepthChart (center), TradeForm+RecentTrades (right)
- Click different pairs in PairSelector — MarketStats price, chart title, and TradeForm amount label should update
- Order Book should show green (bid) and red (ask) prices

### Navigation
- All 5 nav links in Header (Trade, Markets, Wallet, Orders, Dashboard) should navigate correctly
- "Log In" and "Register" buttons in header should navigate to respective pages
- Active page link should be highlighted

### Register Form Validation
- Password strength indicator: Weak (red) → Fair → Good → Strong (green) based on complexity
- Submit with mismatched passwords → "Passwords do not match" error
- Submit without terms checkbox → "You must agree to the Terms of Service" error

## Known Issues

### SSR Hydration Warning
The trading page shows a React hydration mismatch warning in dev mode. This is caused by `Date.now()` and `Math.random()` in demo data generators producing different values during SSR vs client rendering. It does not affect functionality — the page works correctly after hydration completes. This warning does not appear in production builds.

### Button Disabled During Initial SSR
On the Register page, the "Create Account" button may appear disabled before React hydration completes. Once the user interacts with any form field (triggering hydration), the button becomes enabled. This is a Next.js SSR behavior, not a bug in the button logic.

## Theme Colors
- Background: `#0b0e11` (primary), `#1e2329` (cards)
- Text: `#eaecef` (primary), `#848e9c` (secondary)
- Accent: `#f0b90b` (RZEX yellow/gold)
- Green: `#0ecb81`, Red: `#f6465d`
- Border: `#2b3139`

## Devin Secrets Needed
None — frontend testing uses demo data with no backend authentication required.
