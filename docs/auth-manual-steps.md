# Auth features — manual steps

Handmatige acties nodig na het mergen van: self-service wachtwoord-vergeten, e-mailverificatie bij registratie, rate limiting, en AVG-consent (TODO.MD "Prio 3 — Auth").

## 1. Migraties uitvoeren op productie-DB

Drie nieuwe migraties toegevoegd:
- `20260708130000_add_email_verification`
- `20260708130100_add_avg_consent`
- `20260708130200_add_rate_limit_attempts`

Draai éénmalig tegen de echte (Supabase) database, zoals ook bij eerdere migraties:

```bash
DATABASE_URL="<prod-url>" DIRECT_URL="<prod-direct-url>" \
  pnpm --filter @korfbaltools/db exec prisma migrate deploy
```

**Geen verdere data-actie nodig.** De e-mailverificatie-migratie backfilt automatisch `emailVerifiedAt` voor alle bestaande gebruikers (inclusief admins), zodat niemand wordt buitengesloten van inloggen. Alleen nieuwe `/register`-accounts starten ongeverifieerd.

## 2. Geen nieuwe env vars

Alle nieuwe flows hergebruiken bestaande configuratie:
- `NEXT_PUBLIC_APP_URL` voor het bouwen van verificatie-/reset-links
- Bestaande Resend-setup (`RESEND_API_KEY`, verified sender `no-reply@mail.korfbaltools.nl`)

Niets toe te voegen in Vercel dashboard of `.env`.

## 3. Geen nieuwe externe diensten

Rate limiting is Postgres-backed (nieuwe `RateLimitAttempt`-tabel), geen Upstash/Redis-account nodig.

## 4. Wat te controleren na deploy

- Registreer een testaccount → controleer dat de verificatiemail aankomt en de link werkt.
- Probeer in te loggen vóór verificatie → moet geweigerd worden met een "verificatie-e-mail opnieuw versturen"-optie.
- Test "wachtwoord vergeten" op zowel een bestaand als niet-bestaand e-mailadres → identieke reactie (geen enumeratie).
- Bestaande gebruikers (voor deze release) moeten gewoon kunnen inloggen zonder verificatiestap.
