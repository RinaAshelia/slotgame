export const JACKPOT_AMOUNT = 1250000;
export const BASE_BET = 2.5;
export const RISK_TRIGGER_MULTIPLIER = 10;

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
  lion: 0.002,
  "white-wolf": 0.0035,
  "dark-wolf": 0.005,
  "pink-elf": 0.006,
  "blonde-cat": 0.007,
  "blonde-heart": 0.008,
  sheep: 0.012,
  nearMiss: 0.22,
};

function withMixedOutcome(profile) {
  const totalWithoutMixed = Object.values(profile).reduce((sum, chance) => sum + chance, 0);
  return {
    ...profile,
    mixed: Math.max(0, 1 - totalWithoutMixed),
  };
}

export const REGULAR_OUTCOME_PROFILE = withMixedOutcome(regularProfileBase);

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
  const profile = REGULAR_OUTCOME_PROFILE;
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
