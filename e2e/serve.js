import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, isAbsolute, relative, resolve } from "path";

const DIST = resolve(import.meta.dirname, "../dist");
const PAGES = resolve(import.meta.dirname, "pages");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".mjs": "application/javascript",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".txt": "text/plain",
};

function resolveWithin(root, requestPath) {
  const filePath = resolve(root, requestPath);
  const relativePath = relative(root, filePath);
  return relativePath &&
    !relativePath.startsWith("..") &&
    !isAbsolute(relativePath)
    ? filePath
    : null;
}

const server = createServer(async (req, res) => {
  let url;
  try {
    url = decodeURIComponent(
      new URL(req.url ?? "/", "http://localhost").pathname,
    );
  } catch {
    res.writeHead(400);
    res.end("Invalid URL");
    return;
  }

  let filePath;
  if (url.startsWith("/dist/")) {
    filePath = resolveWithin(DIST, url.slice("/dist/".length));
  } else if (url === "/" || url.endsWith(".html")) {
    filePath = resolveWithin(PAGES, url === "/" ? "index.html" : url.slice(1));
  }

  if (!filePath) {
    res.writeHead(404);
    res.end("Not found: " + url);
    return;
  }

  try {
    const data = await readFile(filePath);
    const mime = MIME[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": mime,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found: " + url);
  }
});

server.listen(3210, "127.0.0.1", () => {
  console.log("E2E test server on http://localhost:3210");
});
