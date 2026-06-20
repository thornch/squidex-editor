/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { rimraf } from 'rimraf';
import { build } from 'vite';
import defaultConfig from './vite.config.mjs';

const dirName = fileURLToPath(new URL('.', import.meta.url));

const inputs = [{
    ['squidex-editor']: path.resolve(dirName, 'lib/squidex-editor.ts'),
}, {
    ['app']: path.resolve(dirName, 'index.html'),
}];

async function buildPackages() {
    await rimraf('./dist');

    for (const input of inputs) {
        // https://vitejs.dev/config/
        await build({
            publicDir: false,
            build: {
                outDir: 'dist',
                rollupOptions: {
                    input,
                    output: {
                        format: 'iife',

                        entryFileNames: chunk => {
                            if (chunk.name === 'squidex-editor') {
                                return 'squidex-editor.js';
                            } else {
                                return '[name].[hash].js';
                            }
                        },

                        assetFileNames: chunk => {
                            if (chunk.name === 'squidex-editor.css') {
                                return 'squidex-editor.css';
                            } else {
                                return '[name].[hash].[ext]';
                            }
                        },
                    },
                },
                chunkSizeWarningLimit: 2000,
                // We empty the out directory before all builds.
                emptyOutDir: false,
            },
            configFile: false,
            ...defaultConfig,
        });
    }
}

buildPackages().then(copyConfigTemplate);

function copyConfigTemplate() {
    const src  = path.resolve(dirName, 'lib/squidex-editor.config.template.json');
    const dest = path.resolve(dirName, 'dist/squidex-editor.config.template.json');
    fs.copyFileSync(src, dest);
    console.log('Copied squidex-editor.config.template.json → dist/');
}