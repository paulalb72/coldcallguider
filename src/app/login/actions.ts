"use server";

import { redirect } from "next/navigation";

import { setSession, validatePassword } from "@/lib/auth";

export type LoginActionState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const password = String(formData.get("password") ?? "");

  if (!password.trim()) {
    return { error: "Bitte gib dein Passwort ein." };
  }

  const isValid = await validatePassword(password);

  if (!isValid) {
    return { error: "Das Passwort ist nicht korrekt." };
  }

  await setSession();
  redirect("/scripts");
}
