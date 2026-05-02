/**
 * Recommendation Engine
 * Core logic for generating personalized credit card recommendations.
 */

// ── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Count how many new card accounts a user opened in the last 24 months.
 * openedCards = [{ cardId, openedDate }]  (openedDate is a JS Date or ISO string)
 */
function countNew24Months(openedCards) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 24);
  return openedCards.filter(c => {
    const d = new Date(c.openedDate);
    return d >= cutoff;
  }).length;
}

/**
 * Check whether a user is eligible for a given card.
 * Returns { eligible: bool, reason: string|null }
 */
function checkEligibility(card, userProfile) {
  const { ownedCardIds, openedCards, amexCardsOwned } = userProfile;

  // Already owns this card
  if (ownedCardIds.includes(card.id)) {
    return { eligible: false, reason: 'You already have this card.' };
  }

  // Chase 5/24
  if (card.applicationRules.rule5_24) {
    const count = countNew24Months(openedCards);
    if (count >= 5) {
      return {
        eligible: false,
        reason: `Chase 5/24: You've opened ${count} cards in the last 24 months. Wait until some fall off the 24-month window.`,
      };
    }
  }

  // Sapphire family restriction
  if (card.applicationRules.sapphireFamily) {
    const hasSapphire = ownedCardIds.some(id => ['csr', 'csp'].includes(id));
    if (hasSapphire) {
      // Check if 48 months since oldest Sapphire was opened
      const sapphireOpening = openedCards
        .filter(c => ['csr', 'csp'].includes(c.cardId))
        .map(c => new Date(c.openedDate))
        .sort((a, b) => a - b)[0];
      if (sapphireOpening) {
        const monthsAgo = monthsSince(sapphireOpening);
        if (monthsAgo < 48) {
          return {
            eligible: false,
            reason: `Sapphire 48-month rule: You received a Sapphire bonus ${Math.round(monthsAgo)} months ago. You must wait ${48 - Math.round(monthsAgo)} more months.`,
          };
        }
      }
    }
  }

  // Amex once-per-lifetime (flag; you can still get the card, just no bonus)
  // We'll surface this as a warning rather than ineligibility

  // Amex 5 personal card limit
  if (card.applicationRules.amexCardLimit && card.type === 'personal') {
    if ((amexCardsOwned || 0) >= 5) {
      return {
        eligible: false,
        reason: 'Amex 5-card limit: You already have 5 Amex personal cards. Close one before applying.',
      };
    }
  }

  return { eligible: true, reason: null };
}

function monthsSince(date) {
  const now = new Date();
  const d = new Date(date);
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}

// ── ANNUAL VALUE CALCULATION ─────────────────────────────────────────────────

/**
 * Calculate net annual value of a card for a given user's spending profile.
 * spending = { dining, groceries, gas, travel, onlineShopping, entertainment, everything, ... }
 * All values are monthly dollars.
 */
