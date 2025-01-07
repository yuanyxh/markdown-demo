import type { ConfigEnv, UserConfig } from "vite";

import path from "node:path";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const currFileDir = __dirname;
const resolve = (...paths: string[]) => path.resolve(currFileDir, ...paths);

export default ({ command, mode }: ConfigEnv): UserConfig => {
  return defineConfig({
    root: ".",
    base: "./",
    resolve: {
      alias: [
        {
          find: /@\//,
          replacement: `${resolve("commonmark")}/`,
        },
        {
          find: /@\\internal\//,
          replacement: `${resolve("commonmark/internal")}/`,
        },
        {
          find: /@\\node\//,
          replacement: `${resolve("commonmark/node")}/`,
        },
        {
          find: /@\\parser\//,
          replacement: `${resolve("commonmark/parser")}/`,
        },
        {
          find: /@\\renderer\//,
          replacement: `${resolve("commonmark/renderer")}/`,
        },
        {
          find: /@\\text\//,
          replacement: `${resolve("commonmark/text")}/`,
        },
        {
          find: /@helpers\//,
          replacement: `${resolve("helpers")}/`,
        },
      ],
    },
    build: {
      outDir: "build",
      lib: {
        name: "commonmark-java-js",
        formats: ["es"],
        entry: "./commonmark/index.ts",
      },
      rollupOptions: {
        input: "./commonmark/index.ts",
      },
    },
    plugins: [
      dts({
        tsconfigPath: "./tsconfig.json",
        rollupTypes: true,
        pathsToAliases: true,
        entryRoot: "./types",
        // declarationOnly: true,
        outDir: "build",
      }),
    ],
  });
};
