// Run with: node .\esbuild.config.mjs

import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

await esbuild.build({
  entryPoints: [
    "./src/pages/app/app.js",
    "./src/pages/migrations/migrations.js",
    "./src/pages/manage-qo/manage-qo.js",
    "./src/pages/print/print.js",
    "./src/styles.css",
  ],
  bundle: true,
  minify: false,
  sourcemap: true,
  format: "esm",
  outdir: "dist",
});

const referenceFiles = [
  "sal-v2.js",
  "common.js",
  "pages/migrations/migrations.txt",
  "pages/app/app.txt",
  "pages/manage-qo/manage-qo.txt",
  "pages/print/print.txt",
];

referenceFiles.forEach(copyReferenceFiles);
function copyReferenceFiles(filePath) {
  const srcTextFile = path.resolve("src/" + filePath);
  const destTextFile = path.resolve("dist/" + filePath);
  fs.copyFileSync(srcTextFile, destTextFile);
}
