# Cold Call Guide

Gefuehrte Sales Calls mit verzweigenden Skripten auf Basis von Next.js, Prisma, SQLite und einer einfachen globalen Passwort-Abfrage.

## Setup

1. Abhaengigkeiten installieren:

```bash
npm install
```

2. Environment-Datei anlegen:

```bash
copy .env.example .env
```

3. Werte in `.env` anpassen, insbesondere `APP_PASSWORD` und `SESSION_SECRET`.

4. Datenbank und Prisma Client erzeugen:

```bash
npm run db:migrate -- --name init
```

5. Optional ein Beispielskript seeden:

```bash
npm run db:seed
```

6. Entwicklungsserver starten:

```bash
npm run dev
```

App-Routen:

- `/login`
- `/scripts`
- `/scripts/new`
- `/scripts/[id]/edit`
- `/scripts/[id]/run`
