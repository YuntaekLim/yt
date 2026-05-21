import { describe, it, expect } from "vitest";
import { recommend } from "./recommend";
import { MODEL_IDS, MBTI16, type DiagnosisInput } from "@/types/recommender";

const sample: DiagnosisInput = {
  mbti: "INTJ",
  jobs: ["ai", "app"],
  tasks: ["code", "research"],
  priorities: ["accuracy", "creativity"],
};

describe("recommend", () => {
  it("returns a main model and 1-2 alternatives, all from the candidate pool", () => {
    const r = recommend(sample);
    expect(MODEL_IDS).toContain(r.main.id);
    expect(r.alternatives.length).toBeGreaterThanOrEqual(1);
    expect(r.alternatives.length).toBeLessThanOrEqual(2);
    for (const alt of r.alternatives) {
      expect(MODEL_IDS).toContain(alt.id);
      expect(alt.id).not.toBe(r.main.id);
    }
    // No duplicate alternatives either
    const altIds = r.alternatives.map((a) => a.id);
    expect(new Set(altIds).size).toBe(altIds.length);
  });

  it("is deterministic for the same input", () => {
    const a = recommend(sample);
    const b = recommend(sample);
    expect(a).toEqual(b);
  });

  it("embeds the user's MBTI, job, task, and priority labels in the reasoning", () => {
    const r = recommend(sample);
    expect(r.reasoning).toContain("INTJ");
    expect(r.reasoning).toContain("인공지능");
    expect(r.reasoning).toContain("어플리케이션SW");
    expect(r.reasoning).toContain("코드 작성·리뷰");
    expect(r.reasoning).toContain("기술 리서치·학습");
    expect(r.reasoning).toContain("정확성");
    expect(r.reasoning).toContain("창의성");
  });

  it("embeds the same labels in the system prompt", () => {
    const r = recommend(sample);
    expect(r.systemPrompt).toContain("INTJ");
    expect(r.systemPrompt).toContain("인공지능");
    expect(r.systemPrompt).toContain("어플리케이션SW");
    expect(r.systemPrompt).toContain("코드 작성·리뷰");
    expect(r.systemPrompt).toContain("기술 리서치·학습");
    expect(r.systemPrompt).toContain("정확성");
    expect(r.systemPrompt).toContain("창의성");
  });

  it("includes the main model's display name in the reasoning", () => {
    const r = recommend(sample);
    expect(r.reasoning).toContain(r.main.displayName);
  });

  it("produces a recommendation for every valid minimal input across all 16 MBTIs", () => {
    for (const mbti of MBTI16) {
      const r = recommend({
        mbti,
        jobs: ["plan"],
        tasks: ["code"],
        priorities: ["accuracy"],
      });
      expect(MODEL_IDS).toContain(r.main.id);
      expect(r.alternatives.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("returns the same recommendation when input arrays are passed in different order (relies on prior normalization)", () => {
    // recommend assumes normalized input but should still be stable to permutation
    const ordered = recommend({
      mbti: "ENFP",
      jobs: ["ai", "app"],
      tasks: ["code", "research"],
      priorities: ["accuracy", "creativity"],
    });
    const permuted = recommend({
      mbti: "ENFP",
      jobs: ["app", "ai"],
      tasks: ["research", "code"],
      priorities: ["creativity", "accuracy"],
    });
    expect(permuted.main.id).toBe(ordered.main.id);
    expect(permuted.alternatives.map((a) => a.id)).toEqual(
      ordered.alternatives.map((a) => a.id),
    );
  });
});
