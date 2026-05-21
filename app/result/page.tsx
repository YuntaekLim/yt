import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AlternativeCard } from "@/components/result/alternative-card";
import { CopyPromptButton } from "@/components/result/copy-prompt-button";
import { ResultCard } from "@/components/result/result-card";
import { ShareButton } from "@/components/result/share-button";
import { Button } from "@/components/ui/button";
import { recommend } from "@/lib/recommend";
import { parseInputFromSearchParams } from "@/lib/url-state";
import {
  JOB_LABELS,
  PRIORITY_LABELS,
  TASK_LABELS,
} from "@/types/recommender";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const input = parseInputFromSearchParams(params);
  if (!input) {
    return { title: "LLM-MBTI Recommender" };
  }
  const r = recommend(input);
  const title = `${input.mbti} 성향에 추천하는 LLM — ${r.main.displayName}`;
  const description = `${input.mbti}·${input.jobs
    .map((j) => JOB_LABELS[j])
    .join(", ")} 직무에 ${r.main.displayName}을(를) 추천합니다.`;
  const ogPath = `/og?mbti=${input.mbti}&main=${r.main.id}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogPath,
          width: 1200,
          height: 630,
          alt: `${input.mbti} 성향에 추천하는 ${r.main.displayName}`,
        },
      ],
    },
  };
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const input = parseInputFromSearchParams(params);
  if (!input) redirect("/");

  const r = recommend(input);

  const summary = [
    input.mbti,
    input.jobs.map((j) => JOB_LABELS[j]).join(", "),
    input.tasks.map((t) => TASK_LABELS[t]).join(", "),
    input.priorities.map((p) => PRIORITY_LABELS[p]).join(", "),
  ].join(" · ");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="mb-1 text-xs text-muted-foreground">당신의 진단</p>
      <p className="mb-8 text-sm">{summary}</p>

      <ResultCard
        model={r.main}
        reasoning={r.reasoning}
        systemPrompt={r.systemPrompt}
        promptAction={<CopyPromptButton text={r.systemPrompt} />}
      />

      <p className="mb-2 mt-8 text-xs text-muted-foreground">대안</p>
      <div className="flex flex-col gap-2">
        {r.alternatives.map((alt) => (
          <AlternativeCard key={alt.id} model={alt} />
        ))}
      </div>

      <div className="mt-10 flex gap-2">
        <ShareButton />
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">다시 진단하기</Link>
        </Button>
      </div>
    </main>
  );
}
