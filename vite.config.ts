import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteSingleFile } from "vite-plugin-singlefile";
import fs from "node:fs";
import path from "node:path";

function inlineSvgFavicon(): Plugin {
  let rootDir: string;
  return {
    name: "inline-svg-favicon",
    configResolved(config) {
      rootDir = config.root;
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html.replace(
          /(<link\b[^>]*\brel="icon"[^>]*\bhref=")(?!data:)([^"]+)("[^>]*>)/g,
          (original, pre, href, post) => {
            try {
              const filePath = path.resolve(rootDir, href.replace(/^\//, ""));
              const svg = fs.readFileSync(filePath, "utf-8");
              const base64 = Buffer.from(svg).toString("base64");
              return `${pre}data:image/svg+xml;base64,${base64}${post}`;
            } catch {
              return original;
            }
          }
        );
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  build: { assetsInlineLimit: 1000000 },
  plugins: [react(), tsconfigPaths(), viteSingleFile(), inlineSvgFavicon()],
  base: "/",
});
