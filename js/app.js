/**
 * App Controller
 * Manages multi-step form, UI state, and results rendering.
 */

// ── STATE ───────────────────────────────────────────────────────────────────
const state = {
  step: 0, // 0 = landing, 1-4 = form steps, 5 = results
  primaryGoal: null,
  experienceLevel: null,
  isCouple: false,

  // Spending (monthly $)
  spending: {
    dining: 0,
    groceries: 0,
    gas: 0,
    travel: 0,
    onlineShopping: 0,
    entertainment: 0,
    streaming: 0,
    everything: 0,
  },

  // Current cards
  ownedCardIds: [],
  openedCards: [], // [{ cardId, openedDate }]
  previousCards: [], // cards had before (no longer held) — for Amex lifetime rule

  // Partner (couple mode)
  partnerOwnedCardIds: [],
  partnerOpenedCards: [],
};

// ── BOOTSTRAP ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCardCheckboxes('card-select', CARDS);
  renderCardCheckboxes('partner-card-select', CARDS, 'partner-');
  attachEventListeners();
});

// ── NAV HELPERS ──────────────────────────────────────────────────────────────
/**
 * Attaches click listeners to a group of mutually exclusive selection buttons.
 * Clicking any button deselects all others in the group and calls onSelect(btn).
 */
function attachExclusiveSelection(selector, onSelect) {
  const btns = document.querySelectorAll(selector);
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      onSelect(btn);
    });
  });
}
function goToStep(n) {
  state.step = n;
  document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`section-${n}`);
  if (target) {
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  updateProgressBar(n);

  // Show/hide progress bar (only visible during form steps 1–4)
  const pw = document.getElementById('progress-wrap');
  if (pw) pw.style.display = (n >= 1 && n <= 4) ? 'block' : 'none';

  // Update step-3 next button label based on couple mode
  const s3next = document.getElementById('step3-next');
  if (s3next) {
    s3next.textContent = state.isCouple
      ? "Next: Partner's Cards →"
      : "Get My Recommendations →";
  }
}

function updateProgressBar(step) {
  const steps = document.querySelectorAll('.progress-step');
  steps.forEach((el, i) => {
    el.classList.toggle('completed', i + 1 < step);
    el.classList.toggle('active', i + 1 === step);
    el.classList.toggle('pending', i + 1 > step);
  });
  const bar = document.getElementById('progress-bar-fill');
  if (bar) {
    const pct = Math.min(100, Math.max(0, ((step - 1) / 4) * 100));
    bar.style.width = `${pct}%`;
  }
}

// ── CARD CHECKBOX RENDERING ──────────────────────────────────────────────────
function renderCardCheckboxes(containerId, cards, prefix = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Group by issuer
  const byIssuer = {};
  for (const card of cards) {
    if (!byIssuer[card.issuer]) byIssuer[card.issuer] = [];
    byIssuer[card.issuer].push(card);
  }

  container.innerHTML = '';
  for (const [issuer, issuerCards] of Object.entries(byIssuer)) {
    const group = document.createElement('div');
    group.className = 'card-issuer-group';
    group.innerHTML = `<h4 class="issuer-label">${issuer}</h4>`;

    for (const card of issuerCards) {
      const id = `${prefix}card-${card.id}`;
      const label = document.createElement('label');
      label.className = 'card-checkbox-label';
      label.innerHTML = `
        <input type="checkbox" id="${id}" value="${card.id}" class="${prefix}card-checkbox">
        <span class="card-checkbox-text">
          <strong>${card.name}</strong>
          <small>$${card.annualFee}/yr · ${card.rewardsCurrency}</small>
        </span>
      `;
      group.appendChild(label);
    }
    container.appendChild(group);
  }
}

