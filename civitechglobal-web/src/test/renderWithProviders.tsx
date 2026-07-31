/* eslint-disable react-refresh/only-export-components */
import { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { LocaleContext } from "../contexts/LocaleContext";
import { translations } from "../i18n";

const testQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

interface ProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter>
        <LocaleContext.Provider
          value={{
            locale: "en",
            t: translations.en,
            setLocale: () => {},
            dir: "ltr",
            isRtl: false,
          }}
        >
          {children}
        </LocaleContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}
