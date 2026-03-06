import React, { useCallback, useEffect, useRef, useState } from "react";

interface DropZoneProps {
  placeholder: string;
  displayName: string | null;
  isFolder?: boolean;
  onFileSelect?: (file: File) => void;
  onFolderSelect?: (name: string, files: FileList) => void;
  onUnsupportedDrop?: () => void;
}

const DropZone: React.FC<DropZoneProps> = ({
  placeholder,
  displayName,
  isFolder = false,
  onFileSelect,
  onFolderSelect,
  onUnsupportedDrop,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEnumerating, setIsEnumerating] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !isFolder) return;
    const handleCancel = () => setIsEnumerating(false);
    input.addEventListener("cancel", handleCancel);
    return () => input.removeEventListener("cancel", handleCancel);
  }, [isFolder]);

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isFolder) {
        onUnsupportedDrop?.();
      } else {
        const entry = e.dataTransfer.items[0]?.webkitGetAsEntry();
        if (entry?.isDirectory) {
          onUnsupportedDrop?.();
          return;
        }
        const files = e.dataTransfer.files;
        if (files.length === 1) {
          onFileSelect(files[0]);
        }
      }
    },
    [isFolder, onFileSelect, onUnsupportedDrop],
  );

  const handleClick = () => {
    if (isFolder) {
      // Show the overlay as soon as the dialog closes and the browser starts
      // enumerating the directory (which can take several seconds).
      const onFocus = () => {
        window.removeEventListener("focus", onFocus);
        setIsEnumerating(true);
      };
      window.addEventListener("focus", onFocus);
    }
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFolder) {
      const files = e.target.files;
      setIsEnumerating(false);
      if (files && files.length > 0) {
        onFolderSelect?.(files[0].webkitRelativePath.split("/")[0], files);
      }
    } else {
      const f = e.target.files?.[0];
      if (f) onFileSelect(f);
    }
  };

  return (
    <>
      {isEnumerating && (
        <div className="rbscv-loading-overlay">
          <div className="rbscv-loading-content">
            <div className="rbscv-loading-spinner" />
            <p className="rbscv-loading-text">Reading folder…</p>
            <button
              className="rbscv-loading-cancel"
              onClick={() => setIsEnumerating(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div
        className={`rbscv-drop-zone${isDragging ? " rbscv-drop-zone--dragging" : ""}${displayName ? " rbscv-drop-zone--has-file" : ""}`}
        onClick={handleClick}
        onDragOver={(e) => {
          preventDefaults(e);
          setIsDragging(true);
        }}
        onDragEnter={(e) => {
          preventDefaults(e);
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {displayName ? (
          <span className="rbscv-drop-zone__filename">{displayName}</span>
        ) : (
          <span className="rbscv-drop-zone__text">{placeholder}</span>
        )}
        <input
          ref={inputRef}
          type="file"
          {...(isFolder ? { webkitdirectory: "" } : {})}
          style={{ display: "none" }}
          onChange={handleInputChange}
        />
      </div>
    </>
  );
};

export default DropZone;
