import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MbtiGrid } from "./mbti-grid";
import { MBTI16 } from "@/types/recommender";
import { ProgressDots } from "./progress-dots";

describe("MbtiGrid", () => {
  it("renders all 16 MBTI types as radio buttons", () => {
    render(<MbtiGrid value={null} onChange={() => {}} />);
    for (const type of MBTI16) {
      expect(screen.getByRole("radio", { name: type })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("radio")).toHaveLength(16);
  });

  it("marks no cell as selected when value is null", () => {
    render(<MbtiGrid value={null} onChange={() => {}} />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("aria-checked", "false");
    }
  });

  it("marks the matching cell as selected when value is set", () => {
    render(<MbtiGrid value="INTJ" onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "INTJ" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "ENFP" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("calls onChange with the clicked type", async () => {
    const onChange = vi.fn();
    render(<MbtiGrid value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "INTJ" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("INTJ");
  });

  it("supports re-selecting a different cell (single-select)", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MbtiGrid value="INTJ" onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("radio", { name: "ENFP" }));
    expect(onChange).toHaveBeenCalledWith("ENFP");

    rerender(<MbtiGrid value="ENFP" onChange={onChange} />);
    expect(screen.getByRole("radio", { name: "ENFP" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "INTJ" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });
});

describe("ProgressDots", () => {
  it("renders `total` dots", () => {
    render(<ProgressDots current={1} total={4} />);
    for (let i = 0; i < 4; i++) {
      expect(screen.getByTestId(`progress-dot-${i}`)).toBeInTheDocument();
    }
  });

  it("marks the first `current` dots as active and the rest as inactive", () => {
    render(<ProgressDots current={2} total={4} />);
    expect(screen.getByTestId("progress-dot-0")).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByTestId("progress-dot-1")).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByTestId("progress-dot-2")).toHaveAttribute(
      "data-active",
      "false",
    );
    expect(screen.getByTestId("progress-dot-3")).toHaveAttribute(
      "data-active",
      "false",
    );
  });

  it("shows the current/total counter text", () => {
    render(<ProgressDots current={3} total={4} />);
    expect(screen.getByText("3 / 4")).toBeInTheDocument();
  });
});
