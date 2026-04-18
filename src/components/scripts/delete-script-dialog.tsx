"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteScriptDialogProps = {
  scriptId: string;
  scriptTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteScriptDialog({
  scriptId,
  scriptTitle,
  open,
  onOpenChange,
}: DeleteScriptDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/scripts/${scriptId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          onOpenChange(false);
          router.refresh();
        }
      } catch {
        // Error handling could be improved
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <AlertDialogTitle className="text-lg">
            Skript loeschen?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{scriptTitle}</span>{" "}
            wird dauerhaft entfernt. Diese Aktion kann nicht rueckgaengig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isPending}>
            Abbrechen
          </AlertDialogCancel>
          <Button
            disabled={isPending}
            onClick={handleDelete}
            variant="destructive"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loeschen...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Loeschen
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
