"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import type { User } from "@korfbaltools/types";
import { cn } from "./cn";

export interface KorfbalToolBarProps {
  user: Pick<User, "email" | "naam" | "role"> | null;
  homeHref?: string;
  accountHref?: string;
  adminHref?: string;
  loginHref?: string;
  registerHref?: string;
  logoutHref?: string;
  className?: string;
}

// Shared across apps/* (see docs/plan.md section 12 "packages/ui") — data
// fetching (who's logged in) stays app-specific, this component only renders
// what it's given so it works whether the caller reads the session directly
// (apps/main) or via the main API (apps/admin, see plan.md section 6).
export function KorfbalToolBar({
  user,
  homeHref = "/",
  accountHref = "/account",
  adminHref = "/admin",
  loginHref = "/login",
  registerHref = "/register",
  logoutHref = "/api/logout",
  className,
}: KorfbalToolBarProps) {
  async function handleLogout() {
    await fetch(logoutHref, { method: "POST" });
    window.location.href = homeHref;
  }

  return (
    <nav className={cn("flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3", className)}>
      <a className="text-lg font-semibold text-brand-600" href={homeHref}>
        Korfbaltools
      </a>

      {user ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-neutral-100">
              <span>{user.naam ?? user.email}</span>
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-56 rounded-md border border-neutral-200 bg-white p-1 shadow-lg"
            >
              <div className="px-2 py-1.5 text-xs text-neutral-500">{user.email}</div>
              <DropdownMenu.Separator className="my-1 h-px bg-neutral-100" />
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-neutral-100"
                onSelect={() => {
                  window.location.href = accountHref;
                }}
              >
                <Settings className="h-4 w-4" />
                Mijn gegevens
              </DropdownMenu.Item>
              {user.role === "admin" && (
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-neutral-100"
                  onSelect={() => {
                    window.location.href = adminHref;
                  }}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin paneel
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Separator className="my-1 h-px bg-neutral-100" />
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-danger outline-none hover:bg-neutral-100"
                onSelect={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Uitloggen
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ) : (
        <div className="flex items-center gap-4 text-sm">
          <a className="text-neutral-600 hover:text-neutral-900" href={loginHref}>
            Inloggen
          </a>
          <a className="rounded-md bg-brand-500 px-3 py-1.5 text-white hover:bg-brand-600" href={registerHref}>
            Account aanmaken
          </a>
        </div>
      )}
    </nav>
  );
}
