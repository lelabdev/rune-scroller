#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distIndexPath = join(__dirname, '..', 'dist', 'index.js');

let content = readFileSync(distIndexPath, 'utf-8');

// Replace .svelte imports for .svelte.ts files with .svelte.js
content = content.replace(
  /from '\.\/(\w+)\.svelte';/g,
  (match, filename) => {
    // Check if this is a .svelte.ts file (not a component)
    // For now, we know runeScroller, animate, and useIntersection are .svelte.ts files
    const svelteJsFiles = ['runeScroller', 'animate', 'useIntersection'];
    if (svelteJsFiles.includes(filename)) {
      return `from './${filename}.svelte.js';`;
    }
    return match;
  }
);

writeFileSync(distIndexPath, content, 'utf-8');
console.log('✅ Fixed dist/index.js imports');
