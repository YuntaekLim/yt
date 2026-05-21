import {
  type DiagnosisInput,
  type Model,
  JOB_LABELS,
  TASK_LABELS,
  PRIORITY_LABELS,
} from "@/types/recommender";

function joinKorean(items: string[]): string {
  return items.join(", ");
}

export function buildReasoning(
  input: DiagnosisInput,
  main: Model,
  alternatives: Model[],
): string {
  const jobs = joinKorean(input.jobs.map((j) => JOB_LABELS[j]));
  const tasks = joinKorean(input.tasks.map((t) => TASK_LABELS[t]));
  const priorities = joinKorean(input.priorities.map((p) => PRIORITY_LABELS[p]));
  const altsList = joinKorean(alternatives.map((a) => a.displayName));
  const strengthList = joinKorean(main.strengths);

  return [
    `${input.mbti} 성향의 사용자가 ${jobs} 직무에서 ${tasks} 작업을 주로 한다면 ${main.displayName}이(가) 가장 잘 맞습니다. 이 모델의 강점인 ${strengthList}이(가) 핵심 이유입니다.`,
    "",
    `특히 ${priorities}을(를) 중시하는 점을 고려할 때 ${main.displayName}의 균형이 결정적이었습니다. 상황에 따라 ${altsList}을(를) 함께 검토하면 좋습니다.`,
  ].join("\n");
}

export function buildSystemPrompt(
  input: DiagnosisInput,
  main: Model,
): string {
  const jobs = joinKorean(input.jobs.map((j) => JOB_LABELS[j]));
  const tasks = joinKorean(input.tasks.map((t) => TASK_LABELS[t]));
  const priorities = joinKorean(input.priorities.map((p) => PRIORITY_LABELS[p]));

  return [
    `당신은 ${input.mbti} 성향의 사용자를 돕는 ${main.displayName} 기반 AI 어시스턴트입니다.`,
    `사용자는 ${jobs} 직무에서 주로 ${tasks} 작업을 하며, ${priorities}을(를) 우선시합니다.`,
    "",
    "다음 원칙을 따르세요:",
    `- 응답의 깊이와 형식을 ${priorities}에 맞춰 조정합니다.`,
    `- ${tasks}에 적합한 패턴(구조화된 출력·코드 블록·근거 인용 등)을 적극 활용합니다.`,
    `- ${input.mbti} 성향의 사용자에게 어울리는 톤(명료함·일관성·핵심 우선)을 유지합니다.`,
  ].join("\n");
}
