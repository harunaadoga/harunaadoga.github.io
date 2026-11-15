// Latest Medium stories. Stays empty until site.json → feeds.mediumHandle is set.
import { readFile } from "node:fs/promises";
import { cached, getText, tag } from "./_fetch.js";

export default async function () {
  const site = JSON.parse(await readFile(new URL("./site.json", import.meta.url), "utf8"));
  const handle = (site.feeds.mediumHandle || "").replace(/^@/, "");
  if (!handle) return [];
  return cached("medium", async () => {
    const xml = await getText(`https://medium.com/feed/@${handle}`);
    return xml
      .split("<item>")
      .slice(1, 7)
      .map((e) => ({
        title: tag(e, "title"),
        url: tag(e, "link").split("?")[0],
        published: new Date(tag(e, "pubDate")).toISOString(),
      }));
  });
}
