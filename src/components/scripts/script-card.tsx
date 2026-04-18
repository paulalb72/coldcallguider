import Link from "next/link";
import { PencilLine, Play, Rows3, Clock3 } from "lucide-react";

import { DeleteScriptDialog } from "@/components/scripts/delete-script-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

type ScriptCardProps = {
  script: {
    id: string;
    title: string;
    description: string | null;
    updatedAt: Date;
    _count: {
      steps: number;
    };
  };
};

export function ScriptCard({ script }: ScriptCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-xl">{script.title}</CardTitle>
            <CardDescription className="line-clamp-3 min-h-[4.5rem]">
              {script.description || "Keine Beschreibung hinterlegt."}
            </CardDescription>
          </div>
          <Badge variant="secondary">{script._count.steps} Schritte</Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1">
            <Rows3 className="h-3.5 w-3.5" />
            {script._count.steps} Knoten
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1">
            <Clock3 className="h-3.5 w-3.5" />
            Aktualisiert {formatDateTime(script.updatedAt)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
          Direkt fuer Live-Calls nutzbar. Start, Verlauf und Rueckspruenge laufen in der Run-Ansicht ohne Zusatznavigation.
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/scripts/${script.id}/run`}>
            <Play className="h-4 w-4" />
            Starten
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/scripts/${script.id}/edit`}>
            <PencilLine className="h-4 w-4" />
            Bearbeiten
          </Link>
        </Button>
        <DeleteScriptDialog scriptId={script.id} scriptTitle={script.title} />
      </CardFooter>
    </Card>
  );
}
