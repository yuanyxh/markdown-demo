import path from 'node:path';
import type { ConfigEnv, UserConfig } from 'vite';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const currFileDir = __dirname;
const resolve = (...paths: string[]) => path.resolve(currFileDir, ...paths);

export default ({ command, mode }: ConfigEnv): UserConfig => {
  return defineConfig({
    root: '.',
    base: './',
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: /@\//,
          replacement: `${resolve('src/core')}/`
        },
        {
          find: /@\/abstracts\//,
          replacement: `${resolve('src/core/abstracts')}/`
        },
        {
          find: /@\/interfaces\//,
          replacement: `${resolve('src/core/interfaces')}/`
        }
      ]
    },
    server: {
      port: 9089
    }
  });
};