function calcAnnualValue(card, spending) {
  const pv = POINT_VALUES[card.rewardsCurrency] || 0.01;
  const cats = card.categories;

  // Map spending keys to card category keys
  const spendMap = {
    dining: spending.dining || 0,
    groceries: spending.groceries || 0,
    gas: spending.gas || 0,
    travel: spending.travel || 0,
    onlineShopping: spending.onlineShopping || 0,
    entertainment: spending.entertainment || 0,
    streaming: spending.streaming || 0,
    transit: spending.transit || 0,
  };

  // Everything else
  const namedTotal =
    spendMap.dining +
    spendMap.groceries +
    spendMap.gas +
    spendMap.travel +
    spendMap.onlineShopping +
    spendMap.entertainment +
    spendMap.streaming +
    spendMap.transit;
  const monthlyEverything = Math.max(0, (spending.everything || 0) - namedTotal);

  let annualPoints = 0;

  // Category-specific earn
  const categoryKeys = [
    'dining', 'groceries', 'gas', 'travel', 'onlineShopping',
    'entertainment', 'streaming', 'transit', 'flights', 'hotels',
  ];
  for (const key of categoryKeys) {
    if (cats[key] && spendMap[key]) {
      annualPoints += spendMap[key] * 12 * cats[key];
    }
  }

  // Rotating categories: estimate as 5% on the portion of dining/groceries/gas
  // spend up to the quarterly $1,500 cap ($500/month), representing an average
  // of common rotating bonus categories (e.g., Chase Freedom Flex).
  if (cats.rotating) {
    const rotatingMonthly = Math.min(spendMap.dining + spendMap.groceries + spendMap.gas, ROTATING_MONTHLY_CAP);
    annualPoints += rotatingMonthly * 12 * cats.rotating;
  }

  // Cashback cards: pv is 0.01 (1%), so multiply points by pv gives the cash value
  // For cashback, categories are in % (e.g., 6 means 6%)

  // Everything else
  if (cats.everything) {
    annualPoints += monthlyEverything * 12 * cats.everything;
  }

  let annualRewardsValue = annualPoints * pv;

  // Cashback override: if rewardsCurrency is Cash, treat multipliers as percent directly
  if (card.rewardsCurrency === 'Cash' || card.rewardsCurrency === 'Discover Cashback') {
    annualRewardsValue = annualPoints * 0.01; // multipliers represent cents per dollar
  }

  // Signup bonus value (amortized over 2 years)
  const signupValueAmortized = card.signupBonusValue / 2;

  // Net value = rewards + credits - annual fee + amortized bonus
  const netValue =
    annualRewardsValue +
    (card.annualCredits || 0) -
    card.annualFee +
    signupValueAmortized;

  return {
    annualRewardsValue: Math.round(annualRewardsValue),
    netValue: Math.round(netValue),
    annualFee: card.annualFee,
    annualCredits: card.annualCredits || 0,
    signupValueAmortized: Math.round(signupValueAmortized),
  };
}

// ── 5/24 STATUS ─────────────────────────────────────────────────────────────

function get524Status(openedCards) {
  const count = countNew24Months(openedCards);
  const slotsUsed = Math.min(count, 5);
  const slotsRemaining = Math.max(0, 5 - count);

  // Find when the oldest qualifying card falls off
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 24);
  const qualifying = openedCards
    .filter(c => new Date(c.openedDate) >= cutoff)
    .map(c => new Date(c.openedDate))
    .sort((a, b) => a - b);

  let nextSlotOpenDate = null;
  if (count >= 5 && qualifying.length > 0) {
    nextSlotOpenDate = new Date(qualifying[0]);
    nextSlotOpenDate.setMonth(nextSlotOpenDate.getMonth() + 24);
  }

  return { count, slotsUsed, slotsRemaining, nextSlotOpenDate };
}

// ── STRATEGY MATCHING ────────────────────────────────────────────────────────

/**
 * Given a user's owned cards and goals, return matching strategies with completion %.
 */
function matchStrategies(userProfile, spending) {
  const { ownedCardIds, isCouple, primaryGoal } = userProfile;

  return STRATEGIES
    .filter(s => {
      // Filter couple strategies
      if (s.coupleStrategy && !isCouple) return false;
      // Filter by goal fit
      if (s.goalFit && primaryGoal && !s.goalFit.includes(primaryGoal)) return false;
      return true;
    })
    .map(strategy => {
      const allStrategyCards = strategy.cardIds || [];
      const alreadyOwned = allStrategyCards.filter(id => ownedCardIds.includes(id));
      const completion = allStrategyCards.length
        ? Math.round((alreadyOwned.length / allStrategyCards.length) * 100)
        : 0;

      // Calculate additional value from cards not yet owned
      const missingCards = allStrategyCards.filter(id => !ownedCardIds.includes(id));
      const missingCardObjects = missingCards.map(id => getCardById(id)).filter(Boolean);

      return {
        ...strategy,
        completion,
        alreadyOwnedCount: alreadyOwned.length,
        totalCards: allStrategyCards.length,
        missingCards: missingCardObjects,
      };
    })
    .sort((a, b) => b.completion - a.completion); // Higher completion first
}

// Monthly cap for rotating bonus category estimation ($1,500 quarterly cap ÷ 3 months)
const ROTATING_MONTHLY_CAP = 500;

// ── CARD RECOMMENDATIONS ─────────────────────────────────────────────────────

/**
 * Main recommendation function.
 * Returns sorted list of card recommendations with scores and explanations.
 */
