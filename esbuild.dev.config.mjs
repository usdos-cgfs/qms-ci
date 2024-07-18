import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

await esbuild.build({
  entryPoints: ["./src/app_bundle.js", "./src/app.css"],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: "W:/Style Library/apps/car-cap/dist",
});

const referenceFiles = ["pagest/db-main/db-main.txt"];

referenceFiles.forEach(copyReferenceFiles);

function copyReferenceFiles(filePath) {
  const srcTextFile = path.resolve("src/" + filePath);
  const destTextFile = path.resolve(
    "W:/Style Library/apps/car-cap/dist/" + filePath
  );
  fs.copyFileSync(srcTextFile, destTextFile);
}

// async function copyDirectory(src, dest) {
//   try {
//     // Create destination directory
//     await fs.mkdir(dest, { recursive: true });

//     // Read contents of the source directory
//     const entries = await fs.readdir(src, { withFileTypes: true });

//     for (let entry of entries) {
//       const srcPath = path.join(src, entry.name);
//       const destPath = path.join(dest, entry.name);

//       if (entry.isDirectory()) {
//         // Recursively copy sub-directory
//         await copyDirectory(srcPath, destPath);
//       } else {
//         // Copy file
//         await fs.copyFile(srcPath, destPath);
//       }
//     }
//   } catch (err) {
//     console.error(`Error copying directory: ${err}`);
//   }
// }

// // Usage
// const sourceDir = "./src/dist";
// const destinationDir = "P:/Style Library/apps/wo/dist";

// copyDirectory(sourceDir, destinationDir);
