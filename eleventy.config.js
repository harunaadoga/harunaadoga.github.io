import rss from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

const slug = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(rss);
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addWatchTarget("src/assets/");
  // Feed caches are rewritten on every build; watching them would loop forever.
  eleventyConfig.watchIgnores.add("src/_data/cache/**");

  eleventyConfig.setLibrary(
    "md",
    markdownIt({ html: true, linkify: true, typographer: true }).use(markdownItAnchor, {
      slugify: slug,
      permalink: markdownItAnchor.permalink.headerLink({ safariReaderFix: true }),
      level: [2, 3],
    })
  );

  // Published posts, newest first. Drafts only show in `npm run dev`.
  const isDev = process.env.ELEVENTY_RUN_MODE !== "build";
  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("src/posts/*.md")
      .filter((p) => isDev || !p.data.draft)
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("topics", (api) => {
    const counts = new Map();
    for (const p of api.getFilteredByGlob("src/posts/*.md")) {
      if (!isDev && p.data.draft) continue;
      for (const t of p.data.topics || []) counts.set(t, (counts.get(t) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count, slug: slug(name) }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  });

  eleventyConfig.addFilter("slug", slug);
  eleventyConfig.addFilter("date", (d, style = "long") => {
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    if (style === "iso") return date.toISOString().slice(0, 10);
    if (style === "year") return String(date.getUTCFullYear());
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: style === "short" ? "short" : "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  });
  eleventyConfig.addFilter("readingTime", (html = "") => {
    const words = String(html).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 220));
  });
  eleventyConfig.addFilter("plain", (html = "") =>
    String(html).replace(/<pre[\s\S]*?<\/pre>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  );
  eleventyConfig.addFilter("limit", (arr = [], n) => arr.slice(0, n));
  eleventyConfig.addFilter("withTopic", (posts = [], topic) =>
    posts.filter((p) => (p.data.topics || []).includes(topic))
  );
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("absolute", (path, base) => new URL(path, base).toString());

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
