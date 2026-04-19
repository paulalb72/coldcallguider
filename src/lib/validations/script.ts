import { z } from "zod";

const requiredText = z
  .string()
  .trim()
  .min(1, "Dieses Feld ist erforderlich.");

export const scriptOptionSchema = z.object({
  id: requiredText,
  label: requiredText.max(120, "Optionen sollten kurz und klar bleiben."),
  targetStepId: requiredText,
  position: z.number().int().nonnegative(),
});

export const scriptStepSchema = z.object({
  id: requiredText,
  name: requiredText.max(120, "Interne Namen sollten maximal 120 Zeichen haben."),
  content: requiredText.max(4000, "Der Schritttext ist zu lang."),
  note: z.string().max(2000, "Die Notiz ist zu lang.").default(""),
  position: z.number().int().nonnegative(),
  options: z.array(scriptOptionSchema),
});

export const scriptPayloadSchema = z
  .object({
    title: requiredText.max(120, "Der Skriptname ist zu lang."),
    startStepId: requiredText,
    steps: z
      .array(scriptStepSchema)
      .min(1, "Lege mindestens einen Schritt an."),
  })
  .superRefine((payload, ctx) => {
    const stepIds = new Set<string>();
    const optionIds = new Set<string>();

    for (const [index, step] of payload.steps.entries()) {
      if (stepIds.has(step.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jeder Schritt braucht eine eindeutige ID.",
          path: ["steps", index, "id"],
        });
      }

      stepIds.add(step.id);

      for (const [optionIndex, option] of step.options.entries()) {
        if (optionIds.has(option.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Jede Antwortoption braucht eine eindeutige ID.",
            path: ["steps", index, "options", optionIndex, "id"],
          });
        }

        optionIds.add(option.id);

        if (!payload.steps.some((stepCandidate) => stepCandidate.id === option.targetStepId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Jede Option muss auf einen vorhandenen Zielschritt zeigen.",
            path: ["steps", index, "options", optionIndex, "targetStepId"],
          });
        }
      }
    }

    if (!stepIds.has(payload.startStepId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Waehle einen gueltigen Startschritt.",
        path: ["startStepId"],
      });
    }
  });

export type ScriptPayload = z.infer<typeof scriptPayloadSchema>;
