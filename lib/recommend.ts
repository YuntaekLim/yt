import {
  MODEL_IDS,
  type DiagnosisInput,
  type ModelId,
  type Recommendation,
} from "@/types/recommender";
import { MODELS } from "@/data/models";
import { byJob, byMbti, byPriority, byTask } from "@/data/affinity";
import { buildReasoning, buildSystemPrompt } from "@/data/templates";
import { normalizeInput } from "./url-state";

export function recommend(input: DiagnosisInput): Recommendation {
  const normalized = normalizeInput(input);

  const scores: Record<ModelId, number> = {
    "claude-opus": 0,
    "claude-haiku": 0,
    "gpt-5": 0,
    "gpt-4o-mini": 0,
    "gemini-pro": 0,
  };

  for (const id of MODEL_IDS) {
    scores[id] += byMbti[normalized.mbti][id];
    for (const job of normalized.jobs) scores[id] += byJob[job][id];
    for (const task of normalized.tasks) scores[id] += byTask[task][id];
    for (const priority of normalized.priorities) {
      scores[id] += byPriority[priority][id];
    }
  }

  // Sort descending by score; on tie, fall back to MODEL_IDS declaration order
  // so the result is deterministic.
  const ranked: ModelId[] = [...MODEL_IDS].sort((a, b) => {
    const diff = scores[b] - scores[a];
    if (diff !== 0) return diff;
    return MODEL_IDS.indexOf(a) - MODEL_IDS.indexOf(b);
  });

  const main = MODELS[ranked[0]];
  const alternatives = ranked.slice(1, 3).map((id) => MODELS[id]);

  return {
    main,
    alternatives,
    reasoning: buildReasoning(normalized, main, alternatives),
    systemPrompt: buildSystemPrompt(normalized, main),
  };
}
