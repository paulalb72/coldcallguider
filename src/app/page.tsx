import { redirect } from "next/navigation";

import { hasValidSession } from "@/lib/auth";

export default async function HomePage() {
  const authenticated = await hasValidSession();
  redirect(authenticated ? "/scripts" : "/login");
}
