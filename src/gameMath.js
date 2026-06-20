export const JACKPOT_AMOUNT = 1250000;
export const BASE_BET = 2.5;
export const RISK_TRIGGER_MULTIPLIER = 4;
export const RISK_ELIGIBLE_SYMBOL_IDS = new Set([
  "blonde-cat",
  "pink-elf",
  "dark-wolf",
  "white-wolf",
  "lion",
  "jackpot",
]);

export const BET_OPTIONS = [BASE_BET, 5, 10, 25, 50, 100];

export const BASE_SYMBOL_PAYOUTS = {
  jackpot: JACKPOT_AMOUNT,
  lion: 100,
  "white-wolf": 50,
  "dark-wolf": 25,
  "pink-elf": 15,
  "blonde-cat": 10,
  "blonde-heart": 5,
  sheep: 2.5,
};

const regularProfileBase = {
  jackpot: 0.0000004,
  lion: 0.0014,
  "white-wolf": 0.0028,
  "dark-wolf": 0.0075,
  "pink-elf": 0.02,
  "blonde-cat": 0.034,
  "blonde-heart": 0.043,
  sheep: 0.0563,
  nearMiss: 0.155,
};

const HIGH_STAKE_PREMIUM_BOOST_BY_STAKE = new Map([
  [25, 0.004],
  [50, 0.008],
  [100, 0.012],
]);

const PREMIUM_BOOST_WEIGHTS = {
  lion: 0.08,
  "white-wolf": 0.14,
  "dark-wolf": 0.18,
  "pink-elf": 0.25,
  "blonde-cat": 0.35,
};

function withMixedOutcome(profile) {
  const totalWithoutMixed = Object.values(profile).reduce((sum, chance) => sum + chance, 0);
  return {
    ...profile,
    mixed: Math.max(0, 1 - totalWithoutMixed),
  };
}

export const REGULAR_OUTCOME_PROFILE = withMixedOutcome(regularProfileBase);

function getPremiumBoostForStake(stake) {
  if (stake >= 100) {
    return HIGH_STAKE_PREMIUM_BOOST_BY_STAKE.get(100);
  }

  if (stake >= 50) {
    return HIGH_STAKE_PREMIUM_BOOST_BY_STAKE.get(50);
  }

  if (stake >= 25) {
    return HIGH_STAKE_PREMIUM_BOOST_BY_STAKE.get(25);
  }

  return 0;
}

function applyHighStakePremiumBoost(profile, boost) {
  if (boost <= 0) {
    return profile;
  }

  const adjustedProfile = { ...profile };

  for (const [symbolId, weight] of Object.entries(PREMIUM_BOOST_WEIGHTS)) {
    adjustedProfile[symbolId] += boost * weight;
  }

  adjustedProfile["blonde-heart"] -= boost * 0.45;
  adjustedProfile.sheep -= boost * 0.55;

  return adjustedProfile;
}

export function getOutcomeProfile(stake = BASE_BET) {
  const premiumBoost = getPremiumBoostForStake(stake);

  if (premiumBoost <= 0) {
    return REGULAR_OUTCOME_PROFILE;
  }

  return withMixedOutcome(applyHighStakePremiumBoost(regularProfileBase, premiumBoost));
}

export function getPayoutMultiplier(stake, options = {}) {
  return stake / BASE_BET;
}

export function getScaledPayout(basePayout, stake, options = {}) {
  if (basePayout === JACKPOT_AMOUNT) {
    return JACKPOT_AMOUNT;
  }

  return Math.round(basePayout * getPayoutMultiplier(stake, options) * 100) / 100;
}

export function getSymbolPayout(symbolId, stake, options = {}) {
  if (symbolId === "jackpot") {
    return JACKPOT_AMOUNT;
  }

  if (symbolId === "sheep") {
    return stake;
  }

  return getScaledPayout(BASE_SYMBOL_PAYOUTS[symbolId], stake, options);
}

export function getRoundStake(bet, options = {}) {
  return bet;
}

export function getOutcomeKind(roll, options = {}) {
  const profile = getOutcomeProfile(options.stake);
  const outcomeOrder = [
    ["jackpot", "jackpot"],
    ["lion", "lion"],
    ["white-wolf", "white-wolf"],
    ["dark-wolf", "dark-wolf"],
    ["pink-elf", "pink-elf"],
    ["blonde-cat", "blonde-cat"],
    ["blonde-heart", "blonde-heart"],
    ["sheep", "sheep"],
    ["nearMiss", "near-miss"],
    ["mixed", "mixed"],
  ];

  let cumulativeChance = 0;

  for (const [profileKey, outcomeKind] of outcomeOrder) {
    cumulativeChance += profile[profileKey];

    if (roll < cumulativeChance) {
      return outcomeKind;
    }
  }

  return "mixed";
}

export function qualifiesForRiskChoice(payout, stake) {
  if (stake <= 0) {
    return false;
  }

  return payout >= stake * RISK_TRIGGER_MULTIPLIER;
}

export function canOfferRiskChoice(symbolId, payout, stake) {
  if (!RISK_ELIGIBLE_SYMBOL_IDS.has(symbolId)) {
    return false;
  }

  return qualifiesForRiskChoice(payout, stake);
}

export function resolveRiskChoice(openWin, options = {}) {
  const { takeSafe = false, roll = Math.random() } = options;

  if (takeSafe) {
    return {
      creditedWin: openWin,
      outcome: "safe",
    };
  }

  if (roll < 0.5) {
    return {
      creditedWin: openWin * 2,
      outcome: "lion-win",
    };
  }

  return {
    creditedWin: 0,
    outcome: "lion-loss",
  };
}