// ── EVENT LISTENERS ──────────────────────────────────────────────────────────
function attachEventListeners() {
  // Landing CTA
  const startBtn = document.getElementById('btn-start');
  if (startBtn) startBtn.addEventListener('click', () => goToStep(1));

  // Step 1 → Step 2
  const step1Next = document.getElementById('step1-next');
  if (step1Next) step1Next.addEventListener('click', handleStep1Next);

  // Step 2 → Step 3
  const step2Next = document.getElementById('step2-next');
  if (step2Next) step2Next.addEventListener('click', handleStep2Next);
  const step2Back = document.getElementById('step2-back');
  if (step2Back) step2Back.addEventListener('click', () => goToStep(1));

  // Step 3 → Step 4 / Results
  const step3Next = document.getElementById('step3-next');
  if (step3Next) step3Next.addEventListener('click', handleStep3Next);
  const step3Back = document.getElementById('step3-back');
  if (step3Back) step3Back.addEventListener('click', () => goToStep(2));

  // Step 4 → Results
  const step4Next = document.getElementById('step4-next');
  if (step4Next) step4Next.addEventListener('click', handleStep4Next);
  const step4Back = document.getElementById('step4-back');
  if (step4Back) step4Back.addEventListener('click', () => goToStep(3));

  // Couple toggle
  const coupleToggle = document.getElementById('couple-toggle');
  if (coupleToggle) coupleToggle.addEventListener('change', () => {
    state.isCouple = coupleToggle.checked;
    const coupleHint = document.getElementById('couple-hint');
    if (coupleHint) coupleHint.style.display = coupleToggle.checked ? 'block' : 'none';
  });

  // Start over
  const restartBtn = document.getElementById('btn-restart');
  if (restartBtn) restartBtn.addEventListener('click', restartApp);

  // Spending sliders/inputs live update
  const spendInputs = document.querySelectorAll('.spend-input');
  spendInputs.forEach(input => {
    input.addEventListener('input', () => {
      const key = input.dataset.category;
      state.spending[key] = parseInt(input.value, 10) || 0;
      const display = document.getElementById(`display-${key}`);
      if (display) display.textContent = `$${state.spending[key]}`;
    });
  });

  // Exclusive selection buttons (goal and experience level)
  attachExclusiveSelection('.goal-btn', (btn) => { state.primaryGoal = btn.dataset.goal; });
  attachExclusiveSelection('.exp-btn', (btn) => { state.experienceLevel = btn.dataset.level; });
}

// ── STEP HANDLERS ────────────────────────────────────────────────────────────
function handleStep1Next() {
  if (!state.primaryGoal) {
    showError('step1-error', 'Please select a primary goal.');
    return;
  }
  if (!state.experienceLevel) {
    showError('step1-error', 'Please select your experience level.');
    return;
  }
  clearError('step1-error');
  goToStep(2);
}

function handleStep2Next() {
  readSpending();
  const total = Object.values(state.spending).reduce((a, b) => a + b, 0);
  if (total === 0) {
    showError('step2-error', 'Please enter at least one spending category.');
    return;
  }
  clearError('step2-error');
  goToStep(3);
}

function handleStep3Next() {
  // Collect owned cards
  const checkboxes = document.querySelectorAll('.card-checkbox:checked');
  state.ownedCardIds = Array.from(checkboxes).map(cb => cb.value);
  state.openedCards = collectOpenedDates(state.ownedCardIds, '');

  if (state.isCouple) {
    goToStep(4);
  } else {
    runRecommendations();
    goToStep(5);
  }
}

function handleStep4Next() {
  const checkboxes = document.querySelectorAll('.partner-card-checkbox:checked');
  state.partnerOwnedCardIds = Array.from(checkboxes).map(cb => cb.value);
  state.partnerOpenedCards = collectOpenedDates(state.partnerOwnedCardIds, 'partner-');
  runRecommendations();
  goToStep(5);
}

