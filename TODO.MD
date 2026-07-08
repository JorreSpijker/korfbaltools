# Todo's

## Prio 1
[X] Algemene footer
[X] Homepage designen en typen
[X] impeccable design.md laten maken
[X] Apps als menu toevoegen.
[X] Google Analytics & Cookie meldin toevoegen
[] PWA
  [] manifest.json per app (name, icons, theme_color, display: standalone)
  [] Service worker (offline caching, precache shell)
  [] App-icons (192/512, maskable) + apple-touch-icon
  [] Install-prompt UX (beforeinstallprompt afhandelen)
  [] Lighthouse PWA-audit draaien

## Prio 2
[X] Gebruikers instellingen
[X] Adminpaneel
[X] Favicon

## Prio 3 — Auth
[] Wachtwoord-vergeten flow (zelfbediening, zonder admin)
[] E-mailverificatie bij registratie
[] Rate limiting op login/register/reset-password
[] AVG-consent checkbox bij registratie

## Prio 3 — Admin
[X] Gebruiker aanmaken/uitnodigen vanuit adminpaneel
[X] Club-CRUD UI in admin
[] Audit-log paginatie/filter (nu hard limit 100)
[] Engels label "Under construction" vertalen naar NL (maintenance-mode-toggle.tsx)

## Prio 3 — Product
[] Teamplanner server-opslag (nu alleen localStorage, geen multi-device/delen)
[] Speelgerechtigheid app maken
[] Scoreformulier app maken
[] Toernooi app maken

## Prio 3 — Kwaliteit
[] A11y form-fixes: aria-invalid/aria-describedby/role=alert op login/register/reset/admin-forms
[] Sticky footer component met versie