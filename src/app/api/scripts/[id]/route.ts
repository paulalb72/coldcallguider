import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { hasValidSession } from "@/lib/auth";
import { deleteScript, saveScript } from "@/lib/script-repository";

type ScriptRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: ScriptRouteContext) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const payload = await request.json();
    const scriptId = await saveScript(payload, id);

    revalidatePath("/scripts");
    revalidatePath(`/scripts/${scriptId}/edit`);
    revalidatePath(`/scripts/${scriptId}/run`);

    return NextResponse.json({ id: scriptId });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Ungueltige Daten." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Das Skript konnte nicht gespeichert werden.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: ScriptRouteContext) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await deleteScript(id);

    revalidatePath("/scripts");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Das Skript konnte nicht geloescht werden.",
      },
      { status: 500 },
    );
  }
}
