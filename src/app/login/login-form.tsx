"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PhoneCall, Loader2, AlertCircle } from "lucide-react";

import { loginAction, type LoginActionState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full h-11" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Anmeldung...
        </>
      ) : (
        "Anmelden"
      )}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Mobile Logo */}
      <div className="flex flex-col items-center gap-4 lg:hidden">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <PhoneCall className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Cold Call Guide</h1>
      </div>

      {/* Form Header */}
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-semibold text-foreground">
          Willkommen
        </h2>
        <p className="text-sm text-muted-foreground">
          Gib dein Passwort ein, um auf deine Skripte zuzugreifen.
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Passwort
          </Label>
          <Input
            autoComplete="current-password"
            className="h-11 bg-secondary border-border"
            id="password"
            name="password"
            placeholder="Passwort eingeben"
            type="password"
          />
        </div>

        {state.error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <SubmitButton />
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        Gesicherter Zugang nur mit Passwort
      </p>
    </div>
  );
}
