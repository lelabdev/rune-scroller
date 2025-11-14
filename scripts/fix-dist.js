#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '..', 'dist');
const distIndexPath = join(distDir, 'index.js');

let content = readFileSync(distIndexPath, 'utf-8');

// Get list of .svelte.js files (but not RuneScroller.svelte - stays .svelte)
const distFiles = readdirSync(distDir);
const svelteJsModules = distFiles
	.filter(f => f.endsWith('.svelte.js'))
	.map(f => f.replace('.svelte.js', ''));

// Replace imports:
// './moduleName.svelte' -> './moduleName.svelte.js' for .svelte.js modules
for (const moduleName of svelteJsModules) {
	const escapedName = moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	// Match both single and double quotes
	const pattern = new RegExp(`from '\\.\\/` + escapedName + `\\.svelte'`, 'g');
	content = content.replace(pattern, `from './${moduleName}.svelte.js'`);
	const pattern2 = new RegExp(`from "\\.\\/` + escapedName + `\\.svelte"`, 'g');
	content = content.replace(pattern2, `from "./${moduleName}.svelte.js"`);
}

writeFileSync(distIndexPath, content, 'utf-8');
console.log('✅ Fixed dist/index.js imports');