function collectOpenedDates(cardIds, prefix) {
  return cardIds.map(cardId => {
    const input = document.getElementById(`${prefix}date-${cardId}`);
    const openedDate = input ? input.value : null;
    let resolvedDate;
    if (openedDate) {
      resolvedDate = new Date(openedDate + '-01');
    } else {
      // Default fallback: assume card opened ~12 months ago
      const fallback = new Date();
      fallback.setMonth(fallback.getMonth() - 12);
      resolvedDate = fallback;
    }
    return { cardId, openedDate: resolvedDate };
  });
}

function readSpending() {
  const inputs = document.querySelectorAll('.spend-input');
  inputs.forEach(input => {
    const key = input.dataset.category;
    state.spending[key] = parseInt(input.value, 10) || 0;
  });
}

function restartApp() {
  Object.assign(state, {
    step: 0,
    primaryGoal: null,
    experienceLevel: null,
    isCouple: false,
    spending: { dining: 0, groceries: 0, gas: 0, travel: 0, onlineShopping: 0, entertainment: 0, streaming: 0, everything: 0 },
    ownedCardIds: [],
    openedCards: [],
    previousCards: [],
    partnerOwnedCardIds: [],
    partnerOpenedCards: [],
  });
  goToStep(0);
  document.querySelectorAll('.goal-btn, .exp-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('input[type=checkbox]').forEach(c => (c.checked = false));
  document.querySelectorAll('.spend-input').forEach(i => (i.value = 0));
  document.querySelectorAll('.spend-display').forEach(d => (d.textContent = '$0'));
}

// ── DYNAMIC DATE INPUTS ──────────────────────────────────────────────────────
// When a card checkbox is checked, show an "opened" date field for it
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('card-checkbox')) {
    toggleDateField(e.target, 'card-dates', '');
  }
  if (e.target.classList.contains('partner-card-checkbox')) {
    toggleDateField(e.target, 'partner-card-dates', 'partner-');
  }
});

function toggleDateField(checkbox, containerId, prefix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const cardId = checkbox.value;
  const card = getCardById(cardId);
  const existingRow = document.getElementById(`${prefix}date-row-${cardId}`);

  if (checkbox.checked) {
    if (!existingRow) {
      const row = document.createElement('div');
      row.className = 'date-row';
      row.id = `${prefix}date-row-${cardId}`;

      // Use textContent for user-derived values to prevent XSS
      const nameSpan = document.createElement('span');
      nameSpan.textContent = card ? card.name : cardId;

      const wrap = document.createElement('div');
      wrap.className = 'date-input-wrap';

      const lbl = document.createElement('label');
      lbl.textContent = 'Opened (month/year):';

      const inp = document.createElement('input');
      inp.type = 'month';
      inp.id = `${prefix}date-${cardId}`;
      inp.className = 'date-input';
      inp.max = currentMonthValue();

      wrap.appendChild(lbl);
      wrap.appendChild(inp);
      row.appendChild(nameSpan);
      row.appendChild(wrap);
      container.appendChild(row);
    }
  } else {
    if (existingRow) existingRow.remove();
  }
}

function currentMonthValue() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// ── RECOMMENDATIONS RENDERING ────────────────────────────────────────────────
function runRecommendations() {
  const userProfile = {
    ownedCardIds: state.ownedCardIds,
    openedCards: state.openedCards,
    previousCards: state.previousCards,
    primaryGoal: state.primaryGoal,
    experienceLevel: state.experienceLevel,
    isCouple: state.isCouple,
  };

  const recs = generateRecommendations(userProfile, state.spending);
  const strategies = matchStrategies(userProfile, state.spending);
  const tips = generateOptimizationTips(state.ownedCardIds, state.spending);
  const status524 = get524Status(state.openedCards);

  render524Status(status524);
  renderCardRecommendations(recs.slice(0, 8));
  renderStrategies(strategies.slice(0, 6));
  renderOptimizationTips(tips);

  if (state.isCouple) {
    const partnerProfile = {
      ownedCardIds: state.partnerOwnedCardIds,
      openedCards: state.partnerOpenedCards,
      previousCards: [],
      primaryGoal: state.primaryGoal,
      experienceLevel: state.experienceLevel,
      isCouple: true,
    };
    const partnerRecs = generateRecommendations(partnerProfile, state.spending);
    const coupleStrats = matchStrategies(
      { ...userProfile, isCouple: true },
      state.spending,
    ).filter(s => s.coupleStrategy);

    renderCoupleSection(partnerRecs.slice(0, 5), coupleStrats);
  } else {
    const coupleSection = document.getElementById('section-couple-results');
    if (coupleSection) coupleSection.style.display = 'none';
  }
}

