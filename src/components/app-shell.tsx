"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhoneCall, FileText, Plus, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { logoutAction } from "@/app/(protected)/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    label: "Skripte",
    href: "/scripts",
    icon: FileText,
  },
  {
    label: "Neues Skript",
    href: "/scripts/new",
    icon: Plus,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
            collapsed ? "w-16" : "w-56"
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            <Link href="/scripts" className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <PhoneCall className="h-4 w-4" />
              </div>
              {!collapsed && (
                <span className="text-sm font-semibold text-sidebar-foreground">
                  Cold Call Guide
                </span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const isActive = item.href === "/scripts" 
                ? pathname === "/scripts" 
                : pathname.startsWith(item.href);
              
              const NavLink = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return NavLink;
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-sidebar-border p-3 space-y-1">
            {/* Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span>Einklappen</span>
                </>
              )}
            </button>

            {/* Logout */}
            <form action={logoutAction}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      variant="ghost"
                      className="w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    Abmelden
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Abmelden</span>
                </Button>
              )}
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            collapsed ? "ml-16" : "ml-56"
          )}
        >
          <div className="min-h-screen p-8">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
