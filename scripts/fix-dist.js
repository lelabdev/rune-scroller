#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distIndexPath = join(__dirname, '..', 'dist', 'index.js');

let content = readFileSync(distIndexPath, 'utf-8');

// Replace .svelte.ts imports with .svelte.js
content = content.replace(/\.svelte\.ts'/g, ".svelte.js'");

writeFileSync(distIndexPath, content, 'utf-8');
console.log('✅ Fixed dist/index.js imports');