// ── RENDER 5/24 STATUS ───────────────────────────────────────────────────────
function render524Status(status) {
  const el = document.getElementById('status-524');
  if (!el) return;

  const filledDots = status.slotsUsed;
  const dots = Array.from({ length: 5 }, (_, i) =>
    `<span class="slot-dot ${i < filledDots ? 'used' : 'free'}"></span>`,
  ).join('');

  let statusText = '';
  if (status.count >= 5) {
    const dateStr = status.nextSlotOpenDate
      ? status.nextSlotOpenDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'soon';
    statusText = `<span class="badge badge-red">At Limit</span> You've used all 5 Chase 5/24 slots. Chase cards unavailable until a slot opens (next: ~${dateStr}).`;
  } else if (status.count >= 3) {
    statusText = `<span class="badge badge-yellow">Caution</span> ${status.slotsUsed}/5 Chase slots used. Prioritize Chase cards before adding from other issuers.`;
  } else {
    statusText = `<span class="badge badge-green">Healthy</span> ${status.slotsUsed}/5 Chase slots used. You have room to add more cards.`;
  }

  el.innerHTML = `
    <div class="status-524-inner">
      <div class="slots-visual">${dots}</div>
      <p>${statusText}</p>
    </div>
  `;
}

// ── RENDER CARD RECOMMENDATIONS ──────────────────────────────────────────────
function renderCardRecommendations(recs) {
  const container = document.getElementById('recommendations-list');
  if (!container) return;
  container.innerHTML = '';

  recs.forEach((rec, i) => {
    const { card, eligible, eligibilityReason, value, reasons, hadAmexBefore } = rec;
    const rank = i + 1;

    const tagsHtml = card.tags.slice(0, 4).map(t =>
      `<span class="tag">${t.replace(/-/g, ' ')}</span>`,
    ).join('');

    const reasonsHtml = reasons.slice(0, 3).map(r =>
      `<li>${r}</li>`,
    ).join('');

    const amexWarning = hadAmexBefore
      ? `<div class="alert alert-warning">⚠️ You may have previously received a sign-up bonus for this card. Amex typically offers bonuses once per lifetime per card.</div>`
      : '';

    const eligibilityHtml = eligible
      ? ''
      : `<div class="alert alert-danger">🚫 ${eligibilityReason}</div>`;

    const cardEl = document.createElement('div');
    cardEl.className = `rec-card ${eligible ? '' : 'rec-card-ineligible'}`;
    cardEl.innerHTML = `
      <div class="rec-card-header">
        <div class="rec-rank">#${rank}</div>
        <div class="rec-card-info">
          <h3>${card.name}</h3>
          <p class="issuer-badge">${card.issuer} · ${card.network} · ${card.type === 'business' ? '💼 Business' : '👤 Personal'}</p>
          <div class="tags-row">${tagsHtml}</div>
        </div>
        <div class="rec-value-block">
          <div class="value-number">$${value.netValue > 0 ? value.netValue : 0}</div>
          <div class="value-label">est. net/yr</div>
        </div>
      </div>
      <div class="rec-card-body">
        ${eligibilityHtml}
        ${amexWarning}
        <div class="fee-row">
          <span>Annual fee: <strong>$${card.annualFee}</strong></span>
          ${card.annualCredits > 0 ? `<span>Credits: <strong>$${card.annualCredits}</strong></span>` : ''}
          <span>Sign-up bonus: <strong>~$${card.signupBonusValue}</strong></span>
          <span>Rewards: <strong>${card.rewardsCurrency}</strong></span>
        </div>
        <div class="earn-rates">
          ${renderEarnRates(card)}
        </div>
        ${reasonsHtml.length > 0 ? `<ul class="reasons-list">${reasonsHtml}</ul>` : ''}
        <details class="benefits-details">
          <summary>View all benefits</summary>
          <ul class="benefits-list">${card.benefits.map(b => `<li>${b}</li>`).join('')}</ul>
        </details>
      </div>
    `;
    container.appendChild(cardEl);
  });
}

