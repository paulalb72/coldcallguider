import { notFound } from "next/navigation";

import { ScriptEditor, type EditableScript } from "@/components/scripts/script-editor";
import { getScriptById } from "@/lib/script-repository";

type EditScriptPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditScriptPage({ params }: EditScriptPageProps) {
  const { id } = await params;
  const script = await getScriptById(id);

  if (!script) {
    notFound();
  }

  const initialScript: EditableScript = {
    id: script.id,
    title: script.title,
    description: script.description ?? "",
    startStepId: script.startStepId ?? script.steps[0]?.id ?? "",
    steps: script.steps.map((step) => ({
      id: step.id,
      name: step.name,
      content: step.content,
      speaker: step.speaker ?? "",
      note: step.note ?? "",
      options: step.options.map((option) => ({
        id: option.id,
        label: option.label,
        targetStepId: option.targetStepId,
      })),
    })),
  };

  return <ScriptEditor initialScript={initialScript} mode="edit" />;
}
