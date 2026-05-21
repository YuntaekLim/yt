import { cn } from "@/lib/utils";

type Props = {
  current: number;
  total: number;
};

export function ProgressDots({ current, total }: Props) {
  return (
    <div
      className="flex items-center gap-2"
      aria-label={`${current} / ${total} 단계`}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          data-testid={`progress-dot-${i}`}
          data-active={i < current ? "true" : "false"}
          className={cn(
            "h-1 w-6 rounded-full transition-colors",
            i < current ? "bg-foreground" : "bg-muted",
          )}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground">
        {current} / {total}
      </span>
    </div>
  );
}
