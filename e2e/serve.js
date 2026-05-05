import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname, resolve } from 'path';

const DIST = resolve(import.meta.dirname, '../dist');
const PAGES = resolve(import.meta.dirname, 'pages');
const LANDING = resolve(import.meta.dirname, 'pages/landing');

const MIME = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.mjs': 'application/javascript',
	'.ico': 'image/x-icon',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
	'.txt': 'text/plain',
	'.webmanifest': 'application/manifest+json',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
};

function serveStatic(filePath, res) {
	return readFile(filePath).then((data) => {
		const mime = MIME[extname(filePath)] || 'application/octet-stream';
		res.writeHead(200, {
			'Content-Type': mime,
			'Access-Control-Allow-Origin': '*',
		});
		res.end(data);
	}).catch(() => {
		res.writeHead(404);
		res.end('Not found');
	});
}

// Port 3210: API test pages + dist files
createServer(async (req, res) => {
	const url = req.url.split('?')[0];
	let filePath;

	if (url.startsWith('/dist/')) {
		filePath = join(DIST, url.replace('/dist/', ''));
	} else if (url === '/' || url.endsWith('.html')) {
		filePath = join(PAGES, url === '/' ? 'index.html' : url);
	} else {
		res.writeHead(404);
		res.end('Not found: ' + url);
		return;
	}

	await serveStatic(filePath, res);
}).listen(3210, () => {
	console.log('E2E test server (API) on http://localhost:3210');
});

// Port 3211: Landing site (served at root for SvelteKit compatibility)
createServer(async (req, res) => {
	const url = req.url.split('?')[0];
	let filePath;

	if (url === '/' || url === '/index.html') {
		filePath = join(LANDING, 'index.html');
	} else {
		// All other paths → landing build assets
		filePath = join(LANDING, url);
	}

	await serveStatic(filePath, res);
}).listen(3211, () => {
	console.log('E2E landing server on http://localhost:3211');
});
