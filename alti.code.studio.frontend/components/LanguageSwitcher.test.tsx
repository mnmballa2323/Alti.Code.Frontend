import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { LanguageSwitcher } from "./LanguageSwitcher";

// Mock the I18nProvider hook
const mockSetLocale = vi.fn();

vi.mock("@/components/providers/I18nProvider", () => ({
  useI18n: () => ({
    locale: "en",
    setLocale: mockSetLocale,
  }),
}));

describe("LanguageSwitcher Component", () => {
  it("renders with current locale", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText("en")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /toggle language/i }),
    ).toBeInTheDocument();
  });

  it("calls setLocale with 'es' when clicked and current is 'en'", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /toggle language/i }));
    expect(mockSetLocale).toHaveBeenCalledWith("es");
  });
});
