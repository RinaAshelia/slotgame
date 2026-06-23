# Glücksrad: Preise, Ergebnisse und Layout

## Ziel

Das Glücksrad bleibt ein eigenständiges, vollständig interaktives Spiel mit genau drei Drehungen pro Tag beziehungsweise Browser-Sitzung. Es vergibt feste Preise, die später außerhalb der App in Final Fantasy XIV ausgezahlt werden. Die Slotgame-Auszahlungen und die Slotgame-Logik bleiben unverändert.

## Preisdefinition

Jedes Radsegment besitzt einen festen, nicht skalierenden Preistext:

| Symbol | Preis |
| --- | --- |
| Turri | Glam-Item |
| Alucard | Chocobo-Sattel (Auswahl 100er Trials) |
| Eden | 33 Flasks nach Wahl |
| Ashelia | 50 Bufffood |
| Poly | 100.000 GIL |
| Schaf | Niete |
| Löwe | 333.000 GIL |
| Jackpot | 1.250.000 GIL |

Das Glücksrad führt kein Guthaben, keinen Einsatz und keine interne Gutschrift. Das sichtbare Ergebnis des Rads bestimmt den Preis direkt; es gibt keinen zusätzlichen Zufallsentscheid, der ein Gewinnsegment nachträglich zur Niete macht.

## Drehungen und Ergebniszustand

- Pro Sitzung stehen genau drei Drehungen zur Verfügung.
- Nach dem dritten bestätigten Ergebnis bleibt der Drehbutton deaktiviert.
- Es gibt keine Aktion „Neue Runde“ und keinen Reset innerhalb der Oberfläche.
- Die Sitzung speichert jedes bestätigte Ergebnis in seiner Drehreihenfolge.
- Auch `Schaf – Niete` wird in der Historie festgehalten.
- Ein Seiten-Reload darf die aktuelle In-Memory-Sitzung zurücksetzen; dauerhafte Speicherung ist nicht Teil dieses Umfangs.

## Ergebnis-Overlay

Nach jedem Dreh erscheint ein blockierendes Overlay. Es zeigt:

- das zum Segment gehörende Bild,
- den Charakternamen beziehungsweise `Jackpot` oder `Schaf`,
- den exakten Preistext,
- eine Bestätigungsaktion.

Der Preis bleibt bis zur Bestätigung sichtbar. Für Schaf lautet das Ergebnis klar `Niete`; es werden weder `0 GIL` noch eine Auszahlung oder Gutschrift kommuniziert. Das Overlay erhält eine beschriftete Dialogüberschrift und setzt den Fokus auf die Bestätigungsaktion.

## Ergebnis-Historie

Direkt unter dem Drehbutton steht der kompakte Bereich `Deine Drehungen heute`. Nach jeder Bestätigung wird eine Zeile ergänzt:

1. Drehungsnummer,
2. kleines Symbolbild,
3. Name,
4. Preistext.

Die Liste zeigt maximal drei Einträge und bleibt auch nach dem letzten Dreh sichtbar. Sie gehört zur linken Rad-/Aktionsspalte und nicht zum Statusbereich oder zur Jackpot-Bühne.

## Desktop-Layout

Der freigegebene Aufbau ist Variante A:

- Links bilden Glücksrad, Drehbutton und Ergebnis-Historie eine vertikale Einheit.
- Rechts steht die Jackpot-Bühne unmittelbar neben dem Rad.
- Beide Spalten verwenden `min-width: 0`, damit Inhalte innerhalb des Grids schrumpfen können.
- Der Abstand zwischen Rad und Bühne wird reduziert, ohne die bestehende Premium-Casino-Gestaltung zu verändern.
- Der Drehbutton orientiert sich an der Breite des Rads und sitzt ohne übermäßigen vertikalen Abstand direkt darunter.
- Der Status-/Regelbereich nutzt die volle verfügbare Breite bis zur rechten Kante der Header-Aktionen.

## Mobile Layout

Unterhalb des Desktop-Breakpoints werden Rad-/Aktionsspalte und Jackpot-Bühne gestapelt:

1. Rad,
2. Drehbutton,
3. Ergebnis-Historie,
4. Jackpot-Bühne.

Das Rad ist auf `calc(100vw - 32px)` begrenzt. Relevante Grid-Kinder erhalten `min-width: 0`, sodass Titel, Status, Rad und Bühne nicht horizontal abgeschnitten werden.

## Visuelle Anpassungen

- Das Löwensegment erhält einen klar roten Hintergrund.
- Das Jackpotsegment erhält einen klar goldenen Hintergrund.
- Bestehende Bilder, Typografie, Rot-/Gold-/Schwarz-Palette, Radgeometrie und Premium-Casino-Atmosphäre bleiben erhalten.
- Der Tonschalter zeigt bei stummem Zustand `Ton einschalten` und bei aktivem Ton `Ton ausschalten`.

## Komponenten und Datenfluss

Die Änderungen bleiben auf `WheelGame.jsx` und die zugehörigen Wheel-CSS-Regeln begrenzt.

1. Die Segmentdefinition liefert `id`, `label`, `prize`, `src` und `tone`.
2. Ein Dreh wählt genau ein Segment und animiert das Rad zu diesem Segment.
3. Nach Ende der Animation wird aus demselben Segment das Overlay erzeugt.
4. Beim Bestätigen wird das Segment an die Ergebnis-Historie angehängt.
5. Nach drei Ergebnissen bleibt das Rad gesperrt.

Slotgame-Helfer wie `gameMath.js`, Einsatzskalierung, Risikoauswahl und Guthaben bleiben unberührt.

## Tests und Abnahme

Automatisierte Tests sichern mindestens:

- die acht festen Wheel-Preiszuordnungen,
- Schaf als `Niete`,
- ein Ergebnis pro bestätigtem Dreh,
- maximal drei Ergebnisse und keinen neuen Rundenstart,
- Overlay-Daten aus demselben Segment wie das sichtbare Radergebnis,
- die korrekten Texte des Tonschalters.

Die visuelle Abnahme erfolgt bei Desktop- und Mobilbreite. Geprüft werden insbesondere Rad/Button-Ausrichtung, Nähe der Jackpot-Bühne, Statusbreite, Ergebnis-Historie, Segmentfarben und horizontales Overflow.
