"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ChipOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: readonly ChipOption<T>[];
  value: readonly T[];
  onChange: (values: T[]) => void;
  ariaLabel?: string;
};

export function ChipMultiSelect<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: Props<T>) {
  return (
    <ToggleGroup
      type="multiple"
      value={[...value]}
      onValueChange={(v: string[]) => onChange(v as T[])}
      aria-label={ariaLabel}
      variant="outline"
      spacing={2}
      className="flex-wrap"
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          aria-label={opt.label}
          className="rounded-full px-4"
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
