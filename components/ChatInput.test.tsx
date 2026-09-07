import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import ChatInput from "./ChatInput";

describe("ChatInput Component", () => {
  it("renders with an empty input", () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText("Prompt alti code studio");

    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("updates input value when typing", () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText("Prompt alti code studio");

    fireEvent.change(input, { target: { value: "Hello world" } });
    expect(input).toHaveValue("Hello world");
  });
});
