import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultCard } from "./result-card";
import { AlternativeCard } from "./alternative-card";
import type { Model } from "@/types/recommender";

const opus: Model = {
  id: "claude-opus",
  displayName: "Claude Opus 4.7",
  vendor: "anthropic",
  tier: "large",
  strengths: ["깊은 추론", "복잡한 코드 분석", "긴 글 작성"],
};

describe("ResultCard", () => {
  it("renders the model display name", () => {
    render(
      <ResultCard
        model={opus}
        reasoning="reason"
        systemPrompt="prompt"
        promptAction={<button>복사</button>}
      />,
    );
    expect(screen.getByText("Claude Opus 4.7")).toBeInTheDocument();
  });

  it("renders the reasoning text verbatim", () => {
    const text = "이것이 추천 근거입니다.";
    render(
      <ResultCard
        model={opus}
        reasoning={text}
        systemPrompt="prompt"
        promptAction={<button>복사</button>}
      />,
    );
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("renders the system prompt text verbatim inside a pre block", () => {
    const text = "이것이 시스템 프롬프트 본문입니다.";
    render(
      <ResultCard
        model={opus}
        reasoning="reason"
        systemPrompt={text}
        promptAction={<button>복사</button>}
      />,
    );
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("renders the promptAction slot exactly as passed", () => {
    render(
      <ResultCard
        model={opus}
        reasoning="r"
        systemPrompt="p"
        promptAction={<button>커스텀 복사</button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "커스텀 복사" }),
    ).toBeInTheDocument();
  });
});

describe("AlternativeCard", () => {
  it("renders model name and the first strength as tagline", () => {
    render(<AlternativeCard model={opus} />);
    expect(screen.getByText("Claude Opus 4.7")).toBeInTheDocument();
    expect(screen.getByText("깊은 추론")).toBeInTheDocument();
  });

  it("joins remaining strengths into a short description", () => {
    render(<AlternativeCard model={opus} />);
    expect(
      screen.getByText("복잡한 코드 분석 · 긴 글 작성"),
    ).toBeInTheDocument();
  });
});
