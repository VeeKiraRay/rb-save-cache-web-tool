import React, { useState, useMemo, type ReactElement } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedUniqueValues,
  type ColumnDef,
  type Row,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type ColumnOrderState,
} from "@tanstack/react-table";
import ColumnDefinitions from "../constants/ColumnDefinitions";
import StarsDisplay from "./StarsDisplay/StarsDisplay";
import DifficultyBadge from "./DifficultyBadge";
import PercentBar from "./PercentBar";
import ColumnSettingsModal from "./Table/ColumnSettingsModal";
import type SongRowCombined from "@/types/file/SongRowCombined";
import SlidingPillSelector from "./SlidingPillSelector/SlidingPillSelector";
import TableView from "./Table/TableView";

const multiSelectFilter = (
  row: Row<SongRowCombined>,
  columnId: string,
  filterValue: Set<unknown> | undefined,
) => {
  if (!filterValue || filterValue.size === 0) return true;
  return filterValue.has(row.getValue(columnId));
};

type SongRowValue = SongRowCombined[keyof SongRowCombined];

const buildTanStackColumns = (): ColumnDef<SongRowCombined, SongRowValue>[] =>
  ColumnDefinitions.COLUMN_DEFINITIONS.map((def) => ({
    accessorKey: def.key,
    id: def.key,
    header: def.label,
    size: def.size,
    minSize: 80,
    maxSize: 600,
    filterFn: multiSelectFilter,
    meta: {
      group: def.group,
      render: def.render,
      isFiltrable: def.isFiltrable,
    },
    cell: (info): ReactElement => {
      const value = info.getValue();
      switch (def.render) {
        case "rowCount":
          return <span>{info.row.index + 1}</span>;
        case "stars":
          return <StarsDisplay value={value as number} />;
        case "difficulty":
          return <DifficultyBadge value={value as number} />;
        case "percent":
          return <PercentBar value={value as number} />;
        default:
          return <span>{String(value ?? "")}</span>;
      }
    },
  }));

interface TableProps {
  data: SongRowCombined[];
  viewMode: string;
  modeOnChange: (newMode: string) => void;
}

const TableContainer: React.FC<TableProps> = ({
  data = [],
  viewMode,
  modeOnChange,
}) => {
  // --- TanStack state ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      const vis: VisibilityState = {};
      ColumnDefinitions.COLUMN_DEFINITIONS.forEach((def) => {
        vis[def.key] = ColumnDefinitions.DEFAULT_VISIBLE_COLUMNS.includes(
          def.key,
        );
      });
      return vis;
    },
  );
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
    ColumnDefinitions.COLUMN_DEFINITIONS.map((def) => def.key),
  );
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

  // --- UI state ---
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  // --- Build columns (stable reference) ---
  const columns = useMemo(() => buildTanStackColumns(), []);

  // --- TanStack Table instance ---
  const reactTable = useReactTable<SongRowCombined>({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      columnSizing,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    columnResizeMode: "onChange",
  });

  const totalRows = data.length;
  const filteredRows = reactTable.getFilteredRowModel().rows.length;
  const isFiltered = filteredRows !== totalRows;

  return (
    <>
      <div>
        <div className="rbscv-wrapper__sticky">
          {/* ===== TOOLBAR ===== */}
          <div className="rbscv-toolbar">
            <div className="rbscv-toolbar__info">
              {totalRows > 0 && (
                <>
                  <div className="rbscv-toolbar__stat">
                    <span className="rbscv-toolbar__stat-label">Rows:</span>
                    <span className="rbscv-toolbar__stat-value">
                      {totalRows.toLocaleString()}
                    </span>
                  </div>
                  {isFiltered && (
                    <div className="rbscv-toolbar__stat">
                      <span className="rbscv-toolbar__stat-label">
                        Showing:
                      </span>
                      <span className="rbscv-toolbar__stat-value">
                        {filteredRows.toLocaleString()} (filtered)
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="rbscv-toolbar__mode-selector">
              <SlidingPillSelector
                options={[
                  { label: "Save file", value: "save" },
                  { label: "Cache file", value: "cache" },
                ]}
                value={viewMode}
                onChange={modeOnChange}
              />
            </div>
            <div className="rbscv-toolbar__column-selector">
              <button
                className="rbscv-btn"
                onClick={() => setSettingsOpen(true)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                Columns
              </button>
            </div>
          </div>
        </div>
      </div>

      <TableView
        data={data}
        reactTable={reactTable}
        setColumnOrder={setColumnOrder}
      />

      {/* Settings modal */}
      {settingsOpen && (
        <ColumnSettingsModal
          table={reactTable}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
};

export default TableContainer;
