import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import NotFoundPage from "./NotFoundPage";
import { translations } from "../../i18n";

vi.mock("../../hooks/useLocale", () => ({
  useLocale: () => ({ t: translations.en, isRtl: false }),
}));

describe("NotFoundPage", () => {
  it("renders 404 content and back link", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: translations.en.notFound.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(translations.en.notFound.description),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: translations.en.notFound.backHome }),
    ).toBeInTheDocument();
  });
});
