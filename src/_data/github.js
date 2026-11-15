// Recently updated public repositories from GitHub's public API.
import { readFile } from "node:fs/promises";
import { cached, getText } from "./_fetch.js";

export default async function () {
  const site = JSON.parse(await readFile(new URL("./site.json", import.meta.url), "utf8"));
  const user = site.feeds.githubUser;
  if (!user) return [];
  return cached("github", async () => {
    const headers = { accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const repos = JSON.parse(
      await getText(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=30`, headers)
    );
    return repos
      .filter((r) => !r.fork && !r.archived && r.description && !r.name.endsWith(".github.io"))
      .slice(0, 6)
      .map((r) => ({
        name: r.name,
        url: r.html_url,
        description: r.description || "",
        language: r.language || "",
        stars: r.stargazers_count,
        pushed: r.pushed_at,
      }));
  });
}
