import {
  type ModelId,
  type MBTI16,
  type JobId,
  type TaskId,
  type PriorityId,
} from "@/types/recommender";

type AffinityRow = Record<ModelId, number>;

/**
 * Affinity scores are illustrative — recommendations are tuned via aggregate
 * score, not any single dimension. Values 0-5 keep the math readable.
 */
const row = (
  opus: number,
  haiku: number,
  gpt5: number,
  mini: number,
  gemini: number,
): AffinityRow => ({
  "claude-opus": opus,
  "claude-haiku": haiku,
  "gpt-5": gpt5,
  "gpt-4o-mini": mini,
  "gemini-pro": gemini,
});

// MBTI archetypes:
//  - Analyst (NT): deep reasoning lean → opus, gpt-5
//  - Diplomat (NF): creative/empathic lean → opus, gemini
//  - Sentinel (SJ): efficiency lean → haiku, mini, gpt-5
//  - Explorer (SP): flexible/practical lean → gemini, mini
export const byMbti: Record<MBTI16, AffinityRow> = {
  INTJ: row(5, 1, 4, 1, 2),
  INTP: row(5, 1, 4, 1, 2),
  ENTJ: row(4, 2, 5, 1, 1),
  ENTP: row(4, 2, 4, 1, 3),
  INFJ: row(4, 2, 2, 1, 4),
  INFP: row(3, 2, 1, 1, 5),
  ENFJ: row(3, 3, 2, 1, 4),
  ENFP: row(3, 2, 1, 1, 5),
  ISTJ: row(2, 4, 4, 3, 1),
  ISFJ: row(1, 4, 2, 3, 2),
  ESTJ: row(2, 4, 4, 3, 1),
  ESFJ: row(1, 4, 2, 3, 2),
  ISTP: row(3, 3, 3, 2, 3),
  ISFP: row(1, 3, 1, 2, 4),
  ESTP: row(2, 4, 3, 3, 2),
  ESFP: row(1, 4, 1, 3, 3),
};

export const byJob: Record<JobId, AffinityRow> = {
  plan: row(4, 1, 2, 1, 5),
  ai: row(5, 1, 4, 1, 3),
  bigdata: row(4, 1, 5, 2, 3),
  middleware: row(4, 2, 4, 2, 1),
  app: row(4, 4, 4, 3, 2),
  cloud: row(4, 2, 4, 2, 2),
  sweng: row(5, 2, 4, 2, 2),
  syssw: row(5, 1, 4, 1, 1),
};

export const byTask: Record<TaskId, AffinityRow> = {
  code: row(5, 2, 5, 2, 2),
  debug: row(5, 2, 4, 1, 2),
  doc: row(4, 2, 2, 2, 4),
  research: row(4, 1, 2, 1, 5),
  data: row(4, 1, 5, 2, 3),
  qa: row(4, 2, 5, 2, 2),
  summary: row(2, 5, 2, 4, 2),
  translate: row(2, 5, 2, 4, 2),
  ideate: row(5, 1, 2, 1, 4),
  prompt: row(5, 2, 4, 1, 2),
};

export const byPriority: Record<PriorityId, AffinityRow> = {
  accuracy: row(5, 2, 5, 1, 2),
  speed: row(1, 5, 2, 5, 2),
  cost: row(1, 4, 1, 5, 2),
  creativity: row(5, 1, 2, 1, 5),
};
