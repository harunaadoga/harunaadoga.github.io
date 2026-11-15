// Latest videos from the YouTube channel's public RSS feed (no API key).
import { readFile } from "node:fs/promises";
import { cached, getText, tag } from "./_fetch.js";

export default async function () {
  const site = JSON.parse(await readFile(new URL("./site.json", import.meta.url), "utf8"));
  const id = site.feeds.youtubeChannelId;
  if (!id) return [];
  return cached("youtube", async () => {
    const xml = await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
    return xml
      .split("<entry>")
      .slice(1)
      .map((e) => {
        const videoId = tag(e, "yt:videoId");
        return {
          id: videoId,
          title: tag(e, "title"),
          published: tag(e, "published"),
          description: tag(e, "media:description").split("\n")[0].slice(0, 220),
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumb: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      })
      .filter((v) => v.id);
  });
}
