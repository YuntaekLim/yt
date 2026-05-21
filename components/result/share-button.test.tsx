import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ShareButton } from "./share-button";

describe("ShareButton", () => {
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

  it("copies the current page URL to the clipboard on click", () => {
    render(<ShareButton />);
    fireEvent.click(screen.getByRole("button", { name: "결과 URL 공유" }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });

  it("flips the label to '공유됨' and shows a toast immediately after click", () => {
    render(<ShareButton />);
    fireEvent.click(screen.getByRole("button", { name: "결과 URL 공유" }));
    expect(
      screen.getByRole("button", { name: "결과 URL 공유" }),
    ).toHaveTextContent("공유됨");
    expect(screen.getByText("URL이 복사되었어요")).toBeInTheDocument();
  });

  it("restores the label and removes the toast after ~1.5s", () => {
    vi.useFakeTimers();
    render(<ShareButton />);
    fireEvent.click(screen.getByRole("button", { name: "결과 URL 공유" }));
    expect(
      screen.getByRole("button", { name: "결과 URL 공유" }),
    ).toHaveTextContent("공유됨");
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(
      screen.getByRole("button", { name: "결과 URL 공유" }),
    ).toHaveTextContent("공유");
    expect(screen.queryByText("URL이 복사되었어요")).not.toBeInTheDocument();
  });
});
