import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import RegisterPage from "./RegisterPage";
import { translations } from "../../i18n";

const mockRegister = vi.fn();
const mockNavigate = vi.fn();
const mockToast = vi.fn();
const t = translations.en;

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ register: mockRegister }),
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

describe("RegisterPage", () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
    mockToast.mockReset();
  });

  it("renders registration form", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: t.auth.signUp }));
    await waitFor(() => {
      expect(
        screen.getAllByText(/This field is required/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it("submits valid registration", async () => {
    mockRegister.mockResolvedValue({ role: "USER" });
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: t.auth.signUp }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "Password123!",
      });
    });
  });
});
