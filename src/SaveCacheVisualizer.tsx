import { useState, useCallback, useMemo } from "react";

/* Components */
import FileInput from "@/components/FileInput";
import MetadataSection from "@/components/MetadataSection";
import Header from "@/components/Header";
import TableContainer from "@/components/TableContainer";

/* Style */
import "@/SaveCacheVisualizer.css";
import type LoadResult from "./types/file/LoadResult";
import type LoadError from "./types/file/LoadError";

const SaveCacheVisualizer = () => {
  // --- Data state ---
  const [{ meta, saveDataRows, cacheDataRows }, setLoadResult] = useState<
    Partial<LoadResult>
  >({});
  const [viewMode, setViewMode] = useState("save");

  const handleFileLoadingResponse = useCallback(
    (fileResponse: LoadResult | LoadError) => {
      if ("errorMessage" in fileResponse) {
        setLoadResult({});
      } else {
        setLoadResult(fileResponse);
      }
    },
    [],
  );

  const modeOnChange = (newMode: string) => {
    if (newMode === viewMode) {
      newMode = newMode === "save" ? "cache" : "save";
    }
    setViewMode(newMode);
  };

  const dataToShow = useMemo(() => {
    const viewBasedData = viewMode === "save" ? saveDataRows : cacheDataRows;
    return viewBasedData ? viewBasedData : [];
  }, [viewMode, saveDataRows, cacheDataRows]);

  return (
    <div className="rbscv-root">
      <Header />
      <FileInput handleFileLoadingResponse={handleFileLoadingResponse} />

      <MetadataSection resultMetadata={meta} key={viewMode} />
      <TableContainer
        data={dataToShow}
        viewMode={viewMode}
        modeOnChange={modeOnChange}
      />
    </div>
  );
};

export default SaveCacheVisualizer;
