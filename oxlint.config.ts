import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react],
  ignorePatterns: ["bun.lock", "node_modules", "dist"],
  rules: {
    "unicorn/filename-case": "off",
  },
});
