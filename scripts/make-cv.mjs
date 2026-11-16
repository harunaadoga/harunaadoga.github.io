#!/usr/bin/env node
// Regenerates the downloadable CV (src/static/Haruna-Umar-Adoga-CV.pdf) from the /cv/ page.
// Usage: npm run cv        (needs Google Chrome or Chromium installed)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { extname, join, normalize } from "node:path";

const root = "_site";
const out = "src/static/Haruna-Umar-Adoga-CV.pdf";
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png" };

execFileSync("npx", ["eleventy", "--quiet"], { stdio: "inherit" });

const server = createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (path.endsWith("/")) path += "index.html";
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { "content-type": types[extname(path)] || "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const url = `http://127.0.0.1:${server.address().port}/cv/`;

const browsers = [process.env.CHROME, "google-chrome", "chromium", "chromium-browser"].filter(Boolean);
let done = false;
for (const bin of browsers) {
  try {
    // Async on purpose: the server above has to keep answering while the browser prints.
    await promisify(execFile)(bin, ["--headless=new", "--no-pdf-header-footer", `--print-to-pdf=${out}`, url], { timeout: 60000 });
    done = true;
    break;
  } catch {}
}
server.close();
if (!done) {
  console.error("Could not find Chrome or Chromium. Set CHROME=/path/to/browser and try again.");
  process.exit(1);
}
console.log(`Wrote ${out}. Commit it to publish the new CV.`);
