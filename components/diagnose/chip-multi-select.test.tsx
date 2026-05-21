import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChipMultiSelect, type ChipOption } from "./chip-multi-select";

const options: ChipOption<"ai" | "app" | "cloud">[] = [
  { value: "ai", label: "인공지능" },
  { value: "app", label: "어플리케이션SW" },
  { value: "cloud", label: "클라우드" },
];

describe("ChipMultiSelect", () => {
  it("renders one chip per option with its label", () => {
    render(
      <ChipMultiSelect options={options} value={[]} onChange={() => {}} />,
    );
    expect(
      screen.getByRole("button", { name: "인공지능" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "어플리케이션SW" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "클라우드" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("shows every chip as unselected when value is empty", () => {
    render(
      <ChipMultiSelect options={options} value={[]} onChange={() => {}} />,
    );
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("data-state", "off");
    }
  });

  it("shows chips matching value as selected", () => {
    render(
      <ChipMultiSelect
        options={options}
        value={["ai", "cloud"]}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "인공지능" }),
    ).toHaveAttribute("data-state", "on");
    expect(
      screen.getByRole("button", { name: "어플리케이션SW" }),
    ).toHaveAttribute("data-state", "off");
    expect(screen.getByRole("button", { name: "클라우드" })).toHaveAttribute(
      "data-state",
      "on",
    );
  });

  it("emits an updated array when an unselected chip is clicked", async () => {
    const onChange = vi.fn();
    render(
      <ChipMultiSelect
        options={options}
        value={["ai"]}
        onChange={onChange}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "어플리케이션SW" }),
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0] as string[];
    expect(new Set(arg)).toEqual(new Set(["ai", "app"]));
  });

  it("emits an array with the value removed when an already-selected chip is clicked", async () => {
    const onChange = vi.fn();
    render(
      <ChipMultiSelect
        options={options}
        value={["ai", "cloud"]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "인공지능" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(["cloud"]);
  });

  it("uses the passed aria-label on the group", () => {
    render(
      <ChipMultiSelect
        options={options}
        value={[]}
        onChange={() => {}}
        ariaLabel="직무 선택"
      />,
    );
    expect(screen.getByRole("group", { name: "직무 선택" })).toBeInTheDocument();
  });
});
