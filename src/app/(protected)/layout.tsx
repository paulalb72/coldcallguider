import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <AppShell>{children}</AppShell>;
}
