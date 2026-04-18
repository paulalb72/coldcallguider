"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  GripVertical,
  Loader2,
  Plus,
  Play,
  Trash2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { ZodError } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { scriptPayloadSchema } from "@/lib/validations/script";

type EditorOption = {
  id: string;
  label: string;
  targetStepId: string;
};

type EditorStep = {
  id: string;
  name: string;
  content: string;
  speaker: string;
  note: string;
  options: EditorOption[];
};

export type EditableScript = {
  id?: string;
  title: string;
  description: string;
  startStepId: string;
  steps: EditorStep[];
};

type ScriptEditorProps = {
  initialScript: EditableScript;
  mode: "create" | "edit";
};

function createClientId(prefix: "step" | "option") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.round(Math.random() * 100000)}`;
}

function createEmptyStep(): EditorStep {
  return {
    id: createClientId("step"),
    name: "",
    content: "",
    speaker: "",
    note: "",
    options: [],
  };
}

function toPayload(script: EditableScript) {
  return {
    title: script.title,
    description: script.description,
    startStepId: script.startStepId,
    steps: script.steps.map((step, stepIndex) => ({
      id: step.id,
      name: step.name,
      content: step.content,
      speaker: step.speaker,
      note: step.note,
      position: stepIndex,
      options: step.options.map((option, optionIndex) => ({
        id: option.id,
        label: option.label,
        targetStepId: option.targetStepId,
        position: optionIndex,
      })),
    })),
  };
}

function formatClientError(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Bitte pruefe die Eingaben.";
  }
  return "Bitte pruefe die Eingaben.";
}

export function ScriptEditor({ initialScript, mode }: ScriptEditorProps) {
  const router = useRouter();
  const [script, setScript] = useState(initialScript);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(
    new Set(initialScript.steps[0]?.id ? [initialScript.steps[0].id] : [])
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();
  const [savedMessage, setSavedMessage] = useState(false);

  const stepNameMap = Object.fromEntries(
    script.steps.map((step, index) => [
      step.id,
      step.name.trim() || `Schritt ${index + 1}`,
    ])
  );

  function toggleStep(stepId: string) {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  function updateScript(updater: (previousScript: EditableScript) => EditableScript) {
    setScript((previousScript) => updater(previousScript));
  }

  function updateStep(stepId: string, updater: (step: EditorStep) => EditorStep) {
    updateScript((previousScript) => ({
      ...previousScript,
      steps: previousScript.steps.map((step) =>
        step.id === stepId ? updater(step) : step
      ),
    }));
  }

  function addStep() {
    const nextStep = createEmptyStep();
    updateScript((previousScript) => ({
      ...previousScript,
      startStepId: previousScript.startStepId || nextStep.id,
      steps: [...previousScript.steps, nextStep],
    }));
    setExpandedSteps((prev) => new Set([...prev, nextStep.id]));
  }

  function deleteStep(stepId: string) {
    updateScript((previousScript) => {
      const remainingSteps = previousScript.steps
        .filter((step) => step.id !== stepId)
        .map((step) => ({
          ...step,
          options: step.options.filter((option) => option.targetStepId !== stepId),
        }));

      const nextSteps = remainingSteps.length > 0 ? remainingSteps : [createEmptyStep()];
      const nextStartStepId =
        previousScript.startStepId === stepId
          ? nextSteps[0].id
          : previousScript.startStepId;

      return {
        ...previousScript,
        startStepId: nextStartStepId,
        steps: nextSteps,
      };
    });
  }

  function addOption(stepId: string) {
    const fallbackTarget = script.steps[0]?.id ?? stepId;
    updateStep(stepId, (step) => ({
      ...step,
      options: [
        ...step.options,
        {
          id: createClientId("option"),
          label: "",
          targetStepId: fallbackTarget,
        },
      ],
    }));
  }

  function deleteOption(stepId: string, optionId: string) {
    updateStep(stepId, (step) => ({
      ...step,
      options: step.options.filter((option) => option.id !== optionId),
    }));
  }

  function save(intent: "save" | "run") {
    startTransition(async () => {
      setError(null);
      setSavedMessage(false);

      try {
        const payload = scriptPayloadSchema.parse(toPayload(script));
        const response = await fetch(
          script.id ? `/api/scripts/${script.id}` : "/api/scripts",
          {
            method: script.id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const result = (await response.json().catch(() => null)) as
          | { id?: string; error?: string }
          | null;

        if (!response.ok || !result?.id) {
          setError(result?.error ?? "Das Skript konnte nicht gespeichert werden.");
          return;
        }

        if (intent === "run") {
          router.replace(`/scripts/${result.id}/run`);
        } else {
          if (!script.id) {
            router.replace(`/scripts/${result.id}/edit`);
          }
          setSavedMessage(true);
          setTimeout(() => setSavedMessage(false), 2000);
        }
        router.refresh();
      } catch (saveError) {
        setError(formatClientError(saveError));
      }
    });
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/scripts">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Zurueck</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {mode === "create" ? "Neues Skript" : "Skript bearbeiten"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {script.steps.length} Schritte
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedMessage && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <Check className="h-4 w-4" />
              Gespeichert
            </span>
          )}
          <Button onClick={() => save("save")} variant="outline" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Speichern
          </Button>
          <Button onClick={() => save("run")} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Starten
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Script Meta */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="script-title" className="text-sm font-medium">
            Skript-Name
          </Label>
          <Input
            id="script-title"
            value={script.title}
            onChange={(e) =>
              updateScript((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="z.B. Kaltakquise Erstgespraech"
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="script-description" className="text-sm font-medium">
            Beschreibung
          </Label>
          <Textarea
            id="script-description"
            value={script.description}
            onChange={(e) =>
              updateScript((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Wann und wofuer wird dieses Skript verwendet?"
            rows={2}
            className="bg-secondary border-border resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Startschritt</Label>
          <Select
            value={script.startStepId}
            onValueChange={(value) =>
              updateScript((prev) => ({ ...prev, startStepId: value }))
            }
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Startschritt waehlen" />
            </SelectTrigger>
            <SelectContent>
              {script.steps.map((step, index) => (
                <SelectItem key={step.id} value={step.id}>
                  {step.name.trim() || `Schritt ${index + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Schritte</h2>
          <Button onClick={addStep} variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Schritt hinzufuegen
          </Button>
        </div>

        <div className="space-y-2">
          {script.steps.map((step, stepIndex) => {
            const isExpanded = expandedSteps.has(step.id);
            const isStart = script.startStepId === step.id;

            return (
              <Collapsible
                key={step.id}
                open={isExpanded}
                onOpenChange={() => toggleStep(step.id)}
              >
                <div
                  className={cn(
                    "rounded-xl border bg-card transition-colors",
                    isExpanded ? "border-primary/40" : "border-border"
                  )}
                >
                  {/* Step Header */}
                  <CollapsibleTrigger className="flex w-full items-center gap-3 p-4 text-left">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {step.name.trim() || `Schritt ${stepIndex + 1}`}
                        </span>
                        {isStart && (
                          <Badge variant="secondary" className="text-xs">
                            Start
                          </Badge>
                        )}
                      </div>
                      {!isExpanded && step.content && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {step.content}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {step.options.length} Optionen
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </CollapsibleTrigger>

                  {/* Step Content */}
                  <CollapsibleContent>
                    <div className="border-t border-border p-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm">Name</Label>
                          <Input
                            value={step.name}
                            onChange={(e) =>
                              updateStep(step.id, (s) => ({
                                ...s,
                                name: e.target.value,
                              }))
                            }
                            placeholder="z.B. Begrueszung"
                            className="bg-secondary border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Sprecher</Label>
                          <Input
                            value={step.speaker}
                            onChange={(e) =>
                              updateStep(step.id, (s) => ({
                                ...s,
                                speaker: e.target.value,
                              }))
                            }
                            placeholder="Du, Kunde..."
                            className="bg-secondary border-border"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Skript-Text</Label>
                        <Textarea
                          value={step.content}
                          onChange={(e) =>
                            updateStep(step.id, (s) => ({
                              ...s,
                              content: e.target.value,
                            }))
                          }
                          placeholder="Was sagst du in diesem Schritt?"
                          rows={4}
                          className="bg-secondary border-border resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Notiz (optional)</Label>
                        <Textarea
                          value={step.note}
                          onChange={(e) =>
                            updateStep(step.id, (s) => ({
                              ...s,
                              note: e.target.value,
                            }))
                          }
                          placeholder="Hinweise, Einwaende, Tipps..."
                          rows={2}
                          className="bg-secondary border-border resize-none"
                        />
                      </div>

                      {/* Options */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Antwort-Optionen</Label>
                          <Button
                            onClick={() => addOption(step.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Option
                          </Button>
                        </div>

                        {step.options.length > 0 ? (
                          <div className="space-y-2">
                            {step.options.map((option) => (
                              <div
                                key={option.id}
                                className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-3"
                              >
                                <Input
                                  value={option.label}
                                  onChange={(e) =>
                                    updateStep(step.id, (s) => ({
                                      ...s,
                                      options: s.options.map((o) =>
                                        o.id === option.id
                                          ? { ...o, label: e.target.value }
                                          : o
                                      ),
                                    }))
                                  }
                                  placeholder="Option Label"
                                  className="flex-1 h-9 bg-background border-border"
                                />
                                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                <Select
                                  value={option.targetStepId}
                                  onValueChange={(value) =>
                                    updateStep(step.id, (s) => ({
                                      ...s,
                                      options: s.options.map((o) =>
                                        o.id === option.id
                                          ? { ...o, targetStepId: value }
                                          : o
                                      ),
                                    }))
                                  }
                                >
                                  <SelectTrigger className="w-40 h-9 bg-background border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {script.steps.map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        {stepNameMap[s.id]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  onClick={() => deleteOption(step.id, option.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground py-2">
                            Keine Optionen - dieser Schritt ist ein Endpunkt.
                          </p>
                        )}
                      </div>

                      {/* Delete Step */}
                      <div className="pt-2 border-t border-border">
                        <Button
                          onClick={() => deleteStep(step.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Schritt loeschen
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {/* Add Step Button (alternative position) */}
        <Button
          onClick={addStep}
          variant="outline"
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4" />
          Neuen Schritt hinzufuegen
        </Button>
      </div>
    </div>
  );
}
