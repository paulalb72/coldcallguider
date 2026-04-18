"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  MessageSquare,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function ScriptRunner({ script }: ScriptRunnerProps) {
  const [currentStepId, setCurrentStepId] = useState<string | null>(
    script.startStepId
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const stepMap = Object.fromEntries(
    script.steps.map((step) => [step.id, step] as const)
  );
  const currentStep = currentStepId ? stepMap[currentStepId] : undefined;
  const isEndpoint = currentStep && currentStep.options.length === 0;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectOption = useCallback(
    (option: RunOption) => {
      if (!currentStep) return;
      const targetStep = stepMap[option.targetStepId];
      if (!targetStep) return;

      setHistory((prev) => [
        ...prev,
        {
          stepId: currentStep.id,
          stepName: currentStep.name,
          optionLabel: option.label,
          targetStepId: option.targetStepId,
        },
      ]);
      setCurrentStepId(targetStep.id);
    },
    [currentStep, stepMap]
  );

  const goBack = useCallback(() => {
    setHistory((prev) => {
      const lastEntry = prev[prev.length - 1];
      if (!lastEntry) return prev;
      setCurrentStepId(lastEntry.stepId);
      return prev.slice(0, -1);
    });
  }, []);

  const restart = useCallback(() => {
    setHistory([]);
    setCurrentStepId(script.startStepId);
    setElapsedTime(0);
  }, [script.startStepId]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        target?.isContentEditable
      )
        return;

      // Arrow left = go back
      if (event.key === "ArrowLeft" && history.length > 0) {
        event.preventDefault();
        goBack();
        return;
      }

      // Number keys for options
      if (!currentStep?.options.length) return;
      const pressedNumber = Number.parseInt(event.key, 10);
      if (
        Number.isNaN(pressedNumber) ||
        pressedNumber < 1 ||
        pressedNumber > currentStep.options.length
      )
        return;

      event.preventDefault();
      const option = currentStep.options[pressedNumber - 1];
      if (option) selectOption(option);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentStep, history.length, goBack, selectOption]);

  if (!currentStep || !script.startStepId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Kein Startschritt definiert
          </h2>
          <p className="text-sm text-muted-foreground">
            Dieses Skript hat keinen gueltigen Startschritt. Bitte bearbeite das
            Skript und lege einen Startpunkt fest.
          </p>
          <Button asChild>
            <Link href={`/scripts/${script.id}/edit`}>Skript bearbeiten</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top Bar */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/scripts">
              <X className="h-4 w-4" />
              Beenden
            </Link>
          </Button>
          <span className="text-sm font-medium text-foreground">
            {script.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm font-mono text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(elapsedTime)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className={cn(showHistory && "bg-secondary")}
          >
            <MessageSquare className="h-4 w-4" />
            Verlauf ({history.length})
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/scripts/${script.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-8">
          <div className="w-full max-w-2xl space-y-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2">
              {currentStep.speaker && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {currentStep.speaker}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {currentStep.name}
              </span>
            </div>

            {/* Main Script Text */}
            <div className="text-center">
              <p className="text-2xl leading-relaxed text-foreground font-medium text-balance">
                {currentStep.content}
              </p>
            </div>

            {/* Note */}
            {currentStep.note && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Notiz:</span>{" "}
                {currentStep.note}
              </div>
            )}

            {/* Options or End State */}
            {isEndpoint ? (
              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-foreground">
                    Gespraech beendet
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Dieser Pfad endet hier. Du kannst zurueckgehen oder neu
                    starten.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 pt-4">
                {currentStep.options.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => selectOption(option)}
                    className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {index + 1}
                    </span>
                    <span className="flex-1 font-medium text-foreground">
                      {option.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* History Sidebar */}
        {showHistory && (
          <aside className="w-80 shrink-0 border-l border-border bg-card overflow-y-auto">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground">Call-Verlauf</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {history.length} Schritte durchlaufen
              </p>
            </div>
            <div className="p-4 space-y-2">
              {history.length > 0 ? (
                history.map((entry, index) => (
                  <div
                    key={`${entry.stepId}-${index}`}
                    className="rounded-lg border border-border bg-secondary/30 p-3"
                  >
                    <div className="text-xs text-muted-foreground">
                      Schritt {index + 1}
                    </div>
                    <div className="text-sm font-medium text-foreground mt-1">
                      {entry.stepName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Antwort: {entry.optionLabel}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Noch keine Schritte durchlaufen
                </p>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Bar */}
      <footer className="flex h-16 items-center justify-between border-t border-border bg-card px-4">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={history.length === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Zurueck
        </Button>

        <div className="text-xs text-muted-foreground">
          Tastatur: 1-9 fuer Optionen, Pfeil links fuer zurueck
        </div>

        <Button variant="ghost" onClick={restart}>
          <RotateCcw className="h-4 w-4" />
          Neustart
        </Button>
      </footer>
    </div>
  );
}
