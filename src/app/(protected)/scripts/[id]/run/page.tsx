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

  return <ScriptRunner script={runnableScript} />;
}
