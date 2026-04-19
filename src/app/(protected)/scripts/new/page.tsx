import { randomUUID } from "crypto";

import { ScriptEditor, type EditableScript } from "@/components/scripts/script-editor";

export default function NewScriptPage() {
  const stepId = `step_${randomUUID()}`;

  const initialScript: EditableScript = {
    title: "",
    startStepId: stepId,
    steps: [
      {
        id: stepId,
        name: "",
        content: "",
        note: "",
        options: [],
      },
    ],
  };

  return <ScriptEditor initialScript={initialScript} mode="create" />;
}
