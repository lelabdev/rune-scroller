import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname, resolve } from 'path';

const DIST = resolve(import.meta.dirname, '../dist');
const PAGES = resolve(import.meta.dirname, 'pages');

const MIME = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.mjs': 'application/javascript',
	'.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
	const url = req.url.split('?')[0];
	let filePath;

	if (url.startsWith('/dist/')) {
		// /dist/index.js → dist/index.js
		filePath = join(DIST, url.replace('/dist/', ''));
	} else if (url === '/' || url.endsWith('.html')) {
		// HTML pages
		filePath = join(PAGES, url === '/' ? 'index.html' : url);
	} else {
		res.writeHead(404);
		res.end('Not found: ' + url);
		return;
	}

	try {
		const data = await readFile(filePath);
		const mime = MIME[extname(filePath)] || 'application/octet-stream';
		res.writeHead(200, {
			'Content-Type': mime,
			'Access-Control-Allow-Origin': '*',
		});
		res.end(data);
	} catch (err) {
		res.writeHead(404);
		res.end('Not found: ' + url);
	}
});

server.listen(3210, () => {
	console.log('E2E test server on http://localhost:3210');
});
