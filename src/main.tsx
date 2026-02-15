import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SaveCacheVisualizer from "./SaveCacheVisualizer.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SaveCacheVisualizer />
  </StrictMode>,
);
