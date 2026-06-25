export const JACKPOT_AMOUNT = 1250000;
export const BASE_BET = 2.5;
export const START_BALANCE = 400;
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

const TARGET_HIT_RATE = 0.24;
const TARGET_RTP = 0.92;
const JACKPOT_RTP_SHARE = 0.1;
const NEAR_MISS_RATE = 0.09;

const fixedOutcomeProfile = {
  lion: 0.0015,
  "white-wolf": 0.004,
  "dark-wolf": 0.01,
  "pink-elf": 0.03,
  "blonde-heart": 0.07,
};

function withMixedOutcome(profile) {
  const totalWithoutMixed = Object.values(profile).reduce((sum, chance) => sum + chance, 0);
  return {
    ...profile,
    mixed: Math.max(0, 1 - totalWithoutMixed),
  };
}

export function getOutcomeProfile(stake = BASE_BET) {
  const safeStake = Number.isFinite(stake) && stake > 0 ? stake : BASE_BET;
  const jackpot = (JACKPOT_RTP_SHARE * safeStake) / JACKPOT_AMOUNT;
  const fixedHitRate = Object.values(fixedOutcomeProfile).reduce((sum, chance) => sum + chance, 0);
  const fixedRtp =
    fixedOutcomeProfile.lion * (BASE_SYMBOL_PAYOUTS.lion / BASE_BET) +
    fixedOutcomeProfile["white-wolf"] * (BASE_SYMBOL_PAYOUTS["white-wolf"] / BASE_BET) +
    fixedOutcomeProfile["dark-wolf"] * (BASE_SYMBOL_PAYOUTS["dark-wolf"] / BASE_BET) +
    fixedOutcomeProfile["pink-elf"] * (BASE_SYMBOL_PAYOUTS["pink-elf"] / BASE_BET) +
    fixedOutcomeProfile["blonde-heart"] * (BASE_SYMBOL_PAYOUTS["blonde-heart"] / BASE_BET);
  const remainingHitRate = TARGET_HIT_RATE - jackpot - fixedHitRate;
  const remainingRtp = TARGET_RTP - JACKPOT_RTP_SHARE - fixedRtp;
  const blondeCat = (remainingRtp - remainingHitRate) / 3;
  const sheep = remainingHitRate - blondeCat;

  return withMixedOutcome({
    jackpot,
    ...fixedOutcomeProfile,
    "blonde-cat": blondeCat,
    sheep,
    nearMiss: NEAR_MISS_RATE,
  });
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
