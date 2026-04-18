"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="outline">
      <LogOut className="h-4 w-4" />
      {pending ? "Logout..." : "Logout"}
    </Button>
  );
}
