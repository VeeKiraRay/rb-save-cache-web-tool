import React, { useCallback, useState } from "react";
import handleFileLoad from "../util/file/FileLoad";
import type LoadResult from "@/types/file/LoadResult";
import type LoadError from "@/types/file/LoadError";
import DropZone from "./DropZone";
import type FolderData from "@/types/file/FolderData";

type CacheMode = "file" | "folder";

interface FileInputProps {
  handleFileLoadingResponse: (res: LoadResult | LoadError) => void;
}

const FileInput: React.FC<FileInputProps> = ({ handleFileLoadingResponse }) => {
  const [fileError, setFileError] = useState<string>("");
  const [saveFile, setSaveFile] = useState<File | null>(null);
  const [cacheFile, setCacheFile] = useState<File | null>(null);
  const [cacheMode, setCacheMode] = useState<CacheMode>("file");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFolderFiles, setSelectedFolderFiles] =
    useState<FileList | null>(null);

  const handleSaveFileSelect = (file: File) => {
    setFileError("");
    setSaveFile(file);
  };

  const handleCacheFileSelect = (file: File) => {
    setFileError("");
    setCacheFile(file);
  };

  const handleFolderSelect = (name: string, files: FileList) => {
    setFileError("");
    setSelectedFolder(name);
    setSelectedFolderFiles(files);
  };

  const handleFilesLoaded = useCallback(
    async (
      file1: File | null,
      file2: File | null,
      folder: FolderData | null,
    ): Promise<void> => {
      setFileError("");
      const fileResponse = await handleFileLoad(file1, file2, folder);
      if ("errorMessage" in fileResponse) {
        setFileError(fileResponse.errorMessage);
      }
      handleFileLoadingResponse(fileResponse);
    },
    [handleFileLoadingResponse],
  );

  const handleLoad = () => {
    const cacheFileToUse = cacheMode === "file" ? cacheFile : null;
    const folderToUse: FolderData =
      cacheMode === "folder"
        ? { files: selectedFolderFiles, folderName: selectedFolder }
        : null;
    if (!saveFile && !cacheFileToUse && !folderToUse) {
      setFileError("Please select at least one file or folder.");
      return;
    }
    handleFilesLoaded(saveFile, cacheFileToUse, folderToUse);
  };

  return (
    <section className="rbscv-file-section">
      <div className="rbscv-file-section__info">
        <h2 className="rbscv-file-section__title">Load Files</h2>
        <p className="rbscv-file-section__desc">
          Drop or select your save file and/or cache file to view and compare
          song data.
        </p>
      </div>
      <div className="rbscv-file-section__inputs">
        <div className="rbscv-file-section__row">
          {/* Save File Drop Zone */}
          <div className="rbscv-file-group">
            <label className="rbscv-file-group__label">Save File</label>
            <DropZone
              placeholder="Drop save file here or click to browse"
              displayName={saveFile?.name ?? null}
              onFileSelect={handleSaveFileSelect}
              onUnsupportedDrop={() =>
                setFileError("Only a single file can be dropped here.")
              }
            />
          </div>

          {/* Cache Input */}
          <div className="rbscv-file-group">
            <div className="rbscv-cache-toggle">
              <label className="rbscv-cache-toggle__radio">
                <input
                  type="radio"
                  name="cacheMode"
                  value="file"
                  checked={cacheMode === "file"}
                  onChange={() => setCacheMode("file")}
                />
                File
              </label>
              <label className="rbscv-cache-toggle__radio">
                <input
                  type="radio"
                  name="cacheMode"
                  value="folder"
                  checked={cacheMode === "folder"}
                  onChange={() => setCacheMode("folder")}
                />
                Folder
              </label>
            </div>
            <label className="rbscv-file-group__label">
              {cacheMode === "file" ? "Cache file" : "Song folder"}
            </label>

            {cacheMode === "file" ? (
              <DropZone
                placeholder="Drop cache file here or click to browse"
                displayName={cacheFile?.name ?? null}
                onFileSelect={handleCacheFileSelect}
                onUnsupportedDrop={() =>
                  setFileError("Only a single file can be dropped here.")
                }
              />
            ) : (
              <DropZone
                placeholder="Click to browse for a folder"
                displayName={selectedFolder}
                isFolder
                onFolderSelect={handleFolderSelect}
                onUnsupportedDrop={() =>
                  setFileError(
                    "Drag & drop is not supported for folders. Click to browse.",
                  )
                }
              />
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
