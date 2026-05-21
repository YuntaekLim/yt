"use client";

import { cn } from "@/lib/utils";
import { MBTI16 } from "@/types/recommender";

type Props = {
  value: MBTI16 | null;
  onChange: (mbti: MBTI16) => void;
};

export function MbtiGrid({ value, onChange }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="MBTI 16유형"
      className="grid grid-cols-4 gap-2 md:max-w-md md:mx-auto"
    >
      {MBTI16.map((type) => {
        const selected = type === value;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(type)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md text-xl font-extrabold tracking-wider transition-colors md:text-2xl",
              selected
                ? "border-2 border-foreground bg-accent text-accent-foreground"
                : "border border-border bg-card text-card-foreground hover:bg-accent/40",
            )}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}
