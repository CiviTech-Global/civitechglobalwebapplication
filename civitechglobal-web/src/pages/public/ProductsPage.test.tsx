import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import ProductsPage from "./ProductsPage";
import { renderWithProviders } from "../../test/renderWithProviders";
import api from "../../config/api";
import { translations } from "../../i18n";

vi.mock("../../config/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("ProductsPage", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: [
          {
            id: "1",
            name: "CiviMap",
            slug: "civimap",
            description: "Mapping tool",
            category: "GIS",
            isActive: true,
          },
        ],
        meta: { page: 1, totalPages: 1 },
      },
    });
  });

  it("renders products page and loads products", async () => {
    renderWithProviders(<ProductsPage />);
    expect(
      screen.getByRole("heading", { name: translations.en.products.title }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/products?"),
      ),
    );
    expect(await screen.findByText("CiviMap")).toBeInTheDocument();
  });
});
