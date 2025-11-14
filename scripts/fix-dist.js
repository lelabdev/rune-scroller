#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '..', 'dist');

// Get list of .svelte.js files
const distFiles = readdirSync(distDir);
const svelteJsModules = distFiles
	.filter(f => f.endsWith('.svelte.js'))
	.map(f => f.replace('.svelte.js', ''));

// Fix function to replace .svelte imports with .svelte.js
function fixImports(content, svelteJsModules) {
	let fixed = content;
	for (const moduleName of svelteJsModules) {
		const escapedName = moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		// Match both single and double quotes
		const pattern = new RegExp(`from '\\.\\/` + escapedName + `\\.svelte'`, 'g');
		fixed = fixed.replace(pattern, `from './${moduleName}.svelte.js'`);
		const pattern2 = new RegExp(`from "\\.\\/` + escapedName + `\\.svelte"`, 'g');
		fixed = fixed.replace(pattern2, `from "./${moduleName}.svelte.js"`);
	}
	return fixed;
}

// Fix all .js files in dist
const jsFiles = distFiles.filter(f => f.endsWith('.js') && !f.endsWith('.svelte.js'));
for (const jsFile of jsFiles) {
	const filePath = join(distDir, jsFile);
	const content = readFileSync(filePath, 'utf-8');
	const fixed = fixImports(content, svelteJsModules);
	if (fixed !== content) {
		writeFileSync(filePath, fixed, 'utf-8');
		console.log(`✅ Fixed ${jsFile} imports`);
	}
}

// Fix all .svelte.js files (they can import other .svelte.js files)
const svelteJsFiles = distFiles.filter(f => f.endsWith('.svelte.js'));
for (const jsFile of svelteJsFiles) {
	const filePath = join(distDir, jsFile);
	const content = readFileSync(filePath, 'utf-8');
	const fixed = fixImports(content, svelteJsModules);
	if (fixed !== content) {
		writeFileSync(filePath, fixed, 'utf-8');
		console.log(`✅ Fixed ${jsFile} imports`);
	}
}

// Fix all .d.ts files
const dtsFiles = distFiles.filter(f => f.endsWith('.d.ts'));
for (const dtsFile of dtsFiles) {
	const filePath = join(distDir, dtsFile);
	const content = readFileSync(filePath, 'utf-8');
	const fixed = fixImports(content, svelteJsModules);
	if (fixed !== content) {
		writeFileSync(filePath, fixed, 'utf-8');
		console.log(`✅ Fixed ${dtsFile} imports`);
	}
}
