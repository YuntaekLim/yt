import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Model } from "@/types/recommender";

type Props = {
  model: Model;
  reasoning: string;
  systemPrompt: string;
  promptAction: ReactNode;
};

export function ResultCard({
  model,
  reasoning,
  systemPrompt,
  promptAction,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>추천 모델</CardDescription>
        <CardTitle className="text-2xl font-bold">{model.displayName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-xs text-muted-foreground">왜 이 모델인가</p>
        <div className="mb-6 whitespace-pre-wrap text-sm leading-relaxed">
          {reasoning}
        </div>

        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">맞춤 시스템 프롬프트</p>
          {promptAction}
        </div>
        <pre className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
          {systemPrompt}
        </pre>
      </CardContent>
    </Card>
  );
}
