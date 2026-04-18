import { redirectIfAuthenticated } from "@/lib/auth";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="surface-grid flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl rounded-[2rem] border border-border/60 bg-background/75 p-4 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.55)] backdrop-blur">
        <div className="grid gap-6 rounded-[1.5rem] border border-border/60 bg-white/60 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <section className="hidden flex-col justify-between rounded-[1.25rem] bg-[linear-gradient(140deg,rgba(15,23,42,0.95),rgba(41,72,124,0.88))] p-8 text-slate-50 lg:flex">
            <div className="space-y-5">
              <div className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                Guided Sales Calls
              </div>
              <div className="space-y-3">
                <h1 className="max-w-xl text-4xl font-semibold leading-tight">
                  Klare Call-Fuehrung fuer echte Gespraeche statt Notizzettel-Chaos.
                </h1>
                <p className="max-w-lg text-sm leading-7 text-slate-300">
                  Waehle ein Skript, springe sauber durch Verzweigungen und halte den Verlauf waehrend des Calls jederzeit im Blick.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <div className="text-2xl font-semibold text-white">1 Klick</div>
                <p className="mt-2 leading-6">zur naechsten Antwortoption im Run-Modus.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <div className="text-2xl font-semibold text-white">100%</div>
                <p className="mt-2 leading-6">freie Struktur fuer eigene Verzweigungen und Skripte.</p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center rounded-[1.25rem] bg-background/80 p-3 lg:p-6">
            <LoginForm />
          </section>
        </div>
      </div>
    </main>
  );
}
