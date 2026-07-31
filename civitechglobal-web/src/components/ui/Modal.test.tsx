import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("does not render when closed", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={false} onClose={onClose}>
        Hidden
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders children and title when open", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Modal Title">
        <button>Action</button>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Modal Title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /action/i })).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="T">
        Content
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText(/close dialog/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
