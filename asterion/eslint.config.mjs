import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    // The WebGL scene updates three.js objects imperatively inside the render loop and
    // shares a mutable controls ref with the host. The React-compiler purity rules model
    // component render, not that loop, so they are disabled for this file only.
    files: ["src/components/assembly/AssemblyScene.tsx"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  globalIgnores([".next/**", "coverage/**", "next-env.d.ts"]),
]);
