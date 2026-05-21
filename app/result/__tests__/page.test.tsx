import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`__REDIRECT__:${path}`);
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import ResultPage from "../page";
import { MODELS } from "@/data/models";

const validParams = {
  mbti: "INTJ",
  jobs: "ai,app",
  tasks: "code,research",
  priorities: "accuracy,creativity",
};

const modelNames = Object.values(MODELS).map((m) => m.displayName);

describe("ResultPage (server component)", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    cleanup();
  });

  it("renders a model name from the candidate pool for valid params", async () => {
    const element = await ResultPage({
      searchParams: Promise.resolve({ ...validParams }),
    });
    render(<>{element}</>);
    const present = modelNames.some((n) => screen.queryByText(n));
    expect(present).toBe(true);
  });

  it("renders an input-summary line with the user's MBTI and label values", async () => {
    const element = await ResultPage({
      searchParams: Promise.resolve({ ...validParams }),
    });
    render(<>{element}</>);
    const text = document.body.textContent ?? "";
    expect(text).toContain("당신의 진단");
    expect(text).toContain("INTJ");
    expect(text).toContain("인공지능");
    expect(text).toContain("어플리케이션SW");
    expect(text).toContain("코드 작성·리뷰");
    expect(text).toContain("기술 리서치·학습");
    expect(text).toContain("정확성");
    expect(text).toContain("창의성");
  });

  it("shows 1-2 alternative cards distinct from the main", async () => {
    const element = await ResultPage({
      searchParams: Promise.resolve({ ...validParams }),
    });
    render(<>{element}</>);
    const text = document.body.textContent ?? "";
    expect(text).toContain("대안");
    // exactly one of the candidates appears as the main, others as alts
    const present = modelNames.filter((n) => text.includes(n));
    expect(present.length).toBeGreaterThanOrEqual(2); // main + at least 1 alt
    expect(present.length).toBeLessThanOrEqual(3); // main + up to 2 alts
  });

  it("provides a link back to the diagnose start page", async () => {
    const element = await ResultPage({
      searchParams: Promise.resolve({ ...validParams }),
    });
    render(<>{element}</>);
    const link = screen.getByRole("link", { name: "다시 진단하기" });
    expect(link).toHaveAttribute("href", "/");
  });

  it("redirects to '/' when mbti is missing", async () => {
    await expect(
      ResultPage({
        searchParams: Promise.resolve({
          jobs: "ai",
          tasks: "code",
          priorities: "accuracy",
        }),
      }),
    ).rejects.toThrow(/__REDIRECT__:\/$/);
    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("redirects to '/' when mbti is an unknown code", async () => {
    await expect(
      ResultPage({
        searchParams: Promise.resolve({
          mbti: "ZZZZ",
          jobs: "ai",
          tasks: "code",
          priorities: "accuracy",
        }),
      }),
    ).rejects.toThrow(/__REDIRECT__:\/$/);
  });

  it("redirects to '/' when every job is unknown", async () => {
    await expect(
      ResultPage({
        searchParams: Promise.resolve({
          mbti: "INTJ",
          jobs: "not-a-job",
          tasks: "code",
          priorities: "accuracy",
        }),
      }),
    ).rejects.toThrow(/__REDIRECT__:\/$/);
  });

  it("returns identical content for the same URL (deterministic matching)", async () => {
    const a = await ResultPage({
      searchParams: Promise.resolve({ ...validParams }),
    });
    const { container: cA } = render(<>{a}</>);
    const textA = cA.textContent ?? "";
    cleanup();
    const b = await ResultPage({
      searchParams: Promise.resolve({ ...validParams }),
    });
    const { container: cB } = render(<>{b}</>);
    const textB = cB.textContent ?? "";
    expect(textA).toBe(textB);
  });

  it("does not include personal identifiers in the response HTML", async () => {
    const element = await ResultPage({
      searchParams: Promise.resolve({ ...validParams }),
    });
    render(<>{element}</>);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/@/); // no email
    expect(text).not.toMatch(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/); // no IP
    expect(text).not.toMatch(/session/i);
    expect(text).not.toMatch(/cookie/i);
  });
});
