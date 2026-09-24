# Oefeningen toevoegen

Elke oefening is één markdown-bestand in deze map. De bestandsnaam is de slug in de URL:
`doorloopbal-na-vrijlopen.md` wordt `/trainingen/oefening/doorloopbal-na-vrijlopen`.

Na het toevoegen van een bestand is een commit + deploy nodig; de oefeningen worden bij de build
ingelezen. Klopt er iets niet aan de frontmatter of ontbreekt `## Basis`, dan faalt de build met de
bestandsnaam in de foutmelding — dat is expres, zodat er nooit stilletjes een oefening verdwijnt.

## Format

```markdown
---
titel: "Doorloopbal na vrijlopen"
samenvatting: "Eén zin die op de kaart in het overzicht staat."
leeftijden: ["8-12", "13-18"]
focus: ["aanvallen", "schottechniek"]
duur: 15
spelers: "6-14"
spelersPerPaal: "4-7"
materiaal: ["korfbalpaal", "2 ballen", "pionnen"]
afbeelding: "/images/doorloopbal.png"
---

De opzet van de oefening: wat staat waar, wie begint. Deze tekst staat altijd in beeld,
bij elke variant.

## Simpel

De makkelijkste uitvoering.

## Basis

De standaarduitvoering.

## Uitgebreid

De zwaarste uitvoering.
```

## Velden

| Veld | Verplicht | Toelichting |
|---|---|---|
| `titel` | ja | Naam van de oefening |
| `samenvatting` | ja | Eén zin, staat op de kaart in het overzicht |
| `leeftijden` | ja | Eén of meer van `4-7`, `8-12`, `13-18` |
| `focus` | ja | Eén of meer van `aanvallen`, `verdedigen`, `gooien-vangen`, `schottechniek`, `rebounden`, `spelsituaties` |
| `duur` | ja | Heel getal in minuten; startwaarde in de trainingsbouwer |
| `spelers` | ja | Vrije tekst, bijvoorbeeld `"8-16"` |
| `spelersPerPaal` | nee | Vrije tekst, bijvoorbeeld `"2-4"`. Laat weg bij oefeningen zonder paal |
| `materiaal` | nee | Lijst; laat weg of leeg als er niets nodig is |
| `afbeelding` | nee | Pad vanaf `public/`, dus `/images/<bestand>`. De basePath wordt automatisch toegevoegd |

## Varianten

De tekst onder de koppen `## Simpel`, `## Basis` en `## Uitgebreid` vormt de toggle op de
detailpagina.

- `## Basis` is **verplicht**.
- `## Simpel` en `## Uitgebreid` zijn optioneel; de toggle toont alleen wat bestaat.
- Alles boven de eerste variantkop is de gedeelde opzet en blijft altijd zichtbaar.
- Binnen een variant mag gewone markdown staan: lijstjes, `###`-subkopjes, vet.
- Schrijf de varianten als échte uitvoeringen van dezelfde oefening, niet als drie losse oefeningen.
