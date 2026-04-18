import Link from "next/link";
import { PhoneCall, Workflow } from "lucide-react";

import { logoutAction } from "@/app/(protected)/actions";
import { LogoutButton } from "@/components/logout-button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/92 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-4">
          <Link className="flex items-center gap-3" href="/scripts">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Cold Call Guide
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Workflow className="h-4 w-4 text-primary" />
                Verzweigte Sales-Skripte fuer Live-Calls
              </div>
            </div>
          </Link>

          <form action={logoutAction}>
            <LogoutButton />
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-8">{children}</main>
    </div>
  );
}
