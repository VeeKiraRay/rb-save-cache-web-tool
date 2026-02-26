import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ColumnDefinitions from "../../constants/ColumnDefinitions";
import type { FilterType } from "@/types/ColumnDefinition";

// Lookup from COLUMN_DEFINITIONS key → render type for use in the filter display
const RENDER_TYPE_MAP = Object.fromEntries(
  ColumnDefinitions.COLUMN_DEFINITIONS.filter((c) => c.render).map((c) => [
    c.key,
    c.render,
  ]),
);

const DIFFICULTY_LABELS = ["—", "Easy", "Medium", "Hard", "Expert"];

const renderFilterOption = (columnId: string, value: unknown) => {
  const renderType = RENDER_TYPE_MAP[columnId];
  switch (renderType) {
    case "stars": {
      const num = Math.max(0, Number(value) || 0);
      const isGold = num > 5;
      const filled = Math.min(num, 5);
      const stars = "★".repeat(filled) + "☆".repeat(5 - filled);
      const goldColor = { color: "var(--star-gold-fill)" };
      return (
        <>
          <span style={isGold ? goldColor : undefined}>{`${stars} `}</span>
          {`(${value})`}
        </>
      );
    }
    case "difficulty":
      return DIFFICULTY_LABELS[Math.min(Math.max(Number(value) || 0, 0), 4)];
    case "percent":
      return `${value}%`;
    default:
      return String(value ?? "");
  }
};

const ALL_LETTERS = [..."#ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

const AlphaGroupFilter = ({ column, facetedValues }) => {
  const filterValue = column.getFilterValue() as Set<string> | undefined;

  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    for (const key of facetedValues.keys()) {
      const ch = String(key ?? "")[0]?.toUpperCase() ?? "";
      letters.add(/[A-Z]/.test(ch) ? ch : "#");
    }
    return letters;
  }, [facetedValues]);

  const toggle = (letter: string) => {
    const current = filterValue ? new Set(filterValue) : new Set<string>();
    if (current.has(letter)) current.delete(letter);
    else current.add(letter);
    column.setFilterValue(current.size > 0 ? current : undefined);
  };

  const clear = () => column.setFilterValue(undefined);

  return (
    <>
      <div className="rbscv-filter-dropdown__header">
        <span className="rbscv-filter-dropdown__title">Filter by letter</span>
        <button className="rbscv-filter-dropdown__clear" onClick={clear}>
          Clear
        </button>
      </div>
      <div className="rbscv-filter-alpha-grid">
        {ALL_LETTERS.map((letter) => {
          const isAvailable = availableLetters.has(letter);
          const isSelected = filterValue?.has(letter) ?? false;
          return (
            <button
              key={letter}
              className={`rbscv-filter-alpha-btn${isSelected ? " rbscv-filter-alpha-btn--selected" : ""}${!isAvailable ? " rbscv-filter-alpha-btn--disabled" : ""}`}
              onClick={() => toggle(letter)}
              disabled={!isAvailable}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </>
  );
};

const PresenceFilter = ({ column }) => {
  const filterValue = column.getFilterValue() as
    | "nonempty"
    | "empty"
    | undefined;

  const set = (val: "nonempty" | "empty" | undefined) => {
    column.setFilterValue(val);
  };

  return (
    <>
      <div className="rbscv-filter-dropdown__header">
        <span className="rbscv-filter-dropdown__title">Filter</span>
      </div>
      {(
        [
          { val: undefined, label: "Show all" },
          { val: "nonempty", label: "Non-empty only" },
          { val: "empty", label: "Empty only" },
        ] as const
      ).map(({ val, label }) => {
        const isChecked = (filterValue ?? undefined) === val;
        return (
          <label
            key={label}
            className={`rbscv-filter-option${isChecked ? " rbscv-filter-option--checked" : ""}`}
          >
            <input
              type="radio"
              name={`presence-${column.id}`}
              checked={isChecked}
              onChange={() => set(val)}
            />
            {label}
          </label>
        );
      })}
    </>
  );
};

const MultiSelectFilter = ({ column, facetedValues }) => {
  const filterValue = column.getFilterValue() as Set<unknown> | undefined;

  const sortedValues = useMemo(() => {
    const vals = [...facetedValues.keys()];
    vals.sort((a, b) => {
      if (typeof a === "number" && typeof b === "number") return a - b;
      return String(a).localeCompare(String(b));
    });
    return vals;
  }, [facetedValues]);

  const toggle = (val: string) => {
    const current = filterValue ? new Set(filterValue) : new Set();
    if (current.has(val)) current.delete(val);
    else current.add(val);
    column.setFilterValue(current.size > 0 ? current : undefined);
  };

  const clear = () => column.setFilterValue(undefined);

  return (
    <>
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
    </>
  );
};

const ColumnFilterDropdown = ({ column, anchorRef }) => {
  const facetedValues = column.getFacetedUniqueValues();
  const filterType = (column.columnDef.meta?.filterType ??
    "multiSelect") as FilterType;
  const dropdownRef = useRef(null);

  const [pos, setPos] = useState<{
    top: number;
    left?: number;
    right?: number;
  }>({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!anchorRef?.current || !dropdownRef.current) return;
    const anchor = anchorRef.current.getBoundingClientRect();
    const dropdownWidth = dropdownRef.current.offsetWidth;
    const spaceOnRight = window.innerWidth - anchor.left;

    if (spaceOnRight < dropdownWidth) {
      setPos({
        top: anchor.bottom + 4,
        right: window.innerWidth - anchor.right,
      });
    } else {
      setPos({ top: anchor.bottom + 4, left: anchor.left });
    }
  }, [anchorRef]);

  return (
    <div
      ref={dropdownRef}
      style={{
        top: pos.top,
        ...(pos.right != null
          ? { right: pos.right }
          : { left: pos.left ?? 0 }),
      }}
      className="rbscv-filter-dropdown"
      onClick={(e) => e.stopPropagation()}
    >
      {filterType === "alphaGroup" && (
        <AlphaGroupFilter column={column} facetedValues={facetedValues} />
      )}
      {filterType === "presence" && <PresenceFilter column={column} />}
      {filterType === "multiSelect" && (
        <MultiSelectFilter column={column} facetedValues={facetedValues} />
      )}
    </div>
  );
};

export default ColumnFilterDropdown;
