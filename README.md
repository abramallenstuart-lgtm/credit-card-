# CardOptimizer 💳

A personalized credit card rewards optimization website designed for people who already understand the basics of credit cards and want to maximize their strategy.

## Features

- **Tailored Card Recommendations** — Cards ranked by estimated annual net value based on your actual monthly spending across dining, groceries, gas, travel, online shopping, entertainment, and more.
- **Application Rule Awareness** — Automatically accounts for Chase 5/24, the Sapphire 48-month bonus restriction, Amex once-per-lifetime bonus rules, and Amex's 5-card limit.
- **Long-Term Strategy Roadmaps** — Guided strategies including:
  - Chase Trifecta (Sapphire Reserve/Preferred + Freedom Unlimited + Freedom Flex)
  - Amex Trifecta (Platinum + Gold + Blue Business Plus)
  - Capital One Duo (Venture X + Savor)
  - Citi Powerhouse Pair
  - No-Annual-Fee Powerhouse
  - Hybrid Mega Strategy (multi-bank)
- **Couple Strategies** — Coordinate applications across two people to double sign-up bonuses, split Chase 5/24 slots, and pool points. Includes the "Chase Couples' Monopoly" and "Chase + Amex Power Couple" strategies.
- **Multi-Bank Optimization** — Recommends combining cards from Chase, Amex, Capital One, and Citi for maximum rewards stacking across all categories.
- **Current Card Optimization Tips** — Shows how to route spending more effectively across cards you already hold.

## Card Database

25+ major US credit cards across 7 issuers:
- **Chase**: Sapphire Reserve, Sapphire Preferred, Freedom Unlimited, Freedom Flex, Ink Business Preferred/Cash/Unlimited
- **American Express**: Platinum, Gold, Green, Blue Cash Preferred, Blue Cash Everyday, Blue Business Plus
- **Capital One**: Venture X, Venture, Savor, SavorOne
- **Citi**: Strata Premier, Double Cash, Custom Cash
- **Discover**: Discover it Cash Back
- **Bank of America**: Premium Rewards, Customized Cash Rewards
- **Wells Fargo**: Autograph

## How It Works

1. **Step 1 — Goals**: Select your primary goal (travel, cashback, or flexibility) and experience level. Toggle couple mode.
2. **Step 2 — Spending**: Enter your monthly spending by category using sliders.
3. **Step 3 — Current Cards**: Select all cards you currently hold and when you opened them.
4. **Step 4 — Partner's Cards** (couple mode only): Same for your partner.
5. **Results**: Get ranked card recommendations with estimated annual value, strategy roadmaps, current-card optimization tips, and (if applicable) couple strategies.

## Running Locally

This is a fully static website — no build step, no server required.

```bash
# Open directly in your browser:
open index.html

# Or serve with any static file server, e.g.:
npx serve .
python3 -m http.server 8080
```

## Tech Stack

- **HTML5** — Semantic structure, single-page application
- **CSS3** — Mobile-first responsive design, CSS custom properties
- **Vanilla JavaScript** — No framework dependencies; all logic runs in-browser

## Disclaimer

CardOptimizer provides educational recommendations only. Card terms, sign-up bonuses, and annual fees change frequently. Always verify current offers directly with issuers before applying. This tool does not check your credit score or guarantee approval.
