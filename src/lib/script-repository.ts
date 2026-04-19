import "server-only";

import { randomUUID } from "crypto";

import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { scriptPayloadSchema, type ScriptPayload } from "@/lib/validations/script";

const editorInclude = {
  steps: {
    orderBy: { position: "asc" as const },
    include: {
      options: {
        orderBy: { position: "asc" as const },
      },
    },
  },
} satisfies Prisma.ScriptInclude;

export type ScriptEditorRecord = Prisma.ScriptGetPayload<{
  include: typeof editorInclude;
}>;

export async function listScripts() {
  return prisma.script.findMany({
    select: {
      id: true,
      title: true,
      updatedAt: true,
      _count: {
        select: {
          steps: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });
}

export async function getScriptById(id: string) {
  return prisma.script.findUnique({
    where: { id },
    include: editorInclude,
  });
}

function normalizePayload(payload: ScriptPayload) {
  return {
    title: payload.title.trim(),
    startStepId: payload.startStepId,
    steps: payload.steps.map((step) => ({
      id: step.id,
      name: step.name.trim(),
      content: step.content.trim(),
      note: step.note.trim() || null,
      position: step.position,
      options: step.options.map((option) => ({
        id: option.id,
        label: option.label.trim(),
        targetStepId: option.targetStepId,
        position: option.position,
      })),
    })),
  };
}

async function assertIdsBelongToScript(
  tx: Prisma.TransactionClient,
  scriptId: string,
  stepIds: string[],
  optionIds: string[],
) {
  if (stepIds.length > 0) {
    const foreignSteps = await tx.step.count({
      where: {
        id: { in: stepIds },
        NOT: { scriptId },
      },
    });

    if (foreignSteps > 0) {
      throw new Error("Mindestens eine Schritt-ID gehoert zu einem anderen Skript.");
    }
  }

  if (optionIds.length > 0) {
    const foreignOptions = await tx.stepOption.count({
      where: {
        id: { in: optionIds },
        step: {
          is: {
            NOT: { scriptId },
          },
        },
      },
    });

    if (foreignOptions > 0) {
      throw new Error("Mindestens eine Optionen-ID gehoert zu einem anderen Skript.");
    }
  }
}

export async function saveScript(input: unknown, existingId?: string) {
  const parsed = scriptPayloadSchema.parse(input);
  const payload = normalizePayload(parsed);

  return prisma.$transaction(async (tx) => {
    const scriptId = existingId ?? randomUUID();

    if (existingId) {
      const existingScript = await tx.script.findUnique({
        where: { id: existingId },
        select: { id: true },
      });

      if (!existingScript) {
        throw new Error("Das Skript wurde nicht gefunden.");
      }
    }

    const stepIds = payload.steps.map((step) => step.id);
    const optionIds = payload.steps.flatMap((step) =>
      step.options.map((option) => option.id),
    );

    await assertIdsBelongToScript(tx, scriptId, stepIds, optionIds);

    await tx.script.upsert({
      where: { id: scriptId },
      create: {
        id: scriptId,
        title: payload.title,
        startStepId: null,
      },
      update: {
        title: payload.title,
        startStepId: null,
      },
    });

    const optionDeleteWhere: Prisma.StepOptionWhereInput =
      optionIds.length > 0
        ? {
            step: {
              is: { scriptId },
            },
            id: { notIn: optionIds },
          }
        : {
            step: {
              is: { scriptId },
            },
          };

    await tx.stepOption.deleteMany({
      where: optionDeleteWhere,
    });

    const stepDeleteWhere: Prisma.StepWhereInput =
      stepIds.length > 0
        ? {
            scriptId,
            id: { notIn: stepIds },
          }
        : {
            scriptId,
          };

    await tx.step.deleteMany({
      where: stepDeleteWhere,
    });

    for (const step of payload.steps) {
      await tx.step.upsert({
        where: { id: step.id },
        create: {
          id: step.id,
          scriptId,
          name: step.name,
          content: step.content,
          note: step.note,
          position: step.position,
        },
        update: {
          name: step.name,
          content: step.content,
          note: step.note,
          position: step.position,
        },
      });
    }

    for (const step of payload.steps) {
      for (const option of step.options) {
        await tx.stepOption.upsert({
          where: { id: option.id },
          create: {
            id: option.id,
            stepId: step.id,
            label: option.label,
            targetStepId: option.targetStepId,
            position: option.position,
          },
          update: {
            stepId: step.id,
            label: option.label,
            targetStepId: option.targetStepId,
            position: option.position,
          },
        });
      }
    }

    await tx.script.update({
      where: { id: scriptId },
      data: {
        startStepId: payload.startStepId,
      },
    });

    return scriptId;
  });
}

export async function deleteScript(id: string) {
  await prisma.script.delete({
    where: { id },
  });
}