function generateRecommendations(userProfile, spending) {
  const { ownedCardIds, openedCards, primaryGoal, experienceLevel, amexCardsOwned } = userProfile;

  const profile = {
    ...userProfile,
    amexCardsOwned: ownedCardIds.filter(id => {
      const card = getCardById(id);
      return card && card.issuer === 'Amex' && card.type === 'personal';
    }).length,
    openedCards: openedCards || [],
  };

  const recommendations = [];

  for (const card of CARDS) {
    const eligibility = checkEligibility(card, profile);
    const value = calcAnnualValue(card, spending);

    // Amex lifetime warning (not a blocker)
    const hadAmexBefore =
      card.applicationRules.amexLifetime &&
      (userProfile.previousCards || []).includes(card.id);

    // Score = net annual value + goal/preference bonuses
    let score = value.netValue;

    // Boost score for goal alignment
    if (primaryGoal === 'travel' && card.tags.includes('travel')) score += 200;
    if (primaryGoal === 'cashback' && card.tags.includes('cashback')) score += 200;
    if (primaryGoal === 'flexibility' && card.rewardsCurrency.includes('Ultimate Rewards')) score += 150;
    if (primaryGoal === 'flexibility' && card.rewardsCurrency.includes('Membership Rewards')) score += 150;

    // Penalize complexity for beginners
    if (experienceLevel === 'beginner' && card.difficulty === 'advanced') score -= 100;
    if (experienceLevel === 'beginner' && card.tags.includes('beginner-friendly')) score += 150;

    // Boost ecosystem cards if user is already in that ecosystem
    const userEcosystems = getOwnedEcosystems(ownedCardIds);
    if (userEcosystems.includes(card.ecosystem)) score += 100;

    // Build explanation
    const reasons = buildReasons(card, value, spending, primaryGoal, ownedCardIds);

    recommendations.push({
      card,
      eligible: eligibility.eligible,
      eligibilityReason: eligibility.reason,
      hadAmexBefore,
      value,
      score,
      reasons,
    });
  }

  // Sort: eligible first, then by score descending
  return recommendations.sort((a, b) => {
    if (a.eligible && !b.eligible) return -1;
    if (!a.eligible && b.eligible) return 1;
    return b.score - a.score;
  });
}

function getOwnedEcosystems(ownedCardIds) {
  const ecosystems = new Set();
  for (const id of ownedCardIds) {
    const card = getCardById(id);
    if (card && card.ecosystem) ecosystems.add(card.ecosystem);
  }
  return Array.from(ecosystems);
}

function buildReasons(card, value, spending, primaryGoal, ownedCardIds) {
  const reasons = [];

  // High earn categories for this user
  const topCategories = getTopEarningCategories(card, spending);
  if (topCategories.length > 0) {
    reasons.push(`Earns ${topCategories[0].rate}x on ${topCategories[0].name}, where you spend $${topCategories[0].monthlySpend}/month.`);
  }

  // Good net value
  if (value.netValue > 300) {
    reasons.push(`Estimated net annual value for your spending profile: $${value.netValue}.`);
  }

  // Ecosystem synergy
  const ownedHub = ownedCardIds.find(id => {
    const c = getCardById(id);
    return c && c.ecosystem === card.ecosystem && c.ecosystemRole === 'hub';
  });
  if (ownedHub && card.ecosystemRole === 'spoke') {
    const hub = getCardById(ownedHub);
    reasons.push(`Pairs with your ${hub.name}: points transfer 1:1 to your Sapphire/hub card for premium redemptions.`);
  }
  if (card.ecosystemRole === 'hub' && card.tags.includes('travel') && primaryGoal === 'travel') {
    reasons.push('Hub card unlocks premium airline & hotel transfer partners at up to 2¢/point.');
  }

  // Strong sign-up bonus
  if (card.signupBonusValue >= 500) {
    reasons.push(`Sign-up bonus worth ~$${card.signupBonusValue} after spending $${card.signupBonusSpend} in ${card.signupBonusMonths} months.`);
  }

  // Annual fee justification
  if (card.annualFee > 0 && card.annualCredits >= card.annualFee * 0.5) {
    reasons.push(`$${card.annualFee} annual fee offset by $${card.annualCredits} in annual credits.`);
  }

  return reasons;
}

