import { describe, it, expect } from "vitest";
import {
  parseInputFromSearchParams,
  serializeInput,
  normalizeInput,
} from "./url-state";

describe("parseInputFromSearchParams", () => {
  it("parses a valid query string into a normalized input", () => {
    const params = new URLSearchParams(
      "mbti=INTJ&jobs=ai,app&tasks=code,research&priorities=accuracy,creativity",
    );
    expect(parseInputFromSearchParams(params)).toEqual({
      mbti: "INTJ",
      jobs: ["ai", "app"],
      tasks: ["code", "research"],
      priorities: ["accuracy", "creativity"],
    });
  });

  it("returns null when mbti is missing", () => {
    const params = new URLSearchParams(
      "jobs=ai&tasks=code&priorities=accuracy",
    );
    expect(parseInputFromSearchParams(params)).toBeNull();
  });

  it("returns null when mbti is an unknown 4-letter code", () => {
    const params = new URLSearchParams(
      "mbti=ZZZZ&jobs=ai&tasks=code&priorities=accuracy",
    );
    expect(parseInputFromSearchParams(params)).toBeNull();
  });

  it("filters unknown jobs but keeps recognized ones", () => {
    const params = new URLSearchParams(
      "mbti=INTJ&jobs=ai,not-a-job&tasks=code&priorities=accuracy",
    );
    expect(parseInputFromSearchParams(params)).toEqual({
      mbti: "INTJ",
      jobs: ["ai"],
      tasks: ["code"],
      priorities: ["accuracy"],
    });
  });

  it("returns null when every job is unknown", () => {
    const params = new URLSearchParams(
      "mbti=INTJ&jobs=nope&tasks=code&priorities=accuracy",
    );
    expect(parseInputFromSearchParams(params)).toBeNull();
  });

  it("returns null when every task is unknown", () => {
    const params = new URLSearchParams(
      "mbti=INTJ&jobs=ai&tasks=nope&priorities=accuracy",
    );
    expect(parseInputFromSearchParams(params)).toBeNull();
  });

  it("returns null when every priority is unknown", () => {
    const params = new URLSearchParams(
      "mbti=INTJ&jobs=ai&tasks=code&priorities=nope",
    );
    expect(parseInputFromSearchParams(params)).toBeNull();
  });

  it("yields the same result regardless of the order of multi-select values", () => {
    const a = parseInputFromSearchParams(
      new URLSearchParams(
        "mbti=INTJ&jobs=app,ai&tasks=research,code&priorities=creativity,accuracy",
      ),
    );
    const b = parseInputFromSearchParams(
      new URLSearchParams(
        "mbti=INTJ&jobs=ai,app&tasks=code,research&priorities=accuracy,creativity",
      ),
    );
    expect(a).toEqual(b);
  });

  it("accepts a plain object (Next.js searchParams shape)", () => {
    const input = parseInputFromSearchParams({
      mbti: "INTJ",
      jobs: "ai,app",
      tasks: "code",
      priorities: "accuracy",
    });
    expect(input).toEqual({
      mbti: "INTJ",
      jobs: ["ai", "app"],
      tasks: ["code"],
      priorities: ["accuracy"],
    });
  });
});

describe("normalizeInput", () => {
  it("sorts every multi-select array alphabetically", () => {
    const normalized = normalizeInput({
      mbti: "INTJ",
      jobs: ["app", "ai"],
      tasks: ["research", "code"],
      priorities: ["creativity", "accuracy"],
    });
    expect(normalized).toEqual({
      mbti: "INTJ",
      jobs: ["ai", "app"],
      tasks: ["code", "research"],
      priorities: ["accuracy", "creativity"],
    });
  });
});

describe("serializeInput", () => {
  it("emits a query string in normalized order with literal commas", () => {
    const qs = serializeInput({
      mbti: "INTJ",
      jobs: ["app", "ai"],
      tasks: ["research", "code"],
      priorities: ["creativity", "accuracy"],
    });
    expect(qs).toBe(
      "mbti=INTJ&jobs=ai,app&tasks=code,research&priorities=accuracy,creativity",
    );
  });
});
