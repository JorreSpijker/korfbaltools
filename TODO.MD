# Todo's

## Prio 1
[X] Algemene footer
[X] Homepage designen en typen
[X] impeccable design.md laten maken
[X] Apps als menu toevoegen.
[X] Google Analytics & Cookie meldin toevoegen
[X] PWA
  [X] manifest.json per app (name, icons, theme_color, display: standalone)
  [X] Service worker (offline caching, precache shell)
  [X] App-icons (192/512, maskable) + apple-touch-icon
  [X] Install-prompt UX (beforeinstallprompt afhandelen)
  [X] Lighthouse PWA-audit draaien

## Prio 2
[X] Favicon
[X] Login, accounts, rollen en adminpaneel verwijderd — apps staan nu aan/uit via `APP_<NAAM>_ENABLED`

## Prio 3 — Product
[] Teamindeling server-opslag (nu alleen localStorage, geen multi-device/delen)
[] Speelgerechtigheid app maken
[] Scoreformulier app maken
[] Toernooi app maken
[] Club-context voor vastspelen/mijn-club: nu één vaste `DEFAULT_CLUB_ID`, geen keuze in de UI

## Prio 3 — Kwaliteit
[] A11y form-fixes: aria-invalid/aria-describedby/role=alert op de formulieren binnen de tools
[] Sticky footer component met versie
[] Ongebruikte auth-tabellen (User, Session, AuditLog, AppConfig, PlatformSettings) uit het Prisma-schema halen
