import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import LoginPage from "./LoginPage";
import { translations } from "../../i18n";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();
const mockToast = vi.fn();

const t = translations.en;

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("../../hooks/useToast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("../../hooks/useLocale", () => ({
  useLocale: () => ({ t, isRtl: false }),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

vi.mock("../../assets/logos/concept logo - no bg - white.png", () => ({
  default: "",
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
    mockToast.mockReset();
  });

  it("renders login form", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: t.auth.signIn }));
    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid email/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Password must be at least 12 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("submits valid credentials", async () => {
    mockLogin.mockResolvedValue({ role: "USER" });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: t.auth.signIn }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "user@example.com",
        "Password123!",
      );
    });
  });
});
