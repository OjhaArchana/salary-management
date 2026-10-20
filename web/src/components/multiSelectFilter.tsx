"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { filterBySearch, toggleValue, triggerLabel } from "@/lib/multiselect";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

const SEARCH_THRESHOLD = 8;

export function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const [search, setSearch] = useState("");
  const visible = filterBySearch(options, search);
  const active = selected.length > 0;

  return (
    <Popover onOpenChange={(open) => !open && setSearch("")}>
      <PopoverTrigger
        className={`inline-flex h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm shadow-sm transition-colors hover:bg-muted/50 ${
          active ? "border-primary text-primary" : ""
        }`}
      >
        <span className="max-w-[160px] truncate">{triggerLabel(label, selected)}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        {options.length > SEARCH_THRESHOLD && (
          <Input
            className="mb-2 h-8"
            placeholder={`Search ${label.toLowerCase()}`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        )}
        <div className="max-h-60 overflow-y-auto">
          {visible.length === 0 && <p className="px-2 py-1.5 text-sm text-muted-foreground">No matches</p>}
          {visible.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={selected.includes(option)}
                onChange={() => onChange(toggleValue(selected, option))}
              />
              {option}
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <span className="text-xs text-muted-foreground">{selected.length} selected</span>
          <Button variant="ghost" size="sm" disabled={!active} onClick={() => onChange([])}>
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}