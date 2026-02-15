import { useState, useMemo } from "react";
import ColumnDefinitions from "../../constants/ColumnDefinitions";
import type { Table } from "@tanstack/react-table";
import type SongRowCombined from "@/types/file/SongRowCombined";
import type { Groups } from "@/types/ColumnDefinition";
import type ColumnDefinition from "@/types/ColumnDefinition";

interface SettingsModalProps {
  table: Table<SongRowCombined>;
  onClose: () => void;
}

const ColumnSettingsModal = ({ table, onClose }: SettingsModalProps) => {
  const [search, setSearch] = useState("");

  // Build grouped structure from column meta
  const columnGroups = useMemo((): { [K in Groups]?: ColumnDefinition[] } => {
    const groups = {};
    ColumnDefinitions.COLUMN_DEFINITIONS.forEach((def) => {
      if (!groups[def.group]) groups[def.group] = [];
      groups[def.group].push(def);
    });
    return groups;
  }, []);

  const resetToDefaults = () => {
    const visibility = {};
    ColumnDefinitions.COLUMN_DEFINITIONS.forEach((def) => {
      visibility[def.key] = ColumnDefinitions.DEFAULT_VISIBLE_COLUMNS.includes(
        def.key,
      );
    });
    table.setColumnVisibility(visibility);
  };

  const hideAll = () => {
    const visibility = {};
    ColumnDefinitions.COLUMN_DEFINITIONS.forEach((def) => {
      visibility[def.key] = false;
    });
    table.setColumnVisibility(visibility);
  };

  return (
    <div className="rbscv-modal-backdrop" onClick={onClose}>
      <div className="rbscv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rbscv-modal__header">
          <span className="rbscv-modal__title">
            <span className="rbscv-header__diamond">◆</span> Column Settings
          </span>
          <button className="rbscv-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="rbscv-modal__body">
          <div className="rbscv-col-vis__toolbar">
            <h3
              className="rbscv-settings-section__heading"
              style={{ margin: 0 }}
            >
              Column Visibility
            </h3>
            <div className="rbscv-col-vis__actions">
              <button
                className="rbscv-btn--small"
                onClick={() => table.toggleAllColumnsVisible(true)}
              >
                Show All
              </button>
              <button className="rbscv-btn--small" onClick={resetToDefaults}>
                Reset Defaults
              </button>
              <button className="rbscv-btn--small" onClick={hideAll}>
                Hide All
              </button>
            </div>
          </div>

          <input
            type="text"
            className="rbscv-text-input rbscv-col-vis__search"
            placeholder="Search columns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {Object.entries(columnGroups).map(([groupName, defs]) => {
            const filtered = defs.filter(
              (d) =>
                !search ||
                d.label.toLowerCase().includes(search.toLowerCase()) ||
                groupName.toLowerCase().includes(search.toLowerCase()),
            );
            if (filtered.length === 0) return null;

            const visibleCount = filtered.filter((d) => {
              const col = table.getColumn(d.key);
              return col?.getIsVisible();
            }).length;
            const allChecked = visibleCount === filtered.length;
            const someChecked = visibleCount > 0;

            const toggleGroup = () => {
              const updates = {};
              filtered.forEach((d) => {
                updates[d.key] = !allChecked;
              });
              table.setColumnVisibility((prev) => ({ ...prev, ...updates }));
            };

            return (
              <div key={groupName} className="rbscv-col-group">
                <label className="rbscv-col-group__header">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked && !allChecked;
                    }}
                    onChange={toggleGroup}
                  />
                  {groupName}
                  <span className="rbscv-col-group__count">
                    ({visibleCount}/{filtered.length})
                  </span>
                </label>
                <div className="rbscv-col-group__items">
                  {filtered.map((def) => {
                    const col = table.getColumn(def.key);
                    const isVisible = col?.getIsVisible() ?? false;
                    return (
                      <label
                        key={def.key}
                        className={`rbscv-col-group__item${isVisible ? " rbscv-col-group__item--active" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => col?.toggleVisibility()}
                        />
                        {def.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ColumnSettingsModal;
