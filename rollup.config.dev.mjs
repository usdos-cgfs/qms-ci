import serve from "rollup-plugin-serve";
import postcss from "rollup-plugin-postcss";
import html from "rollup-plugin-html";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const pages = [
  {
    output: { name: "app", file: "./dist/pages/app.umd.js" },
    input: "./src/pages/app/app.js",
  },
  {
    input: "./src/pages/migrations/migrations.js",
    output: {
      name: "migrations",
      file: "./dist/pages/migrations.umd.js",
    },
  },
  {
    input: "./src/pages/manage-qo/manage-qo.js",
    output: {
      name: "manage-qo",
      file: "./dist/pages/manage-qo.umd.js",
    },
  },
];

const entryPoints = pages.map((page) => {
  return {
    ...page,
    output: {
      format: "umd",
      sourcemap: true,
      ...page.output,
    },
    plugins: [
      html({
        include: "**/*.html",
      }),
      postcss(),
      json(),
      serve({
        contentBase: "./",
        port: 5500,
      }),
      nodeResolve(),
      commonjs(),
    ],
  };
});
console.log(entryPoints);
export default entryPoints;
