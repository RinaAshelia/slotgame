const numberFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGil(value) {
  return `${numberFormatter.format(value)} GIL`;
}
