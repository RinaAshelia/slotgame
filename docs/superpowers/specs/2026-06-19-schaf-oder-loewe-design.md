# Schaf-Oder-Loewe Design

**Goal:** Den generischen `All in`-Mechanismus durch eine thematisch passende Risiko-Entscheidung nach großen Gewinnen ersetzen.

## Decisions

- Der separate `All in`-Button wird entfernt.
- Das Feature `Schaf oder Loewe` wird nur nach Gewinnen ausgelöst, die mindestens **10x des aktuellen Einsatzes** betragen.
- Der Trigger basiert auf der tatsächlichen Gewinnhöhe relativ zum aktuellen Einsatz, nicht auf festen Symbolnamen.
- Das Feature gilt auch fuer den Jackpot. Auch ein Jackpot wird nicht sofort gutgeschrieben.
- Pro qualifiziertem Gewinn gibt es genau **eine** Risiko-Entscheidung, keine Ketten-Verdopplung.
- Die Risiko-Entscheidung ist immer **50/50**: offener Gewinn verdoppelt sich oder faellt komplett weg.

## Player Flow

1. Der Spieler startet einen normalen Spin.
2. Das Spiel ermittelt Einsatz, Ergebnis und Gewinn wie gewohnt.
3. Liegt der Gewinn unter `10x Einsatz`, wird er direkt dem Guthaben gutgeschrieben.
4. Liegt der Gewinn bei mindestens `10x Einsatz`, wird er als **offener Gewinn** gehalten und noch nicht dem Guthaben gutgeschrieben.
5. Statt eines neuen Spins erscheint sofort ein Overlay mit der Entscheidung:
   - `Sicher nehmen`
   - `Einmal Loewe sein`
6. `Sicher nehmen` schreibt den offenen Gewinn unveraendert gut.
7. `Einmal Loewe sein` fuehrt genau einen 50/50-Wurf aus:
   - Erfolg: doppelter offener Gewinn wird gutgeschrieben.
   - Verlust: kein Gewinn wird gutgeschrieben.
8. Nach der Entscheidung schliesst das Overlay und das Spiel kehrt in den normalen Ready-State zurueck.

## UI

- Das Overlay erscheint mittig ueber dem Slot und blockiert waehrenddessen weitere Eingaben.
- Im Overlay steht der offene Gewinn gross im Fokus.
- Die Leitfrage lautet: `Bleibst du Schaf oder wirst du Loewe?`
- Die Optionen werden klar getrennt dargestellt:
  - `Sicher nehmen` ist die ruhige, sichere Standardoption.
  - `Einmal Loewe sein` ist die auffaellige Risiko-Option.
- Das Overlay zeigt kurze Kontextkopie, dass der Gewinn aktuell noch **nicht gesichert** ist.
- Nach der Entscheidung erscheint ein klarer Ergebnistext:
  - Erfolg: `Der Loewe bruellt! Gewinn verdoppelt.`
  - Verlust: `Du warst doch nur ein Schaf im Loewenfell.`
  - Sicher: `Schaf-Modus bestaetigt. Gewinn gesichert.`

## State Model

- Das Spiel bekommt einen zusaetzlichen Zwischenzustand fuer `pending-risk-choice`.
- In diesem Zustand existiert ein `offener Gewinn`, der getrennt vom normalen Guthaben gehalten wird.
- Solange `pending-risk-choice` aktiv ist:
  - sind `Spielen` und andere Aktionsbuttons deaktiviert,
  - darf kein neuer Spin gestartet werden,
  - bleibt der offene Gewinn im Overlay sichtbar.
- Nach Abschluss der Entscheidung wird der offene Gewinn aufgeloest:
  - bei sicherem Nehmen als Gutschrift,
  - bei Erfolg als doppelte Gutschrift,
  - bei Verlust als `0`.

## Economy Constraints

- Die bestehende Auszahlungsleiter bleibt grundsaetzlich bestehen.
- Die neue Mechanik ersetzt den vorherigen permanent sichtbaren Hochrisiko-Zugang durch einen seltenen, dramatischen Moment.
- Da der Trigger erst ab `10x Einsatz` greift, bleiben kleine und mittlere Gewinne schnell und unterbrechungsfrei.
- Jackpot, Loewe, Poly und Alucard koennen die Mechanik ausloesen, aber nur dann, wenn ihr ausgerechneter Gewinn die `10x`-Schwelle erreicht.

## Verification

- Test, dass Gewinne unter `10x Einsatz` sofort gutgeschrieben werden.
- Test, dass Gewinne ab `10x Einsatz` zunaechst als offener Gewinn gehalten werden.
- Test, dass `Sicher nehmen` exakt den offenen Gewinn gutschreibt.
- Test, dass `Einmal Loewe sein` bei Erfolg exakt den doppelten offenen Gewinn gutschreibt.
- Test, dass `Einmal Loewe sein` bei Verlust keinen Gewinn gutschreibt.
- Test, dass der Jackpot ebenfalls ueber das Overlay laeuft und nicht sofort ausgezahlt wird.
- Browser-Check fuer deaktivierte Buttons waehrend des Overlays und fuer die Sichtbarkeit der Entscheidungstexte.
