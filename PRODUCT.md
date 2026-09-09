# Product

## Register

product

## Users

Twee doelgroepen op dezelfde homepage, met een verschillende taak:
- **Terugkerende gebruikers** — club-vrijwilligers (coaches, secretarissen) die snel bij hun tool willen komen (zie apps/teamindeling). Voor hen is de homepage een gateway.
- **Nieuwe bezoekers** — coaches/secretarissen bij clubs die korfbaltools.nl nog niet kennen. Zij moeten begrijpen wat het platform is en waarom het nuttig is. Dit is de doelgroep voor de marketing-content op de homepage.

Er zijn geen accounts en geen rollen: elke bezoeker ziet en kan hetzelfde. Welke tools bestaan wordt per omgeving bepaald (`APP_<NAAM>_ENABLED`, zie apps/main/src/lib/apps.ts), niet per gebruiker.

## Product Purpose

Korfbaltools.nl is de centrale "voordeur" van het platform: vanaf hier komen gebruikers bij de losse tools (apps/*, zie docs/plan.md). Voor wie het platform al kent, geeft de homepage in één klik toegang tot de beschikbare apps. Voor wie het platform nog niet kent, legt de homepage uit wat het is, welke tools erbij horen en voor wie het bedoeld is. Succes betekent twee dingen: een terugkerende gebruiker is binnen een paar seconden bij de tool die hij nodig heeft; een nieuwe bezoeker snapt binnen één scroll wat het platform is.

**Status:** vroege fase, nog geen (grote) gebruikersbasis. Marketing-copy blijft eerlijk over wat er nu al werkt (Teamindeling) versus wat nog komt — geen verzonnen cijfers, testimonials of social proof.

## Brand Personality

Helder, betrouwbaar, efficiënt — zelfde persoonlijkheid als apps/teamindeling (zie apps/teamindeling/PRODUCT.md), bewust doorgetrokken zodat het platform en de tools die het host als één geheel aanvoelen. De marketing-content op de homepage overtuigt door duidelijkheid en concreetheid ("dit is wat het doet, dit is hoe het werkt"), niet door hype, superlatieven of overtuigingscopy. Zakelijk-vriendelijk: serieus genoeg voor bestuurszaken, niet kil of enterprise-grijs.

## Anti-references

Korfbal-scoreboard/sport-app clichés: felle sportkleuren, scoreboard-chrome, ad-achtige dichte layouts, uitroeptekens. Ook (gedeeld met teamindeling): trendy SaaS-minimalisme als excuus voor luiheid (Notion/Linear-look zonder eigen identiteit), enterprise IT-scaffolding (SharePoint-achtige grijze formulieren-op-formulieren), en generieke SaaS-landingspagina-clichés (hero-metric blokken, gefabriceerde testimonials/logo-rijen, "vertrouwd door X clubs"-claims zonder dat het waar is).

## Design Principles

1. **Twee taken, één pagina** — terugkerende gebruikers moeten direct door kunnen naar hun tool; nieuwe bezoekers moeten het platform kunnen begrijpen. De hero bedient de eerste groep, de secties erna de tweede — geen van beide mag de andere blokkeren.
2. **Eén visuele familie** — main en de tools erachter moeten voelen als hetzelfde platform, niet losse projecten die toevallig samen draaien. Marketing-secties gebruiken hetzelfde systeem (DESIGN.md), niet een los "landingspagina-thema".
3. **Onopvallende autoriteit** — betrouwbaar overkomen door rust, consistentie en concreetheid, niet door merk-decoratie of overtuigingscopy. Eerlijk over de vroege fase — geen social proof die er niet is.
4. **Nederlandse directheid** — copy is Nederlands, direct, zonder omhaal; ook in de marketing-secties: uitleg in concrete taal, geen marketing-jargon.
5. **Geen drempels** — geen account, geen rol, geen wachtrij: wie de site opent kan meteen bij elke tool die aan staat.

## Accessibility & Inclusion

WCAG 2.1 AA. Geen specifieke bekende gebruikersbehoeften. Formulieren binnen de tools moeten volledig met toetsenbord en screenreader te bedienen zijn; foutmeldingen nooit alleen via kleur.
