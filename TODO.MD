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
[X] Gebruikers instellingen
[X] Adminpaneel
[X] Favicon

## Prio 3 — Auth
[X] Wachtwoord-vergeten flow (zelfbediening, zonder admin)
[X] E-mailverificatie bij registratie
[X] Rate limiting op login/register/reset-password
[X] AVG-consent checkbox bij registratie
[] Resend werkend maken

## Prio 3 — Admin
[X] Gebruiker aanmaken/uitnodigen vanuit adminpaneel
[X] Club-CRUD UI in admin
[] Audit-log paginatie/filter (nu hard limit 100)
[] Engels label "Under construction" vertalen naar NL (maintenance-mode-toggle.tsx)

## Prio 3 — Product
[] Teamindeling server-opslag (nu alleen localStorage, geen multi-device/delen)
[] Speelgerechtigheid app maken
[] Scoreformulier app maken
[] Toernooi app maken

## Prio 3 — Kwaliteit
[] A11y form-fixes: aria-invalid/aria-describedby/role=alert op login/register/reset/admin-forms
[] Sticky footer component met versie