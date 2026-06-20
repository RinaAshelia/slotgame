# Single Payline Design

**Goal:** Vereinfachung des Slot-Prototyps auf eine einzige mittlere Gewinnlinie mit dynamischer Auszahlungstafel und nur einem Einsatzregler.

## Context

Die aktuelle UI zeigt visuell nur eine mittlere Gewinnlinie. Der Regler `Linien` steuert keine zusätzlichen sichtbaren Gewinnlinien, sondern verändert nur Einsatz und Gewinnskalierung. Das ist für unerfahrene Spieler missverständlich.

## Decisions

- `Linien` wird komplett entfernt.
- Der Slot arbeitet nur noch mit einer festen mittleren Gewinnlinie.
- `Einsatz` bleibt der einzige veränderbare Einsatzregler.
- `Rundeneinsatz` entspricht direkt dem aktuellen Einsatz.
- Die Auszahlungstafel zeigt keine statischen Basispreise mehr, sondern die aktuell gültigen Gewinne auf Basis des gewählten Einsatzes.
- Höhere Einsätze skalieren Gewinne weiter weich und gedeckelt, nicht explosiv.

## Implementation Notes

- UI und Spielzustand verlieren jede Linien-Abhängigkeit.
- Die Gewinnberechnung hängt nur noch vom Symbolbasiswert und vom aktuellen Einsatz ab.
- Die Auszahlungstafel nutzt dieselbe Berechnungsfunktion wie die tatsächliche Gewinnauszahlung, damit Anzeige und Verhalten nicht auseinanderlaufen.

## Verification

- Logiktest für Einsatz-basierte Multiplikation und dynamische Tafelwerte.
- Produktions-Build.
- Browser-Reload mit Sichtprüfung auf entfernten Linienregler und dynamische Tafelwerte.