function getTopEarningCategories(card, spending) {
  const cats = card.categories;
  const spendMap = {
    dining: { name: 'dining', monthlySpend: spending.dining || 0 },
    groceries: { name: 'groceries', monthlySpend: spending.groceries || 0 },
    gas: { name: 'gas', monthlySpend: spending.gas || 0 },
    travel: { name: 'travel', monthlySpend: spending.travel || 0 },
    onlineShopping: { name: 'online shopping', monthlySpend: spending.onlineShopping || 0 },
    entertainment: { name: 'entertainment', monthlySpend: spending.entertainment || 0 },
    streaming: { name: 'streaming', monthlySpend: spending.streaming || 0 },
  };

  return Object.entries(spendMap)
    .filter(([key, val]) => cats[key] && cats[key] > 1 && val.monthlySpend > 0)
    .map(([key, val]) => ({
      name: val.name,
      rate: cats[key],
      monthlySpend: val.monthlySpend,
      monthlyValue: val.monthlySpend * cats[key],
    }))
    .sort((a, b) => b.monthlyValue - a.monthlyValue)
    .slice(0, 3);
}

// ── COUPLE RECOMMENDATIONS ───────────────────────────────────────────────────

/**
 * Generate recommendations for both people in a couple.
 * Returns combined recommendations and couple-specific strategies.
 */
function generateCoupleRecommendations(person1Profile, person2Profile, spending1, spending2) {
  const rec1 = generateRecommendations(person1Profile, spending1);
  const rec2 = generateRecommendations(person2Profile, spending2);
  const coupleStrategies = matchStrategies(
    { ...person1Profile, isCouple: true, primaryGoal: person1Profile.primaryGoal },
    spending1,
  ).filter(s => s.coupleStrategy);

  return { rec1, rec2, coupleStrategies };
}

// ── CURRENT CARD OPTIMIZATION TIPS ──────────────────────────────────────────

/**
 * Given a user's current cards and spending, generate tips to maximize existing cards.
 */
function generateOptimizationTips(ownedCardIds, spending) {
  const tips = [];
  const ownedCards = ownedCardIds.map(id => getCardById(id)).filter(Boolean);

  // Check for suboptimal spend routing
  const spendKeys = ['dining', 'groceries', 'gas', 'travel', 'onlineShopping', 'entertainment'];

  for (const key of spendKeys) {
    const monthlySpend = spending[key] || 0;
    if (monthlySpend < 50) continue;

    let bestCard = null;
    let bestRate = 0;

    for (const card of ownedCards) {
      const rate = card.categories[key] || card.categories.everything || 1;
      if (rate > bestRate) {
        bestRate = rate;
        bestCard = card;
      }
    }

    if (bestCard && bestRate > 1.5) {
      tips.push({
        category: key,
        tip: `Use your ${bestCard.name} for all ${key} spending to earn ${bestRate}x points (worth ~$${Math.round(monthlySpend * 12 * bestRate * 0.015)}/year).`,
        card: bestCard,
        annualValue: Math.round(monthlySpend * 12 * bestRate * 0.015),
      });
    }
  }

  // Check if they have a points hub and a spoke that earns cash (suboptimal)
  const hubCard = ownedCards.find(c => c.ecosystemRole === 'hub');
  const cashbackSpoke = ownedCards.find(c =>
    c.ecosystemRole === 'spoke' &&
    hubCard &&
    c.ecosystem === hubCard.ecosystem &&
    c.rewardsCurrency === 'Chase Ultimate Rewards',
  );
  if (hubCard && cashbackSpoke) {
    tips.push({
      category: 'points-stacking',
      tip: `Remember: points from your ${cashbackSpoke.name} transfer to your ${hubCard.name} at 1:1 for premium airline/hotel redemptions worth up to 2¢/point. Don't redeem for cash!`,
      card: cashbackSpoke,
      annualValue: 0,
    });
  }

  // Suggest using annual credits
  for (const card of ownedCards) {
    if (card.annualCredits >= 100) {
      tips.push({
        category: 'credits',
        tip: `Your ${card.name} comes with $${card.annualCredits} in annual credits. Make sure you're using them to get full value from the card.`,
        card,
        annualValue: card.annualCredits,
      });
    }
  }

  return tips.sort((a, b) => b.annualValue - a.annualValue);
}
