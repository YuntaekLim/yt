import { type Model, type ModelId } from "@/types/recommender";

export const MODELS: Record<ModelId, Model> = {
  "claude-opus": {
    id: "claude-opus",
    displayName: "Claude Opus 4.7",
    vendor: "anthropic",
    tier: "large",
    strengths: ["깊은 추론", "복잡한 코드 분석", "긴 글 작성"],
  },
  "claude-haiku": {
    id: "claude-haiku",
    displayName: "Claude Haiku 4.5",
    vendor: "anthropic",
    tier: "small",
    strengths: ["빠른 응답", "저비용 반복 작업", "요약·번역에 강함"],
  },
  "gpt-5": {
    id: "gpt-5",
    displayName: "GPT-5",
    vendor: "openai",
    tier: "large",
    strengths: ["구조화된 출력", "정확한 코드 생성", "강력한 reasoning"],
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    displayName: "GPT-4o mini",
    vendor: "openai",
    tier: "small",
    strengths: ["저비용", "빠른 속도", "간단한 작업에 최적"],
  },
  "gemini-pro": {
    id: "gemini-pro",
    displayName: "Gemini 2.5 Pro",
    vendor: "google",
    tier: "large",
    strengths: ["긴 컨텍스트", "멀티모달 분석", "기술 리서치에 적합"],
  },
};
