import postcss from "rollup-plugin-postcss";
import html from "rollup-plugin-html";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "./src/pages/ia_db/ia_db.js",
    output: {
      file: "./dist/pages/ia_db/ia_db.umd.js",
      format: "umd", // CommonJS format, compatible with "platform: 'node'" in esbuild
      sourcemap: true,
      name: "ia_db",
    },
    plugins: [
      html({
        include: "**/*.html",
      }),
      postcss(), // Import CSS files as part of the bundle
      json(),
      nodeResolve(),
      commonjs(),
    ],
  },
  {
    input: "./src/pages/ao_db/ao_db.js",
    output: {
      file: "./dist/pages/ao_db/ao_db.umd.js",
      format: "umd", // CommonJS format, compatible with "platform: 'node'" in esbuild
      sourcemap: true,
      name: "ao_db",
    },
    plugins: [
      html({
        include: "**/*.html",
      }),
      postcss(), // Import CSS files as part of the bundle
      json(),
      nodeResolve(),
      commonjs(),
    ],
  },
  {
    input: "./src/pages/permissions/permissions.js",
    output: {
      file: "./dist/pages/permissions/permissions.umd.js",
      format: "umd", // CommonJS format, compatible with "platform: 'node'" in esbuild
      sourcemap: true,
      name: "permissions",
    },
    plugins: [
      html({
        include: "**/*.html",
      }),
      postcss(),
      json(),
      nodeResolve(),
      commonjs(),
    ],
  },
  {
    input: "./src/pages/qa_db/qa_db.js",
    output: {
      file: "./dist/pages/qa_db/qa_db.umd.js",
      format: "umd", // CommonJS format, compatible with "platform: 'node'" in esbuild
      sourcemap: true,
      name: "qa_db",
    },
    plugins: [
      html({
        include: "**/*.html",
      }),
      postcss(),
      json(),
      nodeResolve(),
      commonjs(),
    ],
  },
  {
    input: "./src/pages/ro_db/ro_db.js",
    output: {
      file: "./dist/pages/ro_db/ro_db.umd.js",
      format: "umd", // CommonJS format, compatible with "platform: 'node'" in esbuild
      sourcemap: true,
      name: "ia_db",
    },
    plugins: [
      html({
        include: "**/*.html",
      }),
      postcss(), // Import CSS files as part of the bundle
      json(),
      nodeResolve(),
      commonjs(),
    ],
  },
  {
    input: "./src/pages/report_request_status/report_request_status.js",
    output: {
      file: "./dist/pages/report_request_status/report_request_status.umd.js",
      format: "umd", // CommonJS format, compatible with "platform: 'node'" in esbuild
      sourcemap: true,
      name: "report_request_status",
    },
    plugins: [
      html({
        include: "**/*.html",
      }),
      postcss(),
      json(),
      nodeResolve(),
      commonjs(),
    ],
  },
];
