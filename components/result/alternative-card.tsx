import { Card } from "@/components/ui/card";
import type { Model } from "@/types/recommender";

type Props = {
  model: Model;
};

export function AlternativeCard({ model }: Props) {
  const tagline = model.strengths[0] ?? "";
  const rest = model.strengths.slice(1).join(" · ");
  return (
    <Card className="px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-bold">{model.displayName}</h3>
        <span className="text-xs text-muted-foreground">{tagline}</span>
      </div>
      {rest && <p className="mt-1 text-xs text-muted-foreground">{rest}</p>}
    </Card>
  );
}
