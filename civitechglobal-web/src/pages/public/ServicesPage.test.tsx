import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import ServicesPage from "./ServicesPage";
import { renderWithProviders } from "../../test/renderWithProviders";
import api from "../../config/api";
import { translations } from "../../i18n";

vi.mock("../../config/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("ServicesPage", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: [
          {
            id: "1",
            name: "Consulting",
            slug: "consulting",
            description: "Tech consulting",
            category: "Strategy",
            isActive: true,
          },
        ],
        meta: { page: 1, totalPages: 1 },
      },
    });
  });

  it("renders services page and loads services", async () => {
    renderWithProviders(<ServicesPage />);
    expect(
      screen.getByRole("heading", { name: translations.en.services.title }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/services?"),
      ),
    );
    expect(await screen.findByText("Consulting")).toBeInTheDocument();
  });
});
