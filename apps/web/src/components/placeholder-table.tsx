import { cn } from "@/lib/utils";

type Column = {
  key: string;
  label: string;
  align?: "left" | "right";
};

type PlaceholderTableProps = {
  columns: Column[];
  rows: Array<Record<string, string>>;
};

export function PlaceholderTable({ columns, rows }: PlaceholderTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-[#d8ded8] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#d8ded8] text-sm">
          <thead className="bg-[#f8faf7]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-4 py-3 font-semibold text-[#58645d]",
                    column.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf1ec]">
            {rows.map((row, index) => (
              <tr key={`${row[columns[0].key]}-${index}`} className="hover:bg-[#fbfcfa]">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap px-4 py-4 text-[#1f2933]",
                      column.align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
