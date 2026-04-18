"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type LoginActionState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" size="lg" type="submit" disabled={pending}>
      {pending ? "Anmeldung laeuft..." : "Einloggen"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <Card className="w-full max-w-md border-border/70 bg-card/90">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Cold Call Guide
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">Gesicherter Zugriff</CardTitle>
          <CardDescription>
            Ein Passwort reicht fuer die gesamte App. Nach erfolgreichem Login wird eine Session gesetzt.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              autoComplete="current-password"
              className="h-12"
              id="password"
              name="password"
              placeholder="Passwort eingeben"
              type="password"
            />
          </div>

          {state.error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {state.error}
            </div>
          ) : null}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
