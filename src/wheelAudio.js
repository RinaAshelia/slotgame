export function getWheelSpinAudioPlan(result) {
  return {
    start: ["spinStart", "spinLoop"],
    stop: ["reelStop", result.id === "jackpot" ? "jackpot" : result.isBlank ? "featureTrigger" : "win"],
  };
}
