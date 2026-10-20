//have to delete this file
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "all";

interface FilterSelectProps {
  label: string; // plural, e.g. "Countries"
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <Select value={value || ALL} onValueChange={(next) => onChange(next === ALL || next === null ? "" : next)}>
      <SelectTrigger className="w-[180px]" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{`All ${label.toLowerCase()}`}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}