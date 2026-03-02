import React, { useCallback, useRef, useState } from "react";

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
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFolder) {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFolderSelect?.(files[0].webkitRelativePath.split("/")[0], files);
      }
    } else {
      const f = e.target.files?.[0];
      if (f) onFileSelect(f);
    }
  };

  return (
    <div
      className={`rbscv-drop-zone${isDragging ? " rbscv-drop-zone--dragging" : ""}${displayName ? " rbscv-drop-zone--has-file" : ""}`}
      onClick={() => inputRef.current?.click()}
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
  );
};

export default DropZone;
