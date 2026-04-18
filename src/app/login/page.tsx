import { PhoneCall } from "lucide-react";
import { redirectIfAuthenticated } from "@/lib/auth";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-sidebar border-r border-sidebar-border">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PhoneCall className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Cold Call Guide
            </span>
          </div>

          {/* Hero Text */}
          <div className="mt-16 space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Guided Sales Calls
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-foreground text-balance">
              Klare Call-Fuehrung fuer echte Gespraeche statt Notizzettel-Chaos.
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground max-w-md">
              Waehle ein Skript, springe sauber durch Verzweigungen und halte den Verlauf waehrend des Calls jederzeit im Blick.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-semibold text-foreground">1 Klick</div>
            <p className="mt-1 text-sm text-muted-foreground">
              zur naechsten Antwortoption
            </p>
          </div>
          <div>
            <div className="text-3xl font-semibold text-foreground">100%</div>
            <p className="mt-1 text-sm text-muted-foreground">
              freie Struktur fuer Skripte
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <LoginForm />
      </div>
    </main>
  );
}
