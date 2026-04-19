"use client";

import Link from "next/link";
import { Play, Pencil, Trash2, MoreHorizontal, GitBranch } from "lucide-react";
import { useState } from "react";

import { DeleteScriptDialog } from "@/components/scripts/delete-script-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/utils";

type ScriptCardProps = {
  script: {
    id: string;
    title: string;
    updatedAt: Date;
    _count: {
      steps: number;
    };
  };
};

export function ScriptCard({ script }: ScriptCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-border hover:bg-accent/50">
        {/* Header with menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">
              {script.title}
            </h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Optionen</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/scripts/${script.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Bearbeiten
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Loeschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta info */}
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5" />
            {script._count.steps} Schritte
          </span>
          <span className="text-border">|</span>
          <span>{formatDateTime(script.updatedAt)}</span>
        </div>

        {/* Action button */}
        <div className="mt-5">
          <Button asChild className="w-full" variant="secondary">
            <Link href={`/scripts/${script.id}/run`}>
              <Play className="h-4 w-4" />
              Call starten
            </Link>
          </Button>
        </div>
      </div>

      <DeleteScriptDialog
        scriptId={script.id}
        scriptTitle={script.title}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
