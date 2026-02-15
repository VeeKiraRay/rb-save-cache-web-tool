import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ColumnDefinitions from "../../constants/ColumnDefinitions";

// Lookup from COLUMN_DEFINITIONS key → render type for use in the filter display
const RENDER_TYPE_MAP = Object.fromEntries(
  ColumnDefinitions.COLUMN_DEFINITIONS.filter((c) => c.render).map((c) => [
    c.key,
    c.render,
  ]),
);

const DIFFICULTY_LABELS = ["—", "Easy", "Medium", "Hard", "Expert"];

const renderFilterOption = (columnId, value) => {
  const renderType = RENDER_TYPE_MAP[columnId];
  switch (renderType) {
    case "stars":
      return `${"★".repeat(Number(value) || 0)}${"☆".repeat(5 - (Number(value) || 0))} (${value})`;
    case "difficulty":
      return DIFFICULTY_LABELS[Math.min(Math.max(Number(value) || 0, 0), 4)];
    case "percent":
      return `${value}%`;
    default:
      return String(value ?? "");
  }
};

const ColumnFilterDropdown = ({ column, anchorRef }) => {
  const facetedValues = column.getFacetedUniqueValues();
  const filterValue = column.getFilterValue(); // Set or undefined
  const dropdownRef = useRef(null);

  const [pos, setPos] = useState({ top: 0, left: 0 });
  useLayoutEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [anchorRef]);

  const sortedValues = useMemo(() => {
    const vals = [...facetedValues.keys()];
    vals.sort((a, b) => {
      if (typeof a === "number" && typeof b === "number") return a - b;
      return String(a).localeCompare(String(b));
    });
    return vals;
  }, [facetedValues]);

  const toggle = (val) => {
    const current = filterValue ? new Set(filterValue) : new Set();
    if (current.has(val)) current.delete(val);
    else current.add(val);
    column.setFilterValue(current.size > 0 ? current : undefined);
  };

  const clear = () => column.setFilterValue(undefined);

  return (
    <div
      ref={dropdownRef}
      style={{ top: pos.top, left: pos.left }}
      className="rbscv-filter-dropdown"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="rbscv-filter-dropdown__header">
        <span className="rbscv-filter-dropdown__title">Filter</span>
        <button className="rbscv-filter-dropdown__clear" onClick={clear}>
          Clear
        </button>
      </div>
      {sortedValues.map((val) => {
        const isChecked = filterValue?.has(val) ?? false;
        return (
          <label
            key={String(val)}
            className={`rbscv-filter-option${isChecked ? " rbscv-filter-option--checked" : ""}`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggle(val)}
            />
            {renderFilterOption(column.id, val)}
          </label>
        );
      })}
    </div>
  );
};

export default ColumnFilterDropdown;
