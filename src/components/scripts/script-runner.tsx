"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CircleCheckBig, RefreshCcw, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type RunOption = {
  id: string;
  label: string;
  targetStepId: string;
};

type RunStep = {
  id: string;
  name: string;
  content: string;
  speaker: string | null;
  note: string | null;
  options: RunOption[];
};

export type RunnableScript = {
  id: string;
  title: string;
  description: string | null;
  startStepId: string | null;
  steps: RunStep[];
};

type HistoryEntry = {
  stepId: string;
  stepName: string;
  optionLabel: string;
  targetStepId: string;
};

type ScriptRunnerProps = {
  script: RunnableScript;
};

export function ScriptRunner({ script }: ScriptRunnerProps) {
  const [currentStepId, setCurrentStepId] = useState<string | null>(
    script.startStepId,
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const stepMap = Object.fromEntries(
    script.steps.map((step) => [step.id, step] as const),
  );
  const currentStep = currentStepId ? stepMap[currentStepId] : undefined;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;

      if (tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (!currentStep?.options.length) {
        return;
      }

      const pressedNumber = Number.parseInt(event.key, 10);

      if (
        Number.isNaN(pressedNumber) ||
        pressedNumber < 1 ||
        pressedNumber > currentStep.options.length
      ) {
        return;
      }

      event.preventDefault();

      const option = currentStep.options[pressedNumber - 1];

      if (!option) {
        return;
      }

      const targetStep = stepMap[option.targetStepId];

      if (!targetStep) {
        return;
      }

      setHistory((previousHistory) => [
        ...previousHistory,
        {
          stepId: currentStep.id,
          stepName: currentStep.name,
          optionLabel: option.label,
          targetStepId: option.targetStepId,
        },
      ]);
      setCurrentStepId(targetStep.id);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentStep, stepMap]);

  function selectOption(option: RunOption) {
    if (!currentStep) {
      return;
    }

    const targetStep = stepMap[option.targetStepId];

    if (!targetStep) {
      return;
    }

    setHistory((previousHistory) => [
      ...previousHistory,
      {
        stepId: currentStep.id,
        stepName: currentStep.name,
        optionLabel: option.label,
        targetStepId: option.targetStepId,
      },
    ]);
    setCurrentStepId(targetStep.id);
  }

  function goBack() {
    setHistory((previousHistory) => {
      const lastEntry = previousHistory[previousHistory.length - 1];

      if (!lastEntry) {
        return previousHistory;
      }

      setCurrentStepId(lastEntry.stepId);
      return previousHistory.slice(0, -1);
    });
  }

  function restart() {
    setHistory([]);
    setCurrentStepId(script.startStepId);
  }

  if (!currentStep || !script.startStepId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Run-Modus nicht verfuegbar</CardTitle>
          <CardDescription>
            Dieses Skript hat aktuell keinen gueltigen Startschritt. Bitte oeffne den Editor und pruefe die Verknuepfungen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/scripts/${script.id}/edit`}>Zum Editor</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Live-Run</Badge>
                  <Badge variant={currentStep.options.length > 0 ? "outline" : "success"}>
                    {currentStep.options.length > 0 ? "Aktiver Schritt" : "Endpunkt erreicht"}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-2xl">{currentStep.name}</CardTitle>
                  <CardDescription>
                    {script.description || "Arbeite dich Schritt fuer Schritt durch das Skript."}
                  </CardDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={history.length === 0}
                  onClick={goBack}
                  type="button"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Zurueck
                </Button>
                <Button onClick={restart} type="button" variant="outline">
                  <RefreshCcw className="h-4 w-4" />
                  Neustart
                </Button>
                <Button asChild variant="ghost">
                  <Link href={`/scripts/${script.id}/edit`}>Bearbeiten</Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep.speaker ? (
              <Badge className="w-fit" variant="secondary">
                {currentStep.speaker}
              </Badge>
            ) : null}

            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-6">
              <p className="text-[1.1rem] leading-8 text-foreground">{currentStep.content}</p>
            </div>

            {currentStep.note ? (
              <div className="rounded-2xl border border-primary/15 bg-primary/6 px-5 py-4 text-sm leading-7 text-muted-foreground">
                <div className="mb-1 font-semibold text-foreground">Kontext</div>
                {currentStep.note}
              </div>
            ) : null}

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Workflow className="h-4 w-4 text-primary" />
                    Antwortoptionen
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Du kannst auch die Zifferntasten 1 bis 9 verwenden, solange kein Eingabefeld fokussiert ist.
                  </p>
                </div>
                <Badge variant="outline">{currentStep.options.length} verfuegbar</Badge>
              </div>

              {currentStep.options.length > 0 ? (
                <div className="grid gap-3">
                  {currentStep.options.map((option, index) => (
                    <button
                      key={option.id}
                      className={cn(
                        "group flex w-full items-start gap-4 rounded-[1.3rem] border border-border bg-background/80 px-5 py-4 text-left transition-colors hover:border-primary/35 hover:bg-primary/6",
                      )}
                      onClick={() => selectOption(option)}
                      type="button"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">{option.label}</div>
                        <div className="text-sm text-muted-foreground">
                          Weiter zu {stepMap[option.targetStepId]?.name || "unbekanntem Schritt"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.3rem] border border-[color:var(--success)]/20 bg-[color:var(--success)]/10 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <CircleCheckBig className="mt-0.5 h-5 w-5 text-[color:var(--success)]" />
                    <div>
                      <div className="font-semibold text-foreground">Dieser Pfad endet hier.</div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Nutze bei Bedarf den Zurueck-Button fuer einen alternativen Verlauf oder starte das Skript komplett neu.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Verlauf</CardTitle>
            <CardDescription>
              Bisher gewaehlte Antworten im aktuellen Call.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[360px] pr-3">
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((entry, index) => (
                    <div
                      key={`${entry.stepId}-${entry.targetStepId}-${index}`}
                      className="rounded-2xl border border-border/80 bg-background/70 px-4 py-4"
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Schritt {index + 1}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-foreground">
                        {entry.stepName}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-muted-foreground">
                        Gewaehlt: {entry.optionLabel}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Weiter zu {stepMap[entry.targetStepId]?.name || "unbekannt"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/25 px-4 py-5 text-sm leading-6 text-muted-foreground">
                  Noch keine Auswahl getroffen. Der Verlauf baut sich waehrend des Calls automatisch auf.
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
