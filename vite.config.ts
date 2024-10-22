import { defineConfig } from "vite";
import type { ConfigEnv, UserConfig } from "vite";

import react from "@vitejs/plugin-react";

export default ({ command, mode }: ConfigEnv): UserConfig => {
  return defineConfig({
    root: ".",
    base: ".",
    plugins: [react()],
    server: {
      port: 9089,
    },
  });
};
