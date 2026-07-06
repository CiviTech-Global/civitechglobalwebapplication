import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../hooks/useLocale";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  className?: string;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  keyField = "id",
  className,
  emptyMessage,
}: TableProps<T>) {
  const { t } = useLocale();

  const getField = (item: T, field: string) =>
    (item as Record<string, unknown>)[field];

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border-default bg-surface-50",
        className,
      )}
    >
      <table className="w-full text-sm">
        <thead className="bg-surface-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-start font-medium text-text-secondary",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-text-muted"
              >
                {emptyMessage || t.noData}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={String(getField(item, keyField))}
                className="hover:bg-surface-100 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3 text-text-primary", col.className)}
                  >
                    {col.render
                      ? col.render(item)
                      : String(getField(item, col.key) ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
