// Run with: node .\esbuild.config.mjs

import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

await esbuild.build({
  entryPoints: ["./src/pages/migrations/migrations.js", "./src/styles.css"],
  bundle: true,
  minify: false,
  sourcemap: true,
  outdir: "dist",
});

const referenceFiles = ["pages/migrations/migrations.txt"];

referenceFiles.forEach(copyReferenceFiles);
function copyReferenceFiles(filePath) {
  const srcTextFile = path.resolve("src/" + filePath);
  const destTextFile = path.resolve("dist/" + filePath);
  fs.copyFileSync(srcTextFile, destTextFile);
}
