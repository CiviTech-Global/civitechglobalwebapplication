import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactPage from "./ContactPage";
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

describe("ContactPage", () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockToast.mockReset();
  });

  it("renders contact form", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    mockPost.mockResolvedValue({ data: {} });
    render(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: "Hello" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "I need help." },
    });

    fireEvent.click(screen.getByRole("button", { name: t.contact.submit }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/tickets",
        expect.objectContaining({
          name: "Alice",
          email: "alice@example.com",
          subject: "Hello",
          description: "I need help.",
          category: "SUPPORT",
          priority: "MEDIUM",
        }),
      );
      expect(mockToast).toHaveBeenCalledWith(
        t.contact.submitSuccess,
        "success",
      );
    });
  });
});
