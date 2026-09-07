import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import PricingSection from "./pricing-section";

// Mock react-redux hooks
vi.mock("react-redux", () => ({
  useSelector: vi.fn((fn) => fn({ user: { user: null } })),
  useDispatch: vi.fn(() => vi.fn()),
}));

// Mock store wrapper
vi.mock("@/store", () => ({
  useAppSelector: vi.fn((fn) => fn({ user: { user: null } })),
}));

describe("PricingSection Component", () => {
  it("renders the pricing plan titles correctly", () => {
    render(<PricingSection />);

    // Verify presence of core plans
    expect(screen.getByText("GCP Cloud")).toBeInTheDocument();
    expect(screen.getByText("GCP Dedicated")).toBeInTheDocument();
    expect(screen.getByText("GCP Government")).toBeInTheDocument();
  });

  it("renders prices correctly", () => {
    render(<PricingSection />);

    // Cloud price
    expect(screen.getByText("$1,000")).toBeInTheDocument();

    // Dedicated price
    expect(screen.getByText("$2,500")).toBeInTheDocument();

    // Government price
    expect(screen.getByText("$5,000")).toBeInTheDocument();
  });

  it("renders the calls to action for pricing packages", () => {
    render(<PricingSection />);

    expect(screen.getByText("Deploy GCP Cloud")).toBeInTheDocument();
    expect(screen.getByText("Deploy GCP Dedicated")).toBeInTheDocument();
    expect(screen.getByText("Deploy GCP Government")).toBeInTheDocument();
  });
});
