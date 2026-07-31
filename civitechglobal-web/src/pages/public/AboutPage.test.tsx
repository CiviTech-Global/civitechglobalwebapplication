import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import AboutPage from "./AboutPage";
import { renderWithProviders } from "../../test/renderWithProviders";
import api from "../../config/api";
import { translations } from "../../i18n";

vi.mock("../../config/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("AboutPage", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } });
  });

  it("renders about page headings", async () => {
    renderWithProviders(<AboutPage />);
    expect(
      screen.getByRole("heading", { name: translations.en.about.title }),
    ).toBeInTheDocument();
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/content"));
  });
});
