import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3(
  {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
  {
    timestampFormat: "unixepoch-ms",
  },
);

const prisma = new PrismaClient({ adapter });

async function main() {
  const scriptId = "seed-sales-qualification";
  const startStepId = "seed-step-opening";

  await prisma.script.deleteMany();

  await prisma.script.create({
    data: {
      id: scriptId,
      title: "Qualifizierungs-Call",
      startStepId,
      steps: {
        create: [
          {
            id: startStepId,
            name: "Einstieg",
            content:
              "Hallo {{Name}}, hier ist {{Dein Name}} von {{Firma}}. Hast du gerade zwei Minuten fuer einen kurzen Abgleich?",
            position: 0,
            options: {
              create: [
                {
                  id: "seed-option-opening-yes",
                  label: "Ja, kurz Zeit",
                  targetStepId: "seed-step-problem",
                  position: 0,
                },
                {
                  id: "seed-option-opening-no",
                  label: "Gerade unpassend",
                  targetStepId: "seed-step-reschedule",
                  position: 1,
                },
              ],
            },
          },
          {
            id: "seed-step-problem",
            name: "Bedarf pruefen",
            content:
              "Viele Teams verlieren Leads, weil Follow-ups uneinheitlich laufen. Wie loest ihr das heute?",
            position: 1,
            options: {
              create: [
                {
                  id: "seed-option-problem-manual",
                  label: "Noch viel manuell",
                  targetStepId: "seed-step-demo",
                  position: 0,
                },
                {
                  id: "seed-option-problem-solved",
                  label: "Ist schon gut geloest",
                  targetStepId: "seed-step-close",
                  position: 1,
                },
              ],
            },
          },
          {
            id: "seed-step-demo",
            name: "Naechster Schritt",
            content:
              "Das klingt nach einem guten Anlass fuer eine kurze Demo. Sollen wir dafuer direkt einen Termin finden?",
            note: "Hier kannst du auf Terminbuchung oder Rueckruf verzweigen.",
            position: 2,
            options: {
              create: [
                {
                  id: "seed-option-demo-book",
                  label: "Termin vereinbaren",
                  targetStepId: "seed-step-end-booked",
                  position: 0,
                },
                {
                  id: "seed-option-demo-later",
                  label: "Spaeter nachfassen",
                  targetStepId: "seed-step-reschedule",
                  position: 1,
                },
              ],
            },
          },
          {
            id: "seed-step-reschedule",
            name: "Rueckruf",
            content:
              "Kein Problem. Wann passt es dir besser fuer einen kurzen Rueckruf?",
            position: 3,
          },
          {
            id: "seed-step-close",
            name: "Freundlicher Abschluss",
            content:
              "Verstanden, danke fuer die offene Rueckmeldung. Ich lasse dir trotzdem gern etwas Material da und melde mich nur bei echtem Mehrwert wieder.",
            position: 4,
          },
          {
            id: "seed-step-end-booked",
            name: "Termin fixiert",
            content:
              "Perfekt, ich bestaetige dir den Termin direkt im Anschluss per Mail.",
            position: 5,
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
