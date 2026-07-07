"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import type { User } from "@korfbaltools/types";
import { cn } from "./cn";
import { Logo } from "./logo";
import { NavShape } from "./nav-shape";

export interface KorfbalToolBarNavApp {
  capability: string;
  title: string;
  href: string;
}

export interface KorfbalToolBarProps {
  user: Pick<User, "email" | "naam" | "role"> | null;
  apps?: KorfbalToolBarNavApp[];
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
  apps = [],
  homeHref = "/",
  accountHref = "/account",
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
    <nav className={cn("border-t-4 border-primary-500 sticky top-0 z-40", className)}>
      <div className="absolute top-0 left-0 w-full h-fit flex justify-between">
        <NavShape />
        <NavShape flipHorizontal />
      </div>

      <a className="group text-lg font-semibold text-white absolute left-20 flex items-start" href={homeHref}>
        <NavShape flipHorizontal />
          <div className="bg-primary-500 min-w-[50px] h-[50px] px-4 flex items-center justify-center rounded-br-lg rounded-bl-lg">
            <Logo className="h-10 w-auto" />
            <div className="flex flex-col text-xs leading-3 text-secondary max-w-0 overflow-hidden opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:max-w-[80px] group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-2">
              <span>Korfbal</span>
              <span>Tools.nl</span>
            </div>
          </div>
        <NavShape />
      </a>

      <div className="absolute top-0 left-[50vw] w-fit h-fit flex items-start">
        <NavShape flipHorizontal />
        <div className="bg-primary-500 h-[50px] px-2 flex items-center gap-2 justify-center rounded-br-lg rounded-bl-lg">
          {apps.map((app) => (
            <a
              key={app.capability}
              href={app.href}
              className="bg-secondary-500 px-2 py-1 rounded text-white hover:bg-secondary-600 transition"
            >
              {app.title}
            </a>
          ))}
        </div>
        <NavShape />
      </div>

      {user ? (
        <div className="absolute right-20 w-fit flex items-start">
          <NavShape flipHorizontal />
            <div className="flex items-center gap-4 text-sm bg-primary-500 px-4 py-4 rounded-bl-lg rounded-br-lg">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-white">
                    <span>{user.naam ?? user.email}</span>
                    <ChevronDown className="h-4 w-4 text-neutral-500" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={12}
                    className="z-50 min-w-60 rounded-md bg-primary-400 text-white p-2"
                  >
                    <div className="px-2 py-1.5 text-xs text-white">{user.email}</div>
                    <DropdownMenu.Separator className="my-1 h-px bg-neutral-100" />
                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-primary-500"
                      onSelect={() => {
                        window.location.href = accountHref;
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      Mijn gegevens
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-primary-500"
                      onSelect={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Uitloggen
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          <NavShape />
        </div>
      ) : (
        <div className="absolute right-10 w-fit flex items-start absolute right-20">
          <NavShape flipHorizontal />
          <div className="flex items-center gap-4 text-sm bg-primary-500 w-fit px-4 py-4 rounded-br-lg rounded-bl-lg">
            <a className="text-white hover:underline" href={loginHref}>
              Inloggen
            </a>
            <a className="rounded-md bg-secondary-500 px-3 py-1.5 text-primary-500 hover:bg-secondary-600" href={registerHref}>
              Account aanmaken
            </a>
          </div>
          <NavShape />
        </div>
      )}
    </nav>
  );
}
