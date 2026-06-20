# All-In Economy Design

**Goal:** Den Slot um eine feste Jackpot-Auszahlung von 1.250.000 GIL, einen separaten All-in-Spin und eine stärkere High-Stake-Ökonomie erweitern.

## Decisions

- Der Jackpot bleibt immer bei **1.250.000,00 GIL**, unabhängig vom Einsatz.
- Normale Einsätze laufen über eine erweiterte Einsatzleiter, damit auch Werte über 10 GIL sinnvoll spielbar sind.
- `All in` wird als **eigener Button** umgesetzt, nicht als normale Einsatzstufe.
- `All in` setzt den kompletten aktuellen Kontostand auf genau einen Spin.
- Bei `All in` steigt die Chance auf große Preise sichtbar, gleichzeitig ist bei einem Verlust sofort das Guthaben weg.
- Nicht-Jackpot-Gewinne skalieren bei hohen Einsätzen stärker als bisher.

## UI

- Der bestehende Einsatz-Stepper bleibt für Standardspiele.
- Neben oder unter `Spielen` kommt ein eigener `All in`-Button mit klarem Risiko-Charakter.
- Der Button zeigt den vollen aktuellen Einsatzbetrag, damit das Risiko vor dem Klick klar ist.

## Game Math

- Jackpot-Payout ist von jeder Multiplikator-Logik ausgenommen.
- Normale Einsatzstufen bekommen eine aggressivere, aber weiterhin kontrollierte Multiplikator-Kurve.
- All-in-Spins nutzen den gesamten Kontostand als Stake und bekommen zusätzlich ein riskanteres Outcome-Profil mit höherer Großgewinn-Chance.
- Auszahlungstafel und echte Gewinnauszahlung müssen dieselbe Berechnungsquelle verwenden.

## Verification

- Test für festen Jackpot trotz wechselndem Einsatz.
- Test für höhere Multiplikatoren bei großen Einsätzen.
- Test, dass das All-in-Profil höhere Großgewinn-Chancen als das Standardprofil hat.
- Build und Browser-Check für Button-Belegung und sichtbare Auszahlungstafel.
