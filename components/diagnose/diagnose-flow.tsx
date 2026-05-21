"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  JOB_IDS,
  JOB_LABELS,
  PRIORITY_IDS,
  PRIORITY_LABELS,
  TASK_IDS,
  TASK_LABELS,
} from "@/types/recommender";
import { useDiagnosis } from "@/hooks/use-diagnosis";
import { ChipMultiSelect } from "./chip-multi-select";
import { MbtiGrid } from "./mbti-grid";
import { ProgressDots } from "./progress-dots";

const JOB_OPTIONS = JOB_IDS.map((value) => ({ value, label: JOB_LABELS[value] }));
const TASK_OPTIONS = TASK_IDS.map((value) => ({
  value,
  label: TASK_LABELS[value],
}));
const PRIORITY_OPTIONS = PRIORITY_IDS.map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));

const STEP_META: Record<1 | 2 | 3 | 4, { title: string; subtitle: string }> = {
  1: { title: "당신의 MBTI는?", subtitle: "16유형 중 하나를 선택해주세요" },
  2: {
    title: "당신의 직무는?",
    subtitle: "해당하는 직무를 모두 선택해주세요 (1개 이상)",
  },
  3: {
    title: "주로 어떤 작업을 하시나요?",
    subtitle: "해당하는 작업을 모두 선택해주세요 (1개 이상)",
  },
  4: {
    title: "무엇이 가장 중요한가요?",
    subtitle: "중요하게 여기는 가치를 모두 선택해주세요 (1개 이상)",
  },
};

export function DiagnoseFlow() {
  const router = useRouter();
  const d = useDiagnosis();

  const handleAdvance = () => {
    if (!d.canAdvance) return;
    if (d.isLastStep) {
      if (d.resultPath) router.push(d.resultPath);
    } else {
      d.next();
    }
  };

  const meta = STEP_META[d.step];

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <ProgressDots current={d.step} total={4} />
      </div>

      <h1 className="mb-1 text-2xl font-bold">{meta.title}</h1>
      <p className="mb-8 text-sm text-muted-foreground">{meta.subtitle}</p>

      <div className="mb-10">
        {d.step === 1 && <MbtiGrid value={d.mbti} onChange={d.setMbti} />}
        {d.step === 2 && (
          <ChipMultiSelect
            options={JOB_OPTIONS}
            value={d.jobs}
            onChange={d.setJobs}
            ariaLabel="직무 다중 선택"
          />
        )}
        {d.step === 3 && (
          <ChipMultiSelect
            options={TASK_OPTIONS}
            value={d.tasks}
            onChange={d.setTasks}
            ariaLabel="작업 다중 선택"
          />
        )}
        {d.step === 4 && (
          <ChipMultiSelect
            options={PRIORITY_OPTIONS}
            value={d.priorities}
            onChange={d.setPriorities}
            ariaLabel="우선순위 다중 선택"
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={d.prev}
          disabled={d.step === 1}
          aria-label="이전 단계"
        >
          ← 이전
        </Button>
        <Button onClick={handleAdvance} disabled={!d.canAdvance}>
          {d.isLastStep ? "결과 보기" : "다음 →"}
        </Button>
      </div>
    </main>
  );
}
