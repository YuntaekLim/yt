import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), back: vi.fn() }),
}));

import { DiagnoseFlow } from "./diagnose-flow";

describe("DiagnoseFlow", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("renders step 1 with the MBTI grid, progress 1/4, and a disabled Next", () => {
    render(<DiagnoseFlow />);
    expect(screen.getByText("당신의 MBTI는?")).toBeInTheDocument();
    expect(screen.getByText("1 / 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음 →" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "이전 단계" })).toBeDisabled();
  });

  it("enables Next once an MBTI is selected", async () => {
    render(<DiagnoseFlow />);
    await userEvent.click(screen.getByRole("radio", { name: "INTJ" }));
    expect(screen.getByRole("button", { name: "다음 →" })).toBeEnabled();
  });

  it("advances to step 2 (jobs) on Next, showing progress 2/4 and disabled Next", async () => {
    render(<DiagnoseFlow />);
    await userEvent.click(screen.getByRole("radio", { name: "INTJ" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 →" }));
    expect(screen.getByText("당신의 직무는?")).toBeInTheDocument();
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음 →" })).toBeDisabled();
  });

  it("walks through every step and routes to /result with the full query string", async () => {
    render(<DiagnoseFlow />);
    await userEvent.click(screen.getByRole("radio", { name: "INTJ" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 →" }));

    await userEvent.click(screen.getByRole("button", { name: "인공지능" }));
    await userEvent.click(
      screen.getByRole("button", { name: "어플리케이션SW" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "다음 →" }));

    await userEvent.click(screen.getByRole("button", { name: "코드 작성·리뷰" }));
    await userEvent.click(
      screen.getByRole("button", { name: "기술 리서치·학습" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "다음 →" }));

    // Step 4 — button label changes to "결과 보기"
    expect(screen.getByText("무엇이 가장 중요한가요?")).toBeInTheDocument();
    expect(screen.getByText("4 / 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "결과 보기" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "정확성" }));
    await userEvent.click(screen.getByRole("button", { name: "창의성" }));
    expect(screen.getByRole("button", { name: "결과 보기" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "결과 보기" }));
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(
      "/result?mbti=INTJ&jobs=ai,app&tasks=code,research&priorities=accuracy,creativity",
    );
  });

  it("preserves selections when navigating with the Back button", async () => {
    render(<DiagnoseFlow />);
    await userEvent.click(screen.getByRole("radio", { name: "ENFP" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 →" }));
    await userEvent.click(screen.getByRole("button", { name: "인공지능" }));
    await userEvent.click(screen.getByRole("button", { name: "이전 단계" }));
    expect(screen.getByRole("radio", { name: "ENFP" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
