// Run with: node .\esbuild.config.mjs

import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

const devDistDir = "W:/Style Library/apps/qms-ci/dist";

// DEFAULT DEVELOPMENT OPTS
let buildOpts = {
  sourcemap: true,
  format: "esm",
  minify: false,
  outdir: "dist",
};

if (process.argv.includes("-p")) {
  // PRODUCTION BUILD
  console.log("PRODUCTION BUILD");
  // buildOpts.sourcemap = false;
  buildOpts.minify = false;
  buildOpts.outdir = "dist";
}

console.log("BUILDING");
await esbuild.build({
  entryPoints: [
    "./src/pages/app/app.js",
    "./src/pages/migrations/migrations.js",
    "./src/pages/manage-qo/manage-qo.js",
    "./src/styles.css",
  ],
  bundle: true,
  ...buildOpts,
});

const referenceFiles = [
  "sal-v2.js",
  "common.js",
  "pages/migrations/migrations.txt",
  "pages/app/app.txt",
  "pages/manage-qo/manage-qo.txt",
];

console.log("COPYTING");

referenceFiles.forEach(copyReferenceFiles);

function copyReferenceFiles(filePath) {
  const srcTextFile = path.resolve("src/" + filePath);
  const destTextFile = path.resolve(buildOpts.outdir + "/" + filePath);
  fs.copyFileSync(srcTextFile, destTextFile);
}

if (process.argv.includes("-d")) {
  // Example usage
  const sourceDir = path.resolve(buildOpts.outdir);
  const destinationDir = path.resolve(devDistDir);

  copyDirectory(sourceDir, destinationDir);
}

// Function to copy a file
function copyFile(source, destination) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(source);
    const writeStream = fs.createWriteStream(destination);

    readStream.on("error", reject);
    writeStream.on("error", reject);
    writeStream.on("finish", resolve);

    readStream.pipe(writeStream);
  });
}

// Function to copy a directory recursively
async function copyDirectory(source, destination) {
  try {
    // Ensure that the destination directory exists
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (let entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destinationPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy directories
        await copyDirectory(sourcePath, destinationPath);
      } else {
        // Copy files
        await copyFile(sourcePath, destinationPath);
      }
    }

    console.log(`Directory copied from ${source} to ${destination}`);
  } catch (err) {
    console.error(`Error copying directory: ${err}`);
  }
}
