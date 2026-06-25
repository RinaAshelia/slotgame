# UX-Audit: Glücksrad

Datum: 25. Juni 2026  
Geprüfte Ansichten: Desktop und Mobile  
Geprüfter Ablauf: Einstieg, Drehung, Ergebnisdialog, Ergebnisverlauf, Abschluss nach drei Drehungen

## Kurzfazit

Das Glücksrad ist visuell eigenständig, der primäre Ablauf ist leicht verständlich und die Begrenzung auf drei Drehungen wird zuverlässig kommuniziert. Die größte UX-Lücke liegt vor der ersten Drehung: Das Rad zeigt acht Namen, aber nur Jackpot und Schaf erklären ihren Wert. Die übrigen sechs Gewinne werden erst nach einem Treffer sichtbar.

Eine Preistafel ist daher sinnvoll. Sie sollte jedoch nicht als zweite große Bühne mit dem Rad konkurrieren. Empfohlen wird eine kompakte, gut scannbare Gewinnübersicht mit allen acht Kombinationen aus Motiv, Name und Preis.

## Schritte und Zustand

1. **Desktop-Startzustand — gut mit Informationslücke**
   - Der große goldene Drehbutton ist eindeutig die Hauptaktion.
   - Status, drei Chancen, Jackpot und Schaf-Niete sind sofort verständlich.
   - Die Namen auf dem Rad erklären nicht, was Turri, Ashelia, Eden, Poly und Alucard gewinnen.
   - Screenshot: `01-desktop-start.png`

2. **Ergebnisdialog — gut**
   - Motiv, Charaktername und konkreter Preis bilden eine klare Hierarchie.
   - Die Bestätigung ist eindeutig und verhindert, dass ein Ergebnis übersehen wird.
   - Die Meldung „Dieses Ergebnis wird für deine heutige Runde festgehalten“ schafft Vertrauen.
   - Screenshot: `02-ergebnis-overlay.png`

3. **Abschluss nach drei Drehungen — gut**
   - Die Runde wird klar beendet und bietet richtigerweise keine neue Runde an.
   - Alle Ergebnisse bleiben direkt unter dem deaktivierten Drehbutton sichtbar.
   - Der Verlauf ist funktional, wirkt gegenüber Rad und Jackpot-Bühne aber visuell zurückhaltend.
   - Screenshot: `03-desktop-abgeschlossen.png`

4. **Mobile Startansicht — brauchbar, aber lang**
   - Navigation, Regeln, Rad und Drehbutton brechen sauber um.
   - Das Rad bleibt lesbar und überschreitet die Bildschirmbreite nicht.
   - Die Jackpot-Bühne erzeugt nach dem Ergebnisbereich einen sehr langen Scrollweg.
   - Eine dauerhaft vollständig aufgeklappte Preistafel würde diesen Scrollweg unnötig verlängern.
   - Screenshot: `04-mobile-start.png`

5. **Mobiler Ergebnisdialog — gut**
   - Der Dialog passt vollständig in den Viewport.
   - Preis und Bestätigungsaktion sind auch auf kleiner Breite klar.
   - Der Fokus wird auf „Bestätigen“ gesetzt und bleibt im Dialog.
   - Screenshot: `05-mobile-ergebnis-overlay.png`

## Stärken

- Die Casino-Ästhetik ist konsistent und hochwertig.
- Das Rad ist der klare visuelle Mittelpunkt.
- Der Ablauf „drehen → Ergebnis prüfen → bestätigen“ ist verständlich.
- Die verbleibenden Drehungen stehen direkt in der Hauptaktion.
- Ergebnisdialog und Verlauf zeigen Motiv, Namen und exakten Preis.
- Der Zustand nach dem dritten Ergebnis ist eindeutig abgeschlossen.

## UX-Risiken

### 1. Preise sind vor dem Spiel nicht transparent

„8 feste Preise“ verspricht eine feste Zuordnung, zeigt sie aber nicht. Spieler können den möglichen Wert der Segmente nicht einschätzen und müssen Namen wie „Poly“ oder „Eden“ auswendig kennen oder zufällig treffen.

Das ist die wichtigste strukturelle Lücke und spricht klar für eine Preistafel.

### 2. Die Jackpot-Bühne erhält mehr Fläche als die vollständige Gewinnlogik

