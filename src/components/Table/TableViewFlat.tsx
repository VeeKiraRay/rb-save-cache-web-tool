import React, { useCallback, useState } from "react";
import {
  flexRender,
  type ColumnOrderState,
  type Table,
} from "@tanstack/react-table";
import type SongRowCombined from "@/types/file/SongRowCombined";

interface TableProps {
  data: SongRowCombined[];
  reactTable: Table<SongRowCombined>;
  setColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>;
}

const TableViewFlat = ({ data, reactTable, setColumnOrder }: TableProps) => {
  const [dragCol, setDragCol] = useState<string | null>(null);

  // --- Column drag-and-drop reorder ---
  const handleDragStart = useCallback((colId: string) => setDragCol(colId), []);
  const handleDragEnd = useCallback(() => setDragCol(null), []);
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLElement>, targetId: string) => {
      e.preventDefault();
      if (!dragCol || dragCol === targetId) return;
      setColumnOrder((prev) => {
        const next = [...prev];
        const fromIdx = next.indexOf(dragCol as string);
        const toIdx = next.indexOf(targetId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, dragCol as string);
        return next;
      });
    },
    [dragCol, setColumnOrder],
  );

  if (data.length === 0) {
    return (
      <div className="rbscv-empty">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--rbscv-border-light)"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 3v18" />
        </svg>
        <span className="rbscv-empty__title">No data loaded</span>
      </div>
    );
  }

  const rows = reactTable.getRowModel().rows;

  return (
    <>
      <div className="rbscv-table-wrap">
        <table className="rbscv-table rbscv-table-flat">
          <thead>
            {reactTable.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className="rbscv-th"
                      style={{ minWidth: header.getSize() }}
                      onDragOver={(e) => handleDragOver(e, header.column.id)}
                    >
                      <div className="rbscv-th__inner">
                        <span
                          className="rbscv-th__sort-target"
                          draggable
                          onDragStart={() => handleDragStart(header.column.id)}
                          onDragEnd={handleDragEnd}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={`rbscv-tr ${index % 2 === 0 ? "rbscv-tr--even" : "rbscv-tr--odd"}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="rbscv-td"
                    style={{
                      minWidth: cell.column.getSize(),
                      whiteSpace: "nowrap",
                    }}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TableViewFlat;
