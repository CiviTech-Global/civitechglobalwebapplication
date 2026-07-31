import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SupportPage from "./SupportPage";
import { translations } from "../../i18n";

const mockPost = vi.fn();
const mockToast = vi.fn();
const t = translations.en;

vi.mock("../../config/api", () => ({
  default: { post: (...args: unknown[]) => mockPost(...args) },
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("../../hooks/useToast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("../../hooks/useLocale", () => ({
  useLocale: () => ({ t, isRtl: false }),
}));

describe("SupportPage", () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockToast.mockReset();
  });

  it("renders support form", () => {
    render(<SupportPage />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(t.support.description_field),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t.support.priority)).toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    mockPost.mockResolvedValue({ data: {} });
    render(<SupportPage />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Bob" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bob@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: "Issue" },
    });
    fireEvent.change(screen.getByLabelText(t.support.description_field), {
      target: { value: "Details" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: t.support.submitTicket }),
    );

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/tickets",
        expect.objectContaining({
          name: "Bob",
          email: "bob@example.com",
          subject: "Issue",
          description: "Details",
          priority: "MEDIUM",
        }),
      );
      expect(mockToast).toHaveBeenCalledWith(
        t.support.submitSuccess,
        "success",
      );
    });
  });
});
