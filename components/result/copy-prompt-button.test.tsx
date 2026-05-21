import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { CopyPromptButton } from "./copy-prompt-button";

describe("CopyPromptButton", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes the passed text to the clipboard on click", () => {
    render(<CopyPromptButton text="hello prompt" />);
    fireEvent.click(
      screen.getByRole("button", { name: "시스템 프롬프트 복사" }),
    );
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("hello prompt");
  });

  it("flips the label to '복사됨' and shows a toast immediately after click", () => {
    render(<CopyPromptButton text="prompt" />);
    fireEvent.click(
      screen.getByRole("button", { name: "시스템 프롬프트 복사" }),
    );
    expect(
      screen.getByRole("button", { name: "시스템 프롬프트 복사" }),
    ).toHaveTextContent("복사됨");
    expect(
      screen.getByText("시스템 프롬프트가 복사되었어요"),
    ).toBeInTheDocument();
  });

  it("restores the label and removes the toast after ~1.5s", () => {
    vi.useFakeTimers();
    render(<CopyPromptButton text="prompt" />);
    fireEvent.click(
      screen.getByRole("button", { name: "시스템 프롬프트 복사" }),
    );
    expect(
      screen.getByRole("button", { name: "시스템 프롬프트 복사" }),
    ).toHaveTextContent("복사됨");
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(
      screen.getByRole("button", { name: "시스템 프롬프트 복사" }),
    ).toHaveTextContent("복사");
    expect(
      screen.queryByText("시스템 프롬프트가 복사되었어요"),
    ).not.toBeInTheDocument();
  });
});