function renderEarnRates(card) {
  const cats = card.categories;
  const labels = {
    dining: '🍽 Dining',
    groceries: '🛒 Groceries',
    gas: '⛽ Gas',
    travel: '✈ Travel',
    flights: '✈ Flights',
    hotels: '🏨 Hotels',
    onlineShopping: '🛍 Online Shopping',
    entertainment: '🎭 Entertainment',
    streaming: '📺 Streaming',
    rotating: '🔄 Rotating (5%)',
    everything: '💳 Everything',
    topCategory: '🏆 Top Category',
  };

  return Object.entries(cats)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `<div class="earn-chip"><strong>${v}x</strong> ${labels[k] || k}</div>`)
    .join('');
}

// ── RENDER STRATEGIES ────────────────────────────────────────────────────────
function renderStrategies(strategies) {
  const container = document.getElementById('strategies-list');
  if (!container) return;
  container.innerHTML = '';

  if (strategies.length === 0) {
    container.innerHTML = '<p class="empty-state">No strategies matched your profile. Try selecting different goals or adding more cards.</p>';
    return;
  }

  strategies.forEach(strategy => {
    const missingHtml = strategy.missingCards && strategy.missingCards.length > 0
      ? `<div class="missing-cards"><strong>Cards to add:</strong> ${strategy.missingCards.map(c => c.name).join(' → ')}</div>`
      : '<div class="missing-cards complete">✅ You have all cards in this strategy!</div>';

    const tipsHtml = strategy.tips
      ? `<ul class="strategy-tips">${strategy.tips.map(t => `<li>${t}</li>`).join('')}</ul>`
      : '';

    const cardEl = document.createElement('div');
    cardEl.className = 'strategy-card';
    cardEl.innerHTML = `
      <div class="strategy-header">
        <div>
          <h3>${strategy.name}</h3>
          <p class="strategy-tagline">${strategy.tagline}</p>
        </div>
        <div class="strategy-meta">
          <span class="badge badge-${strategy.difficulty === 'beginner' ? 'green' : strategy.difficulty === 'advanced' ? 'red' : 'yellow'}">${strategy.difficulty}</span>
          <span class="badge badge-blue">${strategy.ecosystem}</span>
        </div>
      </div>
      <div class="completion-bar-wrap">
        <div class="completion-bar" style="width: ${strategy.completion}%"></div>
        <span>${strategy.completion}% complete (${strategy.alreadyOwnedCount}/${strategy.totalCards} cards)</span>
      </div>
      <p class="strategy-desc">${strategy.description}</p>
      ${missingHtml}
      ${tipsHtml}
      <div class="strategy-footer">
        <span>Est. annual value: <strong>$${strategy.estimatedAnnualValue}+</strong></span>
        <span>Time horizon: <strong>${strategy.timeHorizon}</strong></span>
      </div>
    `;
    container.appendChild(cardEl);
  });
}

