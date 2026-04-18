"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CirclePlay,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Workflow,
} from "lucide-react";
import { ZodError } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    initialScript.steps[0]?.id ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  const activeSelectedStepId = script.steps.some(
    (step) => step.id === selectedStepId,
  )
    ? selectedStepId
    : script.steps[0]?.id ?? null;
  const selectedStep =
    script.steps.find((step) => step.id === activeSelectedStepId) ?? null;

  const stepNameMap = Object.fromEntries(
    script.steps.map((step, index) => [
      step.id,
      step.name.trim() || `Schritt ${index + 1}`,
    ]),
  );

  function updateScript(
    updater: (previousScript: EditableScript) => EditableScript,
  ) {
    setScript((previousScript) => updater(previousScript));
  }

  function updateSelectedStep(
    updater: (step: EditorStep) => EditorStep,
  ) {
    if (!activeSelectedStepId) {
      return;
    }

    updateScript((previousScript) => ({
      ...previousScript,
      steps: previousScript.steps.map((step) =>
        step.id === activeSelectedStepId ? updater(step) : step,
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

    setSelectedStepId(nextStep.id);
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

    setSelectedStepId((currentSelected) => {
      if (currentSelected !== stepId) {
        return currentSelected;
      }

      const nextStep = script.steps.find((step) => step.id !== stepId);
      return nextStep?.id ?? null;
    });
  }

  function addOption() {
    if (!selectedStep) {
      return;
    }

    const fallbackTarget = script.steps[0]?.id ?? selectedStep.id;

    updateSelectedStep((step) => ({
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

  function save(intent: "save" | "run") {
    startTransition(async () => {
      setError(null);

      try {
        const payload = scriptPayloadSchema.parse(toPayload(script));
        const response = await fetch(
          script.id ? `/api/scripts/${script.id}` : "/api/scripts",
          {
            method: script.id ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const result = (await response.json().catch(() => null)) as
          | { id?: string; error?: string }
          | null;

        if (!response.ok || !result?.id) {
          setError(result?.error ?? "Das Skript konnte nicht gespeichert werden.");
          return;
        }

        const nextPath =
          intent === "run"
            ? `/scripts/${result.id}/run`
            : `/scripts/${result.id}/edit`;

        router.replace(nextPath);
        router.refresh();
      } catch (saveError) {
        setError(formatClientError(saveError));
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)]">
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Schritte</CardTitle>
              <CardDescription>
                Startpunkt festlegen, Reihenfolge ueberblicken, schnell zwischen Knoten wechseln.
              </CardDescription>
            </div>
            <Badge variant="secondary">{script.steps.length}</Badge>
          </div>
          <Button onClick={addStep} type="button">
            <Plus className="h-4 w-4" />
            Neuer Schritt
          </Button>
        </CardHeader>
        <CardContent className="h-[calc(100%-8.5rem)] pb-4">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-2">
              {script.steps.map((step, index) => {
                const active = step.id === activeSelectedStepId;

                return (
                  <button
                    key={step.id}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-primary/40 bg-primary/10 shadow-sm"
                        : "border-border/70 bg-background/70 hover:bg-accent/45",
                    )}
                    onClick={() => setSelectedStepId(step.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-foreground">
                        {step.name.trim() || `Schritt ${index + 1}`}
                      </div>
                      {script.startStepId === step.id ? (
                        <Badge>Start</Badge>
                      ) : null}
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {step.content.trim() || "Noch kein sichtbarer Text"}
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      {step.options.length} Antwortoption{step.options.length === 1 ? "" : "en"}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>
                  {mode === "create" ? "Neues Sales-Skript" : "Skript bearbeiten"}
                </CardTitle>
                <CardDescription>
                  Lege den globalen Rahmen fest und verknuepfe danach die einzelnen Schritte.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {script.id ? (
                  <Button asChild variant="outline">
                    <Link href={`/scripts/${script.id}/run`}>
                      <CirclePlay className="h-4 w-4" />
                      Aktuelle Version starten
                    </Link>
                  </Button>
                ) : null}
                <Button onClick={() => save("save")} type="button" variant="outline">
                  {isSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Speichern
                </Button>
                <Button onClick={() => save("run")} type="button">
                  {isSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <CirclePlay className="h-4 w-4" />
                  )}
                  Speichern und starten
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="script-title">Name</Label>
              <Input
                id="script-title"
                onChange={(event) =>
                  updateScript((previousScript) => ({
                    ...previousScript,
                    title: event.target.value,
                  }))
                }
                placeholder="Zum Beispiel: Rueckruf-Qualifizierung DACH"
                value={script.title}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="script-description">Beschreibung</Label>
              <Textarea
                id="script-description"
                onChange={(event) =>
                  updateScript((previousScript) => ({
                    ...previousScript,
                    description: event.target.value,
                  }))
                }
                placeholder="Wofuer ist dieses Skript gedacht und wann wird es im Call eingesetzt?"
                rows={3}
                value={script.description}
              />
            </div>

            <div className="space-y-2">
              <Label>Startschritt</Label>
              <Select
                onValueChange={(value) =>
                  updateScript((previousScript) => ({
                    ...previousScript,
                    startStepId: value,
                  }))
                }
                value={script.startStepId}
              >
                <SelectTrigger>
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

            <div className="rounded-2xl border border-border/80 bg-secondary/35 p-4 text-sm leading-6 text-muted-foreground">
              Schritte ohne Antwortoptionen werden als Endpunkte behandelt. Das ist gewollt fuer Abschluesse, Rueckruf-Slots oder Sackgassen.
            </div>

            {error ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive md:col-span-2">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {selectedStep ? (
          <Card>
            <CardHeader className="gap-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">ID {selectedStep.id.slice(0, 12)}</Badge>
                    {script.startStepId === selectedStep.id ? (
                      <Badge>Aktueller Startschritt</Badge>
                    ) : null}
                  </div>
                  <div>
                    <CardTitle>Schritt bearbeiten</CardTitle>
                    <CardDescription>
                      Interner Name fuer die Orientierung, sichtbarer Text fuer den eigentlichen Call.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={addOption} type="button" variant="outline">
                    <Plus className="h-4 w-4" />
                    Antwortoption
                  </Button>
                  <Button
                    onClick={() => deleteStep(selectedStep.id)}
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Schritt loeschen
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-2">
                  <Label htmlFor="step-name">Interner Name</Label>
                  <Input
                    id="step-name"
                    onChange={(event) =>
                      updateSelectedStep((step) => ({
                        ...step,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Zum Beispiel: Einstieg bei Einwand"
                    value={selectedStep.name}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="step-speaker">Sprecherrolle</Label>
                  <Input
                    id="step-speaker"
                    onChange={(event) =>
                      updateSelectedStep((step) => ({
                        ...step,
                        speaker: event.target.value,
                      }))
                    }
                    placeholder="Du, Kunde, Teamlead..."
                    value={selectedStep.speaker}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="step-content">Skripttext</Label>
                <Textarea
                  id="step-content"
                  onChange={(event) =>
                    updateSelectedStep((step) => ({
                      ...step,
                      content: event.target.value,
                    }))
                  }
                  placeholder="Was soll in diesem Moment gesagt oder gefragt werden?"
                  rows={7}
                  value={selectedStep.content}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="step-note">Notiz oder Kontext</Label>
                <Textarea
                  id="step-note"
                  onChange={(event) =>
                    updateSelectedStep((step) => ({
                      ...step,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Optional: Einwand-Hinweis, Tonalitaet, Reminder fuer Follow-up..."
                  rows={4}
                  value={selectedStep.note}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Workflow className="h-4 w-4 text-primary" />
                      Antwortoptionen
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Jede Option fuehrt direkt zum naechsten Schritt. Ohne Optionen endet das Skript an dieser Stelle.
                    </p>
                  </div>
                  <Badge variant="outline">{selectedStep.options.length} Pfade</Badge>
                </div>

                {selectedStep.options.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStep.options.map((option, optionIndex) => (
                      <div
                        key={option.id}
                        className="grid gap-3 rounded-2xl border border-border/80 bg-background/60 p-4 xl:grid-cols-[minmax(0,1fr)_260px_auto]"
                      >
                        <div className="space-y-2">
                          <Label htmlFor={`option-label-${option.id}`}>
                            Label der Antwortoption
                          </Label>
                          <Input
                            id={`option-label-${option.id}`}
                            onChange={(event) =>
                              updateSelectedStep((step) => ({
                                ...step,
                                options: step.options.map((existingOption) =>
                                  existingOption.id === option.id
                                    ? {
                                        ...existingOption,
                                        label: event.target.value,
                                      }
                                    : existingOption,
                                ),
                              }))
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option.label}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Zielschritt</Label>
                          <Select
                            onValueChange={(value) =>
                              updateSelectedStep((step) => ({
                                ...step,
                                options: step.options.map((existingOption) =>
                                  existingOption.id === option.id
                                    ? {
                                        ...existingOption,
                                        targetStepId: value,
                                      }
                                    : existingOption,
                                ),
                              }))
                            }
                            value={option.targetStepId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Zielschritt waehlen" />
                            </SelectTrigger>
                            <SelectContent>
                              {script.steps.map((step) => (
                                <SelectItem key={step.id} value={step.id}>
                                  {stepNameMap[step.id]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end">
                          <Button
                            className="w-full xl:w-auto"
                            onClick={() =>
                              updateSelectedStep((step) => ({
                                ...step,
                                options: step.options.filter(
                                  (existingOption) => existingOption.id !== option.id,
                                ),
                              }))
                            }
                            type="button"
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Entfernen
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/25 px-4 py-5 text-sm leading-6 text-muted-foreground">
                    Dieser Schritt ist aktuell ein Endpunkt. Fuge bei Bedarf eine neue Antwortoption hinzu.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-wrap justify-between gap-3">
          <Button asChild variant="ghost">
            <Link href="/scripts">Abbrechen</Link>
          </Button>
          <div className="text-sm leading-6 text-muted-foreground">
            Erst speichern, dann starten oder spaeter direkt aus der Uebersicht heraus loslegen.
          </div>
        </div>
      </div>
    </div>
  );
}
