// @ts-nocheck
import React, { useCallback, useRef, useState } from "react";
import handleFileLoad from "../util/file/FileLoad";
import type LoadResult from "@/types/file/LoadResult";
import type LoadError from "@/types/file/LoadError";

type CacheMode = "file" | "folder";

interface FileInputProps {
  handleFileLoadingResponse: (res: LoadResult | LoadError) => void;
}

const FileInput: React.FC<FileInputProps> = ({ handleFileLoadingResponse }) => {
  const [fileError, setFileError] = useState<string>("");
  const [saveFile, setSaveFile] = useState<File | null>(null);
  const [cacheFile, setCacheFile] = useState<File | null>(null);
  const [isDraggingSave, setIsDraggingSave] = useState(false);
  const [isDraggingCache, setIsDraggingCache] = useState(false);
  const [cacheMode, setCacheMode] = useState<CacheMode>("file");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const saveInputRef = useRef<HTMLInputElement | null>(null);
  const cacheInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilesLoaded = useCallback(
    async (file1: File | null, file2: File | null): Promise<void> => {
      setFileError("");
      const fileResponse = await handleFileLoad(file1, file2);
      if ("errorMessage" in fileResponse) {
        setFileError(fileResponse.errorMessage);
      }
      handleFileLoadingResponse(fileResponse);
    },
    [handleFileLoadingResponse],
  );

  const pickFolderAndSearch = useCallback(async () => {
    // Ask user to pick a directory
    const dirHandle = await (window as any).showDirectoryPicker();

    const results: File[] = [];

    // Recursively walk the directory
    async function walkDirectory(handle: FileSystemDirectoryHandle) {
      for await (const entry of handle.values()) {
        if (entry.kind === "file") {
          if (entry.name.toLowerCase() === "songs.dta") {
            const file = await entry.getFile();
            results.push(file);
          }
        } else if (entry.kind === "directory") {
          await walkDirectory(entry);
        }
      }
    }

    await walkDirectory(dirHandle);
    return results;
  }, []);

  const handleLoad = () => {
    if (cacheMode === "folder") {
      //pickFolderAndSearch();
      return;
    }
    if (!saveFile && !cacheFile) {
      setFileError("Please select at least one file.");
      return;
    }
    handleFilesLoaded(saveFile, cacheFile);
  };

  const handleSaveDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingSave(false);
    const files = e.dataTransfer.files;
    if (e.dataTransfer.files.length > 1) {
      return;
    }
    setSaveFile(files[0]);
  }, []);

  const handleCacheDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCache(false);
    const files = e.dataTransfer.files;
    if (files.length > 1) {
      return;
    }
    setCacheFile(files[0]);
  }, []);

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSelectFolder = async () => {
    // TODO WIP
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      setSelectedFolder(dirHandle.name);

      const results: File[] = [];

      // Recursively walk the directory
      async function walkDirectory(handle: FileSystemDirectoryHandle) {
        for await (const entry of handle.values()) {
          if (entry.kind === "file") {
            if (entry.name.toLowerCase() === "songs.dta") {
              const file = await entry.getFile();
              results.push(file);
            }
          } else if (entry.kind === "directory") {
            await walkDirectory(entry);
          }
        }
      }

      await walkDirectory(dirHandle);
      console.log(results);
    } catch (e) {
      console.log(e);
      // User cancelled
    }
  };

  return (
    <section className="rbscv-file-section">
      <div className="rbscv-file-section__info">
        <h2 className="rbscv-file-section__title">Load Files</h2>
        <p className="rbscv-file-section__desc">
          Drop or select your save file (.dat) and cache file to view and
          compare song data.
        </p>
      </div>
      <div className="rbscv-file-section__inputs">
        <div className="rbscv-file-section__row">
          {/* Save File Drop Zone */}
          <div className="rbscv-file-group">
            <label className="rbscv-file-group__label">Save File</label>
            <div
              className={`rbscv-drop-zone${isDraggingSave ? " rbscv-drop-zone--dragging" : ""}${saveFile ? " rbscv-drop-zone--has-file" : ""}`}
              onClick={() => saveInputRef.current?.click()}
              onDragOver={(e) => {
                preventDefaults(e);
                setIsDraggingSave(true);
              }}
              onDragEnter={(e) => {
                preventDefaults(e);
                setIsDraggingSave(true);
              }}
              onDragLeave={() => setIsDraggingSave(false)}
              onDrop={handleSaveDrop}
            >
              {saveFile ? (
                <span className="rbscv-drop-zone__filename">
                  {saveFile.name}
                </span>
              ) : (
                <span className="rbscv-drop-zone__text">
                  Drop .dat file here or click to browse
                </span>
              )}
              <input
                ref={saveInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f) setSaveFile(f);
                }}
              />
            </div>
          </div>

          {/* Cache Input */}
          <div className="rbscv-file-group">
            {/* 
            <div className="rbscv-cache-toggle">
              <label className="rbscv-cache-toggle__radio">
                <input
                  type="radio"
                  name="cacheMode"
                  value="file"
                  checked={cacheMode === "file"}
                  onChange={() => setCacheMode("file")}
                />
                Xbox / Wii
              </label>
              <label className="rbscv-cache-toggle__radio">
                <input
                  disabled
                  type="radio"
                  name="cacheMode"
                  value="folder"
                  checked={cacheMode === "folder"}
                  onChange={() => setCacheMode("folder")}
                />
                PS3
              </label>
            </div>
            */}
            <label className="rbscv-file-group__label">
              {cacheMode === "file" ? "Cache file" : "Song folder"}
            </label>

            {cacheMode === "file" ? (
              <div
                className={`rbscv-drop-zone${isDraggingCache ? " rbscv-drop-zone--dragging" : ""}${cacheFile ? " rbscv-drop-zone--has-file" : ""}`}
                onClick={() => cacheInputRef.current?.click()}
                onDragOver={(e) => {
                  preventDefaults(e);
                  setIsDraggingCache(true);
                }}
                onDragEnter={(e) => {
                  preventDefaults(e);
                  setIsDraggingCache(true);
                }}
                onDragLeave={() => setIsDraggingCache(false)}
                onDrop={handleCacheDrop}
              >
                {cacheFile ? (
                  <span className="rbscv-drop-zone__filename">
                    {cacheFile.name}
                  </span>
                ) : (
                  <span className="rbscv-drop-zone__text">
                    Drop cache file here or click to browse
                  </span>
                )}
                <input
                  ref={cacheInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (f) setCacheFile(f);
                  }}
                />
              </div>
            ) : (
              <div className="rbscv-folder-picker">
                <input type="file" id="folder-picker" webkitdirectory="" />
                {selectedFolder && (
                  <span className="rbscv-folder-picker__name">
                    {selectedFolder}
                  </span>
                )}
              </div>
            )}
          </div>

          <button className="rbscv-btn rbscv-btn--primary" onClick={handleLoad}>
            Load Data
          </button>
        </div>
        {fileError && (
          <div className="rbscv-file-error">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
            {fileError}
          </div>
        )}
      </div>
    </section>
  );
};

export default FileInput;
