import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDiagnosis } from "./use-diagnosis";

describe("useDiagnosis", () => {
  it("starts at step 1 with empty inputs and canAdvance=false", () => {
    const { result } = renderHook(() => useDiagnosis());
    expect(result.current.step).toBe(1);
    expect(result.current.mbti).toBeNull();
    expect(result.current.jobs).toEqual([]);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.priorities).toEqual([]);
    expect(result.current.canAdvance).toBe(false);
    expect(result.current.isLastStep).toBe(false);
    expect(result.current.resultPath).toBeNull();
  });

  it("enables advance only when the current step has a selection", () => {
    const { result } = renderHook(() => useDiagnosis());

    // Step 1
    expect(result.current.canAdvance).toBe(false);
    act(() => result.current.setMbti("INTJ"));
    expect(result.current.canAdvance).toBe(true);
    act(() => result.current.next());

    // Step 2 (jobs empty)
    expect(result.current.step).toBe(2);
    expect(result.current.canAdvance).toBe(false);
    act(() => result.current.setJobs(["ai"]));
    expect(result.current.canAdvance).toBe(true);
    act(() => result.current.next());

    // Step 3 (tasks empty)
    expect(result.current.step).toBe(3);
    expect(result.current.canAdvance).toBe(false);
    act(() => result.current.setTasks(["code"]));
    expect(result.current.canAdvance).toBe(true);
    act(() => result.current.next());

    // Step 4 (priorities empty, isLastStep true)
    expect(result.current.step).toBe(4);
    expect(result.current.isLastStep).toBe(true);
    expect(result.current.canAdvance).toBe(false);
    act(() => result.current.setPriorities(["accuracy"]));
    expect(result.current.canAdvance).toBe(true);
  });

  it("preserves selections when moving back to a prior step", () => {
    const { result } = renderHook(() => useDiagnosis());
    act(() => result.current.setMbti("INTJ"));
    act(() => result.current.next());
    act(() => result.current.setJobs(["ai", "app"]));
    act(() => result.current.next());
    act(() => result.current.prev());
    act(() => result.current.prev());
    expect(result.current.step).toBe(1);
    expect(result.current.mbti).toBe("INTJ");
    expect(result.current.jobs).toEqual(["ai", "app"]);
  });

  it("clamps step at 1 and 4", () => {
    const { result } = renderHook(() => useDiagnosis());
    act(() => result.current.prev());
    expect(result.current.step).toBe(1);

    act(() => result.current.setMbti("INTJ"));
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next()); // overshoot
    expect(result.current.step).toBe(4);
  });

  it("builds a result path with normalized ordering after full input", () => {
    const { result } = renderHook(() => useDiagnosis());
    act(() => result.current.setMbti("INTJ"));
    act(() => result.current.setJobs(["app", "ai"]));
    act(() => result.current.setTasks(["research", "code"]));
    act(() => result.current.setPriorities(["creativity", "accuracy"]));
    expect(result.current.resultPath).toBe(
      "/result?mbti=INTJ&jobs=ai,app&tasks=code,research&priorities=accuracy,creativity",
    );
  });

  it("returns null resultPath until every step is filled", () => {
    const { result } = renderHook(() => useDiagnosis());
    act(() => result.current.setMbti("INTJ"));
    expect(result.current.resultPath).toBeNull();
    act(() => result.current.setJobs(["ai"]));
    expect(result.current.resultPath).toBeNull();
    act(() => result.current.setTasks(["code"]));
    expect(result.current.resultPath).toBeNull();
    act(() => result.current.setPriorities(["accuracy"]));
    expect(result.current.resultPath).not.toBeNull();
  });
});
