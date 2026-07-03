"use client";

import { ChevronDown } from "lucide-react";
import { CAPABILITIES, type Capability } from "@korfbaltools/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CapabilitiesSelectProps {
  value: Capability[];
  onChange: (capabilities: Capability[]) => void;
  disabled?: boolean;
}

export function CapabilitiesSelect({ value, onChange, disabled }: CapabilitiesSelectProps) {
  function toggle(capability: Capability) {
    onChange(value.includes(capability) ? value.filter((c) => c !== capability) : [...value, capability]);
  }

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        className="flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {value.length > 0 ? (
          value.map((capability) => (
            <Badge key={capability} variant="neutral">
              {capability}
            </Badge>
          ))
        ) : (
          <span className="text-neutral-500">Geen</span>
        )}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <Command>
          <CommandList>
            <CommandGroup>
              {CAPABILITIES.map((capability) => (
                <CommandItem key={capability} onSelect={() => toggle(capability)}>
                  <Checkbox checked={value.includes(capability)} />
                  {capability}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
