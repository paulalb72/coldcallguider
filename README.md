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

## Coolify Deployment

Diese App ist jetzt fuer Coolify mit dem `Dockerfile` Build Pack vorbereitet.

### Empfohlene Coolify-Einstellungen

1. Repository verbinden und als `Build Pack` `Dockerfile` waehlen.
2. `Base Directory` auf `/` lassen.
3. Port `3000` verwenden.
4. In Coolify diese Environment-Variablen setzen:

```bash
APP_PASSWORD=dein-sicheres-passwort
SESSION_SECRET=ein-langes-zufaelliges-secret
DATABASE_URL=file:/app/data/dev.db
```

### Persistente SQLite-Datei

Fuer SQLite brauchst du in Coolify persistent storage, damit die Datenbank Deployments ueberlebt.

- Volume oder Bind Mount aktivieren
- Destination Path: `/app/data`

Coolify dokumentiert, dass der Basis-Pfad im Container `/app` ist und persistenter Storage dorthin gemountet werden soll:
- Dockerfile Build Pack: https://coolify.io/docs/applications/build-packs/dockerfile
- Persistent Storage: https://coolify.io/docs/knowledge-base/persistent-storage

### Health Check

Die App stellt einen Health-Endpunkt unter `/api/health` bereit. Im Dockerfile ist bereits ein Healthcheck definiert.

Coolify weist darauf hin, dass fehlerhafte Healthchecks sonst zu `404` oder `No available server` fuehren koennen:
- https://coolify.io/docs/knowledge-base/health-checks

### Wichtiger Hinweis zu SQLite

SQLite ist fuer einen einzelnen Container ein guter Start. Wenn du spaeter mehrere Instanzen, Rolling Deployments mit parallelen Writes oder groessere Last willst, solltest du auf PostgreSQL wechseln.
