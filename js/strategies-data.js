/**
 * Credit Card Strategies Database
 * Defines named multi-card strategies (ecosystems, trifectas, couples combos, etc.)
 */

const STRATEGIES = [
  // ── CHASE STRATEGIES ────────────────────────────────────────────────────────
  {
    id: 'chase-trifecta',
    name: 'Chase Trifecta',
    tagline: 'The gold standard of points optimization',
    ecosystem: 'Chase',
    difficulty: 'intermediate',
    timeHorizon: 'long-term',
    cardIds: ['csr', 'cfu', 'cff'],
    alternativeCardIds: [['csp', 'cfu', 'cff']], // Preferred instead of Reserve
    description:
      'Combine the Chase Sapphire Reserve (or Preferred), Freedom Unlimited, and Freedom Flex to earn maximum Ultimate Rewards points across every spending category. The free cards funnel points to the Sapphire, unlocking premium airline and hotel transfer partners at up to 2¢+/point.',
    categoryBestCard: {
      rotating: 'cff',        // 5x rotating
      dining: 'csr',          // 3x dining
      travel: 'csr',          // 3x travel
      everything: 'cfu',      // 1.5x everything
      drugstore: 'cff',       // 3x drugstores
    },
    estimatedAnnualValue: 1500, // for average spender
    pros: [
      'Best-in-class travel transfer partners (Hyatt, United, Southwest, etc.)',
      'Strong earn rates across all categories',
      'Points pooled automatically in one account',
      'Primary rental car insurance on Sapphire',
      '$300 travel credit effectively lowers CSR fee to $250',
    ],
    cons: [
      'Chase 5/24 rule limits how quickly you can build this portfolio',
      'CSR annual fee is $550 before credits',
      'Best value requires transferring points (more effort than cashback)',
    ],
    tags: ['travel', 'premium', 'points-transfer'],
    goalFit: ['travel', 'flexibility'],
  },
  {
    id: 'chase-preferred-duo',
    name: 'Chase Sapphire Duo',
    tagline: 'Premium travel rewards without the premium fee',
    ecosystem: 'Chase',
    difficulty: 'beginner',
    timeHorizon: 'medium-term',
    cardIds: ['csp', 'cfu'],
    description:
      'Pair the Chase Sapphire Preferred with the Freedom Unlimited for an accessible yet powerful combo. The Preferred earns 3x on dining and 2x on travel; the Freedom Unlimited earns 1.5x on everything else. All points transfer to the Preferred for airline/hotel redemptions.',
    categoryBestCard: {
      dining: 'csp',
      travel: 'csp',
      everything: 'cfu',
    },
    estimatedAnnualValue: 900,
    pros: [
      'Low combined annual fee ($95)',
      'Points transfer to 14 airline and hotel partners',
      'Great sign-up bonuses',
      'Beginner-friendly with solid earn rates',
    ],
    cons: [
      'Lower travel earn rate than CSR',
      'No lounge access',
    ],
    tags: ['travel', 'mid-tier', 'beginner-friendly'],
    goalFit: ['travel', 'flexibility'],
  },
  {
    id: 'chase-ink-trio',
    name: 'Chase Ink Business Trio',
    tagline: 'Maximize Chase points through business cards',
    ecosystem: 'Chase',
    difficulty: 'advanced',
    timeHorizon: 'long-term',
    cardIds: ['ink-preferred', 'ink-cash', 'ink-unlimited'],
    description:
      'Three Chase business cards that together cover every spending category. The Ink Preferred earns 3x on travel and key business categories; the Ink Cash earns 5x on office supplies and telecom; the Ink Unlimited earns 1.5x on everything. Business cards don\'t count toward 5/24, making this strategy ideal for bypassing the rule.',
    categoryBestCard: {
      travel: 'ink-preferred',
      officeSupplies: 'ink-cash',
      telecom: 'ink-cash',
      everything: 'ink-unlimited',
    },
    estimatedAnnualValue: 1200,
    pros: [
      'Business cards generally don\'t count toward Chase 5/24',
      'No annual fee on two of the three cards',
      'Huge sign-up bonuses',
      'Points combine with personal Sapphire',
    ],
    cons: [
      'Requires legitimate business income',
      'Ink Preferred has $95 annual fee',
    ],
    tags: ['business', 'travel', 'points-transfer'],
    goalFit: ['travel', 'flexibility'],
  },

  // ── AMEX STRATEGIES ─────────────────────────────────────────────────────────
  {
    id: 'amex-trifecta',
    name: 'Amex Trifecta',
    tagline: 'Luxury travel perks with category-leading earn rates',
    ecosystem: 'Amex',
    difficulty: 'advanced',
    timeHorizon: 'long-term',
    cardIds: ['amex-platinum', 'amex-gold', 'amex-bbp'],
    description:
      'Combine the Amex Platinum, Amex Gold, and Amex Blue Business Plus. The Platinum unlocks world-class travel perks and lounge access. The Gold earns 4x on dining and US supermarkets. The Blue Business Plus earns 2x on everything else (up to $50k/year). All Membership Rewards pool together for transfers to 20+ airline/hotel partners.',
    categoryBestCard: {
      flights: 'amex-platinum',
      dining: 'amex-gold',
      groceries: 'amex-gold',
      everything: 'amex-bbp',
    },
    estimatedAnnualValue: 2000,
    pros: [
      'Centurion Lounge access with Platinum',
      'Best-in-class dining and grocery earn rate with Gold',
      '2x base earn rate on all other purchases',
      '20+ transfer partners including Delta, ANA, Singapore, Air France',
      'Rich annual credits partially offset fees',
    ],
    cons: [
      'High combined annual fees ($695 + $250 + $0)',
      'Amex once-per-lifetime bonus rule',
      'Centurion Lounges can be crowded',
      'Requires disciplined use of credits to maximize value',
    ],
    tags: ['travel', 'premium', 'luxury', 'dining', 'points-transfer'],
    goalFit: ['travel'],
  },
  {
    id: 'amex-cashback-duo',
    name: 'Amex Cashback Powerhouse',
    tagline: 'Maximum cashback on everyday spending',
    ecosystem: 'Amex',
    difficulty: 'beginner',
    timeHorizon: 'short-term',
    cardIds: ['amex-bcp', 'amex-bce'],
    description:
      'The Amex Blue Cash Preferred handles groceries (6%), streaming (6%), and gas (3%). The Blue Cash Everyday covers US online retail (3%) and acts as a no-fee backup. Together, they dominate everyday household spending with pure cashback.',
    categoryBestCard: {
      groceries: 'amex-bcp',
      streaming: 'amex-bcp',
      gas: 'amex-bcp',
      onlineShopping: 'amex-bce',
    },
    estimatedAnnualValue: 600,
    pros: [
      'Simple cashback—no points to manage',
      'Best grocery cashback rate available (6%)',
      'Low combined annual fee ($95 + $0)',
    ],
    cons: [
      'No travel transfer partners',
      'BCP grocery cap ($6,000/year)',
    ],
    tags: ['cashback', 'groceries', 'everyday'],
    goalFit: ['cashback'],
  },

  // ── CAPITAL ONE STRATEGIES ──────────────────────────────────────────────────
  {
    id: 'c1-duo',
    name: 'Capital One Duo',
    tagline: 'Simple, powerful travel rewards for every category',
    ecosystem: 'Capital One',
    difficulty: 'beginner',
    timeHorizon: 'medium-term',
    cardIds: ['c1-venture-x', 'c1-savor'],
    description:
      'The Venture X earns 2x on everything (and 10x/5x on Capital One Travel) with a $300 travel credit and lounge access. The Savor earns 4x on dining, entertainment, and streaming. Together they cover your biggest lifestyle spending categories with transferable miles.',
    categoryBestCard: {
      dining: 'c1-savor',
      entertainment: 'c1-savor',
      streaming: 'c1-savor',
      travel: 'c1-venture-x',
      everything: 'c1-venture-x',
    },
    estimatedAnnualValue: 1100,
    pros: [
      'Venture X annual fee effectively offset by $300 credit + 10k anniversary miles',
      'Lounge access with Venture X',
      'Strong dining/entertainment earn with Savor',
      'Both cards have transfer partners (15+ partners)',
    ],
    cons: [
      'Capital One transfer partners less extensive than Chase/Amex',
      'Savor $95 annual fee adds to total cost',
    ],
    tags: ['travel', 'dining', 'entertainment', 'mid-tier'],
    goalFit: ['travel', 'cashback'],
  },

  // ── CITI STRATEGIES ─────────────────────────────────────────────────────────
  {
    id: 'citi-duo',
    name: 'Citi Powerhouse Pair',
    tagline: 'Broad category coverage with ThankYou Points',
    ecosystem: 'Citi',
    difficulty: 'beginner',
    timeHorizon: 'medium-term',
    cardIds: ['citi-strata-premier', 'citi-double-cash'],
    description:
      'The Citi Strata Premier earns 3x on hotels, flights, dining, groceries, and gas. The Double Cash earns 2% on everything else. Together, they cover all categories with transferable ThankYou Points that can move to 16+ airline partners.',
    categoryBestCard: {
      hotels: 'citi-strata-premier',
      flights: 'citi-strata-premier',
      dining: 'citi-strata-premier',
      groceries: 'citi-strata-premier',
      gas: 'citi-strata-premier',
      everything: 'citi-double-cash',
    },
    estimatedAnnualValue: 850,
    pros: [
      'Covers more categories with 3x than most mid-tier cards',
      'Double Cash provides solid 2% floor',
      'Low combined annual fee ($95 + $0)',
      'ThankYou Points transfer to Turkish Airlines, Avianca, and other sweet spots',
    ],
    cons: [
      'Citi transfer partners are best for specific airlines',
      'Less domestic airline coverage than Chase',
    ],
    tags: ['travel', 'dining', 'gas', 'groceries'],
    goalFit: ['travel', 'cashback'],
  },

  // ── MULTI-BANK STRATEGIES ───────────────────────────────────────────────────
  {
    id: 'hybrid-mega',
    name: 'The Hybrid Mega Strategy',
    tagline: 'Best card for every category across all banks',
    ecosystem: 'Multi-Bank',
    difficulty: 'advanced',
    timeHorizon: 'long-term',
    cardIds: ['csr', 'amex-gold', 'c1-venture-x', 'citi-custom-cash'],
    description:
      'Use the best card from each issuer for different spending categories. The CSR handles travel and dining. The Amex Gold dominates groceries and restaurant spending. The Venture X provides a strong 2x floor and lounge access. The Custom Cash adds 5% on one additional category of your choice. This strategy maximizes rewards but requires managing multiple currencies.',
    categoryBestCard: {
      flights: 'csr',
      hotels: 'csr',
      dining: 'amex-gold',
      groceries: 'amex-gold',
      topCategory: 'citi-custom-cash',
      everything: 'c1-venture-x',
    },
    estimatedAnnualValue: 2500,
    pros: [
      'Absolute maximum earn rate on every category',
      'Best transfer partners from multiple programs',
      'Redundancy—not reliant on one issuer',
    ],
    cons: [
      'High total annual fees',
      'Complex to manage multiple currencies',
      'Requires tracking which card to use where',
    ],
    tags: ['travel', 'premium', 'advanced', 'multi-bank'],
    goalFit: ['travel'],
  },
  {
    id: 'no-fee-powerhouse',
    name: 'No Annual Fee Powerhouse',
    tagline: 'Maximum rewards with zero annual fees',
    ecosystem: 'Multi-Bank',
    difficulty: 'beginner',
    timeHorizon: 'short-term',
    cardIds: ['cfu', 'citi-double-cash', 'cff', 'wf-autograph'],
    description:
      'Build a powerful wallet without paying any annual fees. The Freedom Unlimited earns 1.5x on everything; the Double Cash earns 2% on everything; the Freedom Flex catches 5% rotating categories; the Autograph earns 3x on restaurants, travel, gas, and more. Use whichever earns most in each category.',
    categoryBestCard: {
      rotating: 'cff',
      dining: 'wf-autograph',
      gas: 'wf-autograph',
      travel: 'wf-autograph',
      everything: 'citi-double-cash',
    },
    estimatedAnnualValue: 500,
    pros: [
      'Zero annual fees',
      'Good earn rates across all categories',
      'Low risk for beginners',
      'Can upgrade later by adding premium cards',
    ],
    cons: [
      'No lounge access',
      'Cashback rather than transferable points (for most cards)',
      'Lower ceiling than strategies with annual fees',
    ],
    tags: ['cashback', 'no-fee', 'beginner-friendly', 'simple'],
    goalFit: ['cashback', 'flexibility'],
  },

  // ── COUPLE STRATEGIES ───────────────────────────────────────────────────────
  {
    id: 'chase-couples-monopoly',
    name: "Chase Couples' Monopoly",
    tagline: 'Two people, twice the sign-up bonuses, one household strategy',
    ecosystem: 'Chase',
    difficulty: 'advanced',
    timeHorizon: 'long-term',
    coupleStrategy: true,
    person1Cards: ['csr', 'cfu'],
    person2Cards: ['csp', 'cff', 'ink-cash'],
    description:
      'Coordinate Chase applications across two people to maximize Chase 5/24 slots and sign-up bonuses. Person 1 holds the Sapphire Reserve + Freedom Unlimited. Person 2 holds the Sapphire Preferred + Freedom Flex + Ink Cash. Combined, you earn massive points on all categories. Chase allows point transfers between household members with linked accounts.',
    tips: [
      'Chase allows you to transfer Ultimate Rewards between two people in the same household',
      'Stagger applications to stay under 5/24',
      'Person 2 can add business cards (Ink) without using personal 5/24 slots',
      'Pool points to one account when redeeming for maximum value',
    ],
    estimatedAnnualValue: 2800,
    tags: ['couples', 'chase-ecosystem', 'advanced'],
    goalFit: ['travel'],
  },
  {
    id: 'amex-chase-couple',
    name: 'Chase + Amex Power Couple',
    tagline: 'Each person masters a different ecosystem',
    ecosystem: 'Multi-Bank',
    difficulty: 'advanced',
    timeHorizon: 'long-term',
    coupleStrategy: true,
    person1Cards: ['csr', 'cfu', 'cff'],
    person2Cards: ['amex-platinum', 'amex-gold', 'amex-bbp'],
    description:
      'One partner builds the Chase Trifecta; the other builds the Amex Trifecta. Together you have access to both Chase Ultimate Rewards and Amex Membership Rewards—the two largest transferable points currencies. This gives you access to 30+ combined airline and hotel partners, maximizing redemption flexibility.',
    tips: [
      'Chase UR and Amex MR are not directly combinable, but you can each book travel separately',
      'Use Chase UR for Hyatt redemptions, United flights, Southwest',
      'Use Amex MR for Delta, ANA, Air France, Singapore Airlines',
      'Each person builds their ecosystem independently—no sharing required',
      'Coordinate who applies where to avoid exceeding 5/24 (applies to Chase only)',
    ],
    estimatedAnnualValue: 3500,
    tags: ['couples', 'multi-bank', 'advanced', 'premium'],
    goalFit: ['travel'],
  },
  {
    id: 'starter-couple',
    name: "Couples' Starter Strategy",
    tagline: 'Simple, effective rewards for couples just getting started',
    ecosystem: 'Multi-Bank',
    difficulty: 'beginner',
    timeHorizon: 'short-term',
    coupleStrategy: true,
    person1Cards: ['csp', 'cfu'],
    person2Cards: ['amex-gold', 'c1-savorone'],
    description:
      'A manageable entry into multi-card optimization for couples. Person 1 gets the Chase Sapphire Preferred + Freedom Unlimited for travel and flexibility. Person 2 gets the Amex Gold for dining/groceries and the SavorOne for entertainment. Combined annual fees are modest and the strategy covers most spending categories well.',
    tips: [
      'Book travel through Person 1\'s Chase account for best transfer rates',
      'Use Person 2\'s Amex Gold for all restaurant and grocery spending',
      'Transfer Amex MR to airline partners when targeting premium awards',
    ],
    estimatedAnnualValue: 1800,
    tags: ['couples', 'beginner-friendly', 'multi-bank'],
    goalFit: ['travel', 'cashback'],
  },
];

/**
 * Returns all strategies, optionally filtered by type.
 */
function getStrategiesByGoal(goal) {
  return STRATEGIES.filter(s => s.goalFit && s.goalFit.includes(goal));
}

function getCoupleStrategies() {
  return STRATEGIES.filter(s => s.coupleStrategy === true);
}
