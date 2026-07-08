# Scoreformulier — Plan van aanpak

Onderdeel van de `korfbaltools` monorepo. Live scoreverloop bijhouden tijdens een wedstrijd, inclusief schotpercentages per speler.

## 1. Doel

Een wisselspeler of assistent-trainer kan tijdens de wedstrijd, zonder internetverbinding, per schotpoging vastleggen wie schoot, wanneer, welk type schot het was en of het raak was. Tegendoelpunten worden apart gelogd. Na de wedstrijd wordt de data gesynchroniseerd en meegenomen in seizoensstatistieken (topscorers, schotpercentages).

## 2. Kernconcept

Een "doelpunt" is geen apart event — het is een **schotpoging** met een resultaat. Score en schotpercentage worden hieruit afgeleid, niet los ingevoerd.

## 3. Functionele requirements

### Gebruiker & context
- Eén invoerder (wisselspeler/assistent-trainer) langs de kant
- Volledig offline bruikbaar tijdens de wedstrijd
- Mobiel/tablet-vriendelijk, snel te bedienen tussen wedstrijdmomenten door

### Wedstrijdstructuur
- 2 helften van 30 minuten
- Wedstrijd heeft een start- en eindtijdstip; tijdstip per actie wordt hieraan gerelateerd (of relatief, "minuut X in helft Y")

### Schotpoging — eigen team (kernevent)
Vastgelegd per poging:
- Schutter (naam, vrij invoerveld — koppeling met teamindeling volgt later)
- Tijdstip (helft + minuut, of wedstrijdklok)
- Scoretype: `afstand` | `doorloop` | `strafworp`
- Resultaat: `raak` | `mis`

Hieruit afgeleid (niet los opgeslagen, wel berekend):
- Score van het eigen team = aantal `raak`
- Schotpercentage per speler
- Schotpercentage per speler per scoretype

### Tegendoelpunt
Alleen gelogd wanneer de tegenstander daadwerkelijk scoort (geen missers van tegenstander):
- Verdediger die gepasseerd werd (naam, vrij invoerveld)
- Tijdstip (helft + minuut)
- Geen scoretype of tegenstandernaam nodig

### Correcties
- Elke eerder ingevoerde schotpoging of tegendoelpunt moet achteraf aan te passen of te verwijderen zijn (niet alleen "laatste actie ongedaan maken")

### Opslag & sync
- Lokale opslag tijdens de wedstrijd: IndexedDB
- Geen automatische sync vereist — handmatige sync-actie na de wedstrijd wanneer er weer verbinding is
- Na sync: data blijft bewaard voor seizoensoverzichten (topscorers, schotpercentages over meerdere wedstrijden)

### Niet in scope (nu)
- Koppeling met `teamindeling.dezwaluwen.nl` voor spelerslijsten (later toevoegen — nu vrij invoerveld voor namen)
- Aanval/verdediging-vak-rotatie bijhouden
- Schotpercentage van de tegenstander

## 4. Datamodel (concept)

```
Wedstrijd
- id
- datum
- tegenstander (vrije tekst, optioneel)
- status: gepland | bezig | afgerond
- gesynchroniseerd: boolean

SchotPoging
- id
- wedstrijdId
- schutterNaam
- helft: 1 | 2
- tijdstipMinuut
- scoreType: afstand | doorloop | strafworp
- resultaat: raak | mis
- aangemaaktOp / gewijzigdOp

TegenDoelpunt
- id
- wedstrijdId
- verdedigerNaam
- helft: 1 | 2
- tijdstipMinuut
- aangemaaktOp / gewijzigdOp
```

**Afgeleide data (berekend, niet opgeslagen):**
- Eindstand = COUNT(SchotPoging waar resultaat=raak) — COUNT(TegenDoelpunt)
- Schotpercentage per speler = raak / totaal pogingen
- Schotpercentage per speler per scoretype

## 5. Scherm-flow (concept)

1. **Wedstrijd starten**: datum, eventueel tegenstandernaam, start helft 1
2. **Live invoerscherm** (hoofdscherm tijdens de wedstrijd):
   - Grote knop "Schotpoging" → schutter kiezen/invoeren → scoretype kiezen → raak/mis
   - Grote knop "Tegendoelpunt" → verdediger kiezen/invoeren
   - Lopende stand zichtbaar (eigen team vs tegenstander)
   - Helftwissel-knop
3. **Overzicht/log**: chronologische lijst van alle acties in de wedstrijd, met bewerk/verwijder-optie per regel
4. **Wedstrijd afronden**: eindstand bevestigen, status naar "afgerond"
5. **Sync**: handmatige actie om lokale data naar server te sturen zodra er verbinding is
6. **Seizoensstatistieken** (apart scherm/module): topscorers, schotpercentages, historie per speler

## 6. Techniek (voorstel, aan te scherpen)

- Next.js app binnen de `korfbaltools` monorepo (consistent met bestaande stack)
- IndexedDB via een lichte wrapper (bijv. `idb`) voor offline opslag
- Sync-endpoint naar bestaande backend/database zodra online
- PWA-achtige opzet aan te raden i.v.m. offline-first gebruik in de sporthal

## 7. Open vragen voor latere uitwerking

- Welke backend/database wordt gebruikt voor de gesynchroniseerde seizoensdata?
- Hoe wordt een conflict opgelost als dezelfde wedstrijd per ongeluk vanaf twee toestellen wordt ingevoerd?
- Wanneer wordt de koppeling met teamindeling.dezwaluwen.nl gebouwd, en hoe ziet die integratie eruit (speler-ID's delen)?
- Moet er een rol/login-systeem komen, of blijft dit één gedeeld toestel per wedstrijd?

## 8. Volgende stappen

- [ ] Datamodel definitief maken en vertalen naar IndexedDB-schema
- [ ] Scherm-flow uitwerken tot wireframes
- [ ] Sync-strategie en backend-endpoint ontwerpen
- [ ] MVP bouwen: wedstrijd starten → schotpoging/tegendoelpunt loggen → lokaal overzicht
- [ ] Sync + seizoensstatistieken toevoegen
- [ ] Koppeling teamindeling.dezwaluwen.nl (fase 2)
