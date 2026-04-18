import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { hasValidSession } from "@/lib/auth";
import { saveScript } from "@/lib/script-repository";

export async function POST(request: Request) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const id = await saveScript(payload);

    revalidatePath("/scripts");
    revalidatePath(`/scripts/${id}/edit`);
    revalidatePath(`/scripts/${id}/run`);

    return NextResponse.json({ id }, { status: 201 });
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