Desktop zeigt den Jackpot prominent und doppelt, während sechs reguläre Preise verborgen bleiben. Das erzeugt eine unausgewogene Informationshierarchie: Der seltenste Preis ist sehr gut erklärt, der Großteil des Gewinnsystems gar nicht.

### 3. Mobile Seite ist bereits lang

Die Jackpot-Bühne liegt komplett unter Rad, Button und Verlauf. Eine große zusätzliche Tabelle unterhalb würde die Seite weiter strecken und wäre vor dem ersten Spin kaum sichtbar.

### 4. Singularfehler

Bei einer verbleibenden Drehung zeigt die Hauptaktion „1 Drehungen übrig“. Erwartet wird „1 Drehung übrig“.

### 5. Status-Hilfstext bleibt statisch

Nach Abschluss steht weiterhin „Kurz drehen, Ergebnis prüfen, dann weiter.“ Dieser Text passt nicht mehr zum geschlossenen Zustand. Eine Abschlussmeldung wie „Deine drei Ergebnisse stehen unten.“ wäre hilfreicher.

## Barrierefreiheitsrisiken

- Der Ergebnisdialog besitzt Rolle, Beschriftung, modalen Zustand und initialen Fokus. Das ist eine gute Grundlage.
- Das Rad selbst ist für Screenreader vollständig dekorativ. Die möglichen Segmente und Preise sind daher nicht als zusammengehörige Liste zugänglich. Eine semantische Preistafel würde diese Lücke schließen.
- Es ist keine Behandlung für `prefers-reduced-motion` sichtbar. Die etwa vier Sekunden lange Drehbewegung sollte bei reduzierter Bewegung verkürzt oder ersetzt werden.
- Sichtbare Kontraste wirken überwiegend ausreichend, wurden aber nicht messtechnisch gegen WCAG-Grenzwerte geprüft.
- Screenshots und DOM-Prüfung ersetzen keine vollständige Prüfung mit Screenreader, Zoom und mehreren Browsern.

## Empfehlung: kompakte Gewinnübersicht ergänzen

### Desktop

- Als kompakte Karte rechts oder unmittelbar unter dem Statusbereich.
- Acht Einträge in zwei Gruppen:
  - **GIL:** Jackpot, Löwe, Poly
  - **Items & Versorgung:** Turri, Alucard, Eden, Ashelia, Schaf
- Jeder Eintrag zeigt kleines Motiv, Charaktername und exakten Preis.
- Jackpot darf hervorgehoben sein, sollte die übrigen Preise aber nicht verdrängen.
- Der zuletzt getroffene Eintrag kann nach einer Drehung gold markiert werden.

### Mobile

- Direkt unter den Kurzregeln und vor dem Rad als aufklappbarer Bereich „Alle Preise ansehen“.
- Standardmäßig geschlossen, aber mit kurzer Zusammenfassung „8 feste Preise · Jackpot 1.250.000 GIL · Schaf Niete“.
- Nach dem Öffnen eine einspaltige Liste mit ausreichend großen Zeilen; keine breite Tabelle.

### Empfohlene Reihenfolge

1. Jackpot — 1.250.000 GIL
2. Löwe — 333.000 GIL
3. Poly — 100.000 GIL
4. Turri — Glam-Item
5. Alucard — Chocobo-Sattel (Auswahl 100er Trials)
6. Eden — 33 Flasks nach Wahl
7. Ashelia — 50 Bufffood
8. Schaf — Niete

## Prioritäten

1. **Hoch:** Alle acht festen Gewinne vor der ersten Drehung sichtbar oder unmittelbar auffindbar machen.
2. **Mittel:** Mobile Preistafel einklappbar gestalten und die bestehende Seitenlänge nicht weiter erhöhen.
3. **Mittel:** „1 Drehung übrig“ korrigieren.
4. **Niedrig:** Hilfstext an den abgeschlossenen Zustand anpassen.
5. **Niedrig:** Reduzierte Bewegung unterstützen.

## Evidenzgrenzen

Geprüft wurden sichtbare Zustände, DOM-Struktur, Tastaturfokus im Ergebnisdialog und responsive Darstellung. Nicht vollständig geprüft wurden Screenreader-Ausgabe, exakte Kontrastwerte, Browserunterschiede, Touch-Zielmessung und Verhalten bei 200–400 Prozent Zoom.
