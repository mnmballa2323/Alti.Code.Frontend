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
 expect(screen.getByText("Cloud")).toBeInTheDocument();
 expect(screen.getByText("Dedicated")).toBeInTheDocument();
 expect(screen.getByText("Sovereign")).toBeInTheDocument();
 });

 it("renders prices and billing commitments correctly", () => {
 render(<PricingSection />);

 // Cloud price & commitment
 expect(screen.getByText("$1,000")).toBeInTheDocument();
 expect(screen.getByText(/Min. 1 seat/)).toBeInTheDocument();

 // Dedicated price & commitment
 expect(screen.getByText("$2,500")).toBeInTheDocument();
 expect(screen.getByText(/Min. 5 seats/)).toBeInTheDocument();
 });

 it("renders the calls to action for pricing packages", () => {
 render(<PricingSection />);

 expect(screen.getByText("Deploy Cloud")).toBeInTheDocument();
 expect(screen.getByText("Deploy Dedicated")).toBeInTheDocument();
 expect(screen.getByText("Deploy Sovereign")).toBeInTheDocument();
 });
});
