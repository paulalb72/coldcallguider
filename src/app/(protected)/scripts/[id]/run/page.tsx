import { notFound } from "next/navigation";

import { ScriptRunner, type RunnableScript } from "@/components/scripts/script-runner";
import { getScriptById } from "@/lib/script-repository";

type RunScriptPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RunScriptPage({ params }: RunScriptPageProps) {
  const { id } = await params;
  const script = await getScriptById(id);

  if (!script) {
    notFound();
  }

  const runnableScript: RunnableScript = {
    id: script.id,
    title: script.title,
    description: script.description,
    startStepId: script.startStepId,
    steps: script.steps.map((step) => ({
      id: step.id,
      name: step.name,
      content: step.content,
      speaker: step.speaker,
      note: step.note,
      options: step.options.map((option) => ({
        id: option.id,
        label: option.label,
        targetStepId: option.targetStepId,
      })),
    })),
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Run-Modus
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{script.title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Fokus auf schnelle Bedienung waehrend des Calls: aktuelle Aussage, direkte Antwortoptionen und Verlauf auf einen Blick.
        </p>
      </section>

      <ScriptRunner script={runnableScript} />
    </div>
  );
}
