export const MBTI16 = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;
export type MBTI16 = typeof MBTI16[number];

export const JOB_IDS = [
  "plan", "ai", "bigdata", "middleware", "app", "cloud", "sweng", "syssw",
] as const;
export type JobId = typeof JOB_IDS[number];

export const JOB_LABELS: Record<JobId, string> = {
  plan: "기획",
  ai: "인공지능",
  bigdata: "빅데이터",
  middleware: "미들웨어",
  app: "어플리케이션SW",
  cloud: "클라우드",
  sweng: "SW엔지니어링",
  syssw: "시스템SW",
};

export const TASK_IDS = [
  "code", "debug", "doc", "research", "data",
  "qa", "summary", "translate", "ideate", "prompt",
] as const;
export type TaskId = typeof TASK_IDS[number];

export const TASK_LABELS: Record<TaskId, string> = {
  code: "코드 작성·리뷰",
  debug: "디버깅·트러블슈팅",
  doc: "문서 작성",
  research: "기술 리서치·학습",
  data: "데이터 분석·SQL",
  qa: "테스트 케이스·QA",
  summary: "회의록·요약",
  translate: "번역·영문 작성",
  ideate: "아이디어 발산",
  prompt: "프롬프트 엔지니어링",
};

export const PRIORITY_IDS = ["accuracy", "speed", "cost", "creativity"] as const;
export type PriorityId = typeof PRIORITY_IDS[number];

export const PRIORITY_LABELS: Record<PriorityId, string> = {
  accuracy: "정확성",
  speed: "속도",
  cost: "비용",
  creativity: "창의성",
};

export const MODEL_IDS = [
  "claude-opus", "claude-haiku", "gpt-5", "gpt-4o-mini", "gemini-pro",
] as const;
export type ModelId = typeof MODEL_IDS[number];

export type DiagnosisInput = {
  mbti: MBTI16;
  jobs: JobId[];
  tasks: TaskId[];
  priorities: PriorityId[];
};

export type Model = {
  id: ModelId;
  displayName: string;
  vendor: "anthropic" | "openai" | "google";
  tier: "large" | "small";
  strengths: string[];
};

export type Recommendation = {
  main: Model;
  alternatives: Model[];
  reasoning: string;
  systemPrompt: string;
};