// ── RENDER OPTIMIZATION TIPS ─────────────────────────────────────────────────
function renderOptimizationTips(tips) {
  const container = document.getElementById('tips-list');
  if (!container) return;
  container.innerHTML = '';

  if (tips.length === 0 && state.ownedCardIds.length === 0) {
    container.innerHTML = '<p class="empty-state">Add your current cards in Step 3 to get optimization tips.</p>';
    return;
  }
  if (tips.length === 0) {
    container.innerHTML = '<p class="empty-state">You\'re already well-optimized! Great card usage.</p>';
    return;
  }

  tips.forEach(tip => {
    const el = document.createElement('div');
    el.className = 'tip-card';
    el.innerHTML = `
      <span class="tip-icon">${getCategoryIcon(tip.category)}</span>
      <p>${tip.tip}</p>
      ${tip.annualValue > 0 ? `<span class="tip-value">+$${tip.annualValue}/yr</span>` : ''}
    `;
    container.appendChild(el);
  });
}

function getCategoryIcon(category) {
  const icons = {
    dining: '🍽',
    groceries: '🛒',
    gas: '⛽',
    travel: '✈',
    onlineShopping: '🛍',
    entertainment: '🎭',
    streaming: '📺',
    'points-stacking': '🔗',
    credits: '💡',
  };
  return icons[category] || '💳';
}

// ── RENDER COUPLE SECTION ────────────────────────────────────────────────────
function renderCoupleSection(partnerRecs, coupleStrats) {
  const section = document.getElementById('section-couple-results');
  if (section) section.style.display = 'block';

  const container = document.getElementById('couple-recs-list');
  if (container) {
    container.innerHTML = '';
    partnerRecs.slice(0, 5).forEach((rec, i) => {
      const el = document.createElement('div');
      el.className = `rec-card compact ${rec.eligible ? '' : 'rec-card-ineligible'}`;
      el.innerHTML = `
        <div class="rec-card-header">
          <div class="rec-rank">#${i + 1}</div>
          <div class="rec-card-info">
            <h3>${rec.card.name}</h3>
            <p class="issuer-badge">${rec.card.issuer}</p>
          </div>
          <div class="rec-value-block">
            <div class="value-number">$${Math.max(0, rec.value.netValue)}</div>
            <div class="value-label">est. net/yr</div>
          </div>
        </div>
        ${rec.eligible ? '' : `<div class="alert alert-danger">🚫 ${rec.eligibilityReason}</div>`}
      `;
      container.appendChild(el);
    });
  }

  const stratsContainer = document.getElementById('couple-strats-list');
  if (stratsContainer) {
    stratsContainer.innerHTML = '';
    coupleStrats.forEach(s => {
      const el = document.createElement('div');
      el.className = 'strategy-card couple-strategy';
      const p1Cards = (s.person1Cards || []).map(id => {
        const c = getCardById(id); return c ? c.name : id;
      }).join(', ');
      const p2Cards = (s.person2Cards || []).map(id => {
        const c = getCardById(id); return c ? c.name : id;
      }).join(', ');
      el.innerHTML = `
        <div class="strategy-header">
          <div>
            <h3>${s.name}</h3>
            <p class="strategy-tagline">${s.tagline}</p>
          </div>
          <span class="badge badge-purple">Couple Strategy</span>
        </div>
        <p class="strategy-desc">${s.description}</p>
        <div class="couple-cards-split">
          <div class="person-block"><strong>Person 1:</strong> ${p1Cards || '—'}</div>
          <div class="person-block"><strong>Person 2:</strong> ${p2Cards || '—'}</div>
        </div>
        ${s.tips ? `<ul class="strategy-tips">${s.tips.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
        <div class="strategy-footer">
          <span>Est. combined annual value: <strong>$${s.estimatedAnnualValue}+</strong></span>
        </div>
      `;
      stratsContainer.appendChild(el);
    });
    if (coupleStrats.length === 0) {
      stratsContainer.innerHTML = '<p class="empty-state">Select "Travel" as your primary goal to see couple strategies.</p>';
    }
  }
}

// ── UTILITY ──────────────────────────────────────────────────────────────────
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
