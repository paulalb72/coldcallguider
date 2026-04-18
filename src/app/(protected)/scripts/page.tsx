import Link from "next/link";
import { Plus, FileText } from "lucide-react";

import { ScriptCard } from "@/components/scripts/script-card";
import { Button } from "@/components/ui/button";
import { listScripts } from "@/lib/script-repository";

export default async function ScriptsPage() {
  const scripts = await listScripts();

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Deine Skripte
          </h1>
          <p className="text-sm text-muted-foreground">
            Waehle ein Skript fuer den Live-Call oder erstelle ein neues.
          </p>
        </div>

        <Button asChild>
          <Link href="/scripts/new">
            <Plus className="h-4 w-4" />
            Neues Skript
          </Link>
        </Button>
      </div>

      {/* Scripts Grid */}
      {scripts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            Noch keine Skripte
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Erstelle dein erstes Skript mit Verzweigungen fuer gefuehrte Sales-Calls.
          </p>
          <Button asChild className="mt-6">
            <Link href="/scripts/new">
              <Plus className="h-4 w-4" />
              Erstes Skript erstellen
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
