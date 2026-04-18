import Link from "next/link";
import { Plus } from "lucide-react";

import { ScriptCard } from "@/components/scripts/script-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listScripts } from "@/lib/script-repository";

export default async function ScriptsPage() {
  const scripts = await listScripts();

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Skriptverwaltung
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Sales-Skripte fuer gefuehrte Calls
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            Waehle ein bestehendes Skript fuer den Live-Einsatz oder erstelle neue Call-Pfade mit beliebig vielen Verzweigungen.
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/scripts/new">
            <Plus className="h-4 w-4" />
            Neues Skript
          </Link>
        </Button>
      </section>

      {scripts.length > 0 ? (
        <section className="grid gap-5 xl:grid-cols-3">
          {scripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </section>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Noch keine Skripte vorhanden</CardTitle>
            <CardDescription>
              Lege dein erstes Sales-Skript an, definiere den Startschritt und verknuepfe dann die moeglichen Antworten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/scripts/new">
                <Plus className="h-4 w-4" />
                Erstes Skript erstellen
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
