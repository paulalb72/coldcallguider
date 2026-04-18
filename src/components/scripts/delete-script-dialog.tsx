"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteScriptDialogProps = {
  scriptId: string;
  scriptTitle: string;
};

export function DeleteScriptDialog({
  scriptId,
  scriptTitle,
}: DeleteScriptDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      setError(null);

      try {
        const response = await fetch(`/api/scripts/${scriptId}`, {
          method: "DELETE",
        });

        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!response.ok) {
          setError(payload?.error ?? "Das Skript konnte nicht geloescht werden.");
          return;
        }

        setOpen(false);
        router.refresh();
      } catch {
        setError("Das Skript konnte nicht geloescht werden.");
      }
    });
  }

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Trash2 className="h-4 w-4" />
          Loeschen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Skript wirklich loeschen?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{scriptTitle}</span> wird dauerhaft entfernt. Dieser Schritt kann nicht rueckgaengig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Abbrechen</AlertDialogCancel>
          <Button disabled={isPending} onClick={handleDelete} variant="destructive">
            {isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loeschen...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Endgueltig loeschen
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
