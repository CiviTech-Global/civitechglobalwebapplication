import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithProviders } from "../../test/renderWithProviders";
import api from "../../config/api";
import { translations } from "../../i18n";

vi.mock("../../config/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes("/products")) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "1",
                name: "CiviMap",
                slug: "civimap",
                description: "Map product",
                category: "GIS",
                isActive: true,
              },
            ],
          },
        });
      }
      if (url.includes("/services")) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "1",
                name: "Consulting",
                slug: "consulting",
                description: "Consulting service",
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  it("renders home page sections and preview data", async () => {
    renderWithProviders(<HomePage />);
    expect(
      screen.getByText(translations.en.home.heroDescription),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/products?page=1&limit=7"),
    );
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/services?page=1&limit=4"),
    );
    expect(screen.getByText("CiviMap")).toBeInTheDocument();
    expect(screen.getByText("Consulting")).toBeInTheDocument();
  });
});
