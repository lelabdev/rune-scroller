#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '..', 'dist');
const distIndexPath = join(distDir, 'index.js');
const distIndexDtsPath = join(distDir, 'index.d.ts');

// Get list of .svelte.js files (but not RuneScroller.svelte - stays .svelte)
const distFiles = readdirSync(distDir);
const svelteJsModules = distFiles
	.filter(f => f.endsWith('.svelte.js'))
	.map(f => f.replace('.svelte.js', ''));

// Fix dist/index.js
let jsContent = readFileSync(distIndexPath, 'utf-8');
for (const moduleName of svelteJsModules) {
	const escapedName = moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	// Match both single and double quotes
	const pattern = new RegExp(`from '\\.\\/` + escapedName + `\\.svelte'`, 'g');
	jsContent = jsContent.replace(pattern, `from './${moduleName}.svelte.js'`);
	const pattern2 = new RegExp(`from "\\.\\/` + escapedName + `\\.svelte"`, 'g');
	jsContent = jsContent.replace(pattern2, `from "./${moduleName}.svelte.js"`);
}
writeFileSync(distIndexPath, jsContent, 'utf-8');
console.log('✅ Fixed dist/index.js imports');

// Fix dist/index.d.ts
let dtsContent = readFileSync(distIndexDtsPath, 'utf-8');
for (const moduleName of svelteJsModules) {
	const escapedName = moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	// Match both single and double quotes
	const pattern = new RegExp(`from '\\.\\/` + escapedName + `\\.svelte'`, 'g');
	dtsContent = dtsContent.replace(pattern, `from './${moduleName}.svelte.js'`);
	const pattern2 = new RegExp(`from "\\.\\/` + escapedName + `\\.svelte"`, 'g');
	dtsContent = dtsContent.replace(pattern2, `from "./${moduleName}.svelte.js"`);
}
writeFileSync(distIndexDtsPath, dtsContent, 'utf-8');
console.log('✅ Fixed dist/index.d.ts imports');
