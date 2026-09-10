"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu } from "lucide-react";
import { cn } from "./cn";
import { Logo } from "./logo";
import { NavShape } from "./nav-shape";

export interface KorfbalToolBarNavApp {
  capability: string;
  title: string;
  href: string;
}

export interface KorfbalToolBarProps {
  apps?: KorfbalToolBarNavApp[];
  homeHref?: string;
  className?: string;
  containerClassName?: string;
}

// Shared across apps/* (see docs/plan.md section 12 "packages/ui") — which
// apps are enabled is decided by apps/main (see its lib/apps.ts), this
// component only renders what it's given so it works whether the caller reads
// the config directly (apps/main) or via the main API (apps/teamindeling,
// apps/vastspelen, see plan.md section 6).
export function KorfbalToolBar({
  apps = [],
  homeHref = "/",
  className,
  containerClassName,
}: KorfbalToolBarProps) {
  return (
    <nav className={cn("border-t-8 border-primary-500 sticky top-0 z-40", className)}>
      <div className="absolute top-0 left-0 w-full h-fit flex justify-between">
        <NavShape />
        <NavShape flipHorizontal />
      </div>

      <div className={cn("relative mx-auto w-full max-w-4xl px-6", containerClassName)}>
        <a
          className="group text-lg font-semibold text-white absolute left-6 -translate-x-4 flex items-start rounded-br-lg rounded-bl-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500"
          href={homeHref}
        >
          <NavShape flipHorizontal />
            <div className="bg-primary-500 min-w-[50px] h-[50px] px-4 flex items-center justify-center rounded-br-lg rounded-bl-lg">
              <Logo size={40} />
              <div className="flex flex-col text-xs leading-3 text-secondary max-w-0 overflow-hidden opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:max-w-[80px] group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-2">
                <span>Korfbal</span>
                <span>Tools.nl</span>
              </div>
            </div>
          <NavShape />
        </a>

        {apps.length > 0 && (
          <div className="hidden md:flex absolute top-0 right-6 translate-x-4 w-fit h-fit items-start">
            <NavShape flipHorizontal />
            <div className="bg-primary-500 h-[50px] px-2 flex items-center gap-2 justify-center rounded-br-lg rounded-bl-lg">
              {apps.map((app) => (
                <a
                  key={app.capability}
                  href={app.href}
                  className="bg-secondary-500 px-2 py-1 rounded text-white hover:bg-secondary-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500"
                >
                  {app.title}
                </a>
              ))}
            </div>
            <NavShape />
          </div>
        )}

        {apps.length > 0 && (
          <div className="md:hidden absolute top-0 right-6 translate-x-4 w-fit h-fit flex items-start">
            <NavShape flipHorizontal />
            <div className="bg-primary-500 h-[50px] px-2 flex items-center justify-center rounded-bl-lg rounded-br-lg">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="flex items-center rounded-md p-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500"
                    aria-label="Menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={12}
                    className="z-50 min-w-60 rounded-md bg-primary-400 text-white p-2"
                  >
                    {apps.map((app) => (
                      <DropdownMenu.Item
                        key={app.capability}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-primary-500"
                        onSelect={() => {
                          window.location.href = app.href;
                        }}
                      >
                        {app.title}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
            <NavShape />
          </div>
        )}
      </div>
    </nav>
  );
}
