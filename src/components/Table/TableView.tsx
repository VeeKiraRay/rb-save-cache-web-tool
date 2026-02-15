import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  flexRender,
  type ColumnOrderState,
  type Table,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import ColumnFilterDropdown from "./ColumnFilterDropdown";
import type SongRowCombined from "@/types/file/SongRowCombined";

interface TableProps {
  data: SongRowCombined[];
  reactTable: Table<SongRowCombined>;
  setColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>;
}

const TableView = ({ data, reactTable, setColumnOrder }: TableProps) => {
  const parentRef = React.useRef(null);
  const [dragCol, setDragCol] = useState<string | null>(null);

  // Virtualizer: only render visible rows
  const rowVirtualizer = useVirtualizer({
    count: reactTable.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    measureElement: (el) => el.getBoundingClientRect().height,
    overscan: 10,
  });

  // Virtualizer: only render visible columns
  const visibleColumns = reactTable.getVisibleLeafColumns();
  const columnVirtualizer = useVirtualizer({
    count: visibleColumns.length,
    estimateSize: (index) => visibleColumns[index].getSize(),
    getScrollElement: () => parentRef.current,
    horizontal: true,
    overscan: 3,
  });

  const virtualColumns = columnVirtualizer.getVirtualItems();
  const totalColumnsWidth = columnVirtualizer.getTotalSize();

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

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!openFilter) return;

    const handleClickOutside = (e) => {
      // Don't close if clicking inside the dropdown itself
      const dropdown = document.querySelector(".rbscv-filter-dropdown");
      if (dropdown?.contains(e.target)) return;

      // Don't close if clicking a filter button (let the toggle handle it)
      const isFilterBtn = e.target.closest(".rbscv-th__filter-btn");
      if (isFilterBtn) return;

      setOpenFilter(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openFilter]);

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

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const leftPad = virtualColumns[0]?.start ?? 0;
  const rightPad =
    totalColumnsWidth - (virtualColumns.at(-1)?.end ?? totalColumnsWidth);

  return (
    <>
      <div className="rbscv-table-wrap" ref={parentRef}>
        <table className="rbscv-table" style={{ width: totalColumnsWidth }}>
          <thead>
            {reactTable.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{ display: "flex", width: totalColumnsWidth }}
              >
                {leftPad > 0 && (
                  <th
                    style={{
                      width: leftPad,
                      flexShrink: 0,
                      padding: 0,
                      border: 0,
                    }}
                  />
                )}
                {virtualColumns.map((virtualColumn) => {
                  const header = headerGroup.headers[virtualColumn.index];
                  if (!header) return null;
                  const isSorted = header.column.getIsSorted();
                  const filterValue = header.column.getFilterValue() as
                    | Set<unknown>
                    | undefined;
                  const hasFilterActive = (filterValue?.size ?? 0) > 0;

                  return (
                    <th
                      key={header.id}
                      className={`rbscv-th${isSorted ? " rbscv-th--sorted" : ""}`}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        flexShrink: 0,
                        position: "relative",
                      }}
                      onDragOver={(e) => handleDragOver(e, header.column.id)}
                    >
                      <div className="rbscv-th__inner">
                        <span
                          className="rbscv-th__sort-target"
                          draggable
                          onDragStart={() => handleDragStart(header.column.id)}
                          onDragEnd={handleDragEnd}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {isSorted && (
                            <span className="rbscv-th__sort-arrow">
                              {isSorted === "asc" ? "▲" : "▼"}
                            </span>
                          )}
                        </span>

                        {header.column.columnDef.meta?.isFiltrable && (
                          <button
                            ref={(el) => {
                              filterBtnRefs.current[header.column.id] = el;
                            }}
                            className={`rbscv-th__filter-btn${hasFilterActive ? " rbscv-th__filter-btn--active" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenFilter(
                                openFilter === header.column.id
                                  ? null
                                  : header.column.id,
                              );
                            }}
                          >
                            {/* filter icon */}
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill={
                                hasFilterActive ? "var(--rbscv-accent)" : "none"
                              }
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Resize handle */}
                      <div
                        className={`rbscv-th__resize-handle${header.column.getIsResizing() ? " rbscv-th__resize-handle--resizing" : ""}`}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={() => header.column.resetSize()}
                      />
                    </th>
                  );
                })}
                {rightPad > 0 && (
                  <th
                    style={{
                      width: rightPad,
                      flexShrink: 0,
                      padding: 0,
                      border: 0,
                    }}
                  />
                )}
              </tr>
            ))}
          </thead>
          <tbody style={{ position: "relative", height: totalSize }}>
            {virtualRows.map((virtualRow) => {
              const row = reactTable.getRowModel().rows[virtualRow.index];
              return (
                <tr
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className={`rbscv-tr ${virtualRow.index % 2 === 0 ? "rbscv-tr--even" : "rbscv-tr--odd"}`}
                  style={{
                    display: "flex",
                    width: totalColumnsWidth,
                    position: "absolute",
                    top: 0,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {leftPad > 0 && (
                    <td style={{ width: leftPad, flexShrink: 0 }} />
                  )}
                  {virtualColumns.map((virtualColumn) => {
                    const cell = row.getVisibleCells()[virtualColumn.index];
                    if (!cell) return null;
                    return (
                      <td
                        key={cell.id}
                        className="rbscv-td"
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {rightPad > 0 && (
                    <td style={{ width: rightPad, flexShrink: 0 }} />
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Filter dropdown */}
      {openFilter && reactTable.getColumn(openFilter) && (
        <ColumnFilterDropdown
          column={reactTable.getColumn(openFilter)}
          anchorRef={{ current: filterBtnRefs.current[openFilter] }}
        />
      )}
    </>
  );
};

export default TableView;
