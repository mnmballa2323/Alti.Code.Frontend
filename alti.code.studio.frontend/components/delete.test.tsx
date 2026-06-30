import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import DeleteModal from "./delete";

describe("DeleteModal Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <DeleteModal
        isOpen={false}
        title="item"
        onClose={() => {}}
        onLogout={() => {}}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders when isOpen is true with the correct title", () => {
    render(
      <DeleteModal
        isOpen={true}
        title="project"
        onClose={() => {}}
        onLogout={() => {}}
      />,
    );
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this project?"),
    ).toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", () => {
    const onCloseMock = vi.fn();

    render(
      <DeleteModal
        isOpen={true}
        title="item"
        onClose={onCloseMock}
        onLogout={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onLogout when Delete button is clicked", () => {
    const onLogoutMock = vi.fn();

    render(
      <DeleteModal
        isOpen={true}
        title="item"
        onClose={() => {}}
        onLogout={onLogoutMock}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onLogoutMock).toHaveBeenCalledTimes(1);
  });
});
