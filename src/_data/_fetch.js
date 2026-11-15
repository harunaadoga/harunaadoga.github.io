// Shared helper: fetch a remote feed at build time, fall back to the last
// good copy in src/_data/cache/ so a network blip never breaks the build.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const cacheDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "cache");

export async function cached(name, loader) {
  const file = path.join(cacheDir, `${name}.json`);
  try {
    const data = await loader();
    if (!data || (Array.isArray(data) && data.length === 0)) throw new Error("empty result");
    const next = JSON.stringify(data, null, 2) + "\n";
    const prev = await readFile(file, "utf8").catch(() => "");
    if (next !== prev) {
      await mkdir(cacheDir, { recursive: true });
      await writeFile(file, next);
    }
    return data;
  } catch (err) {
    console.warn(`[feeds] ${name}: using cached copy (${err.message})`);
    try {
      return JSON.parse(await readFile(file, "utf8"));
    } catch {
      return [];
    }
  }
}

export async function getText(url, headers = {}) {
  const res = await fetch(url, {
    headers: { "user-agent": "static-site-build", ...headers },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export const decode = (s = "") =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

export const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]).trim() : "";
};
