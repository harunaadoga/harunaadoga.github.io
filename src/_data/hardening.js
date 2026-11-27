// Linux Server Hardening series. The episode list is read from the repository's
// README at build time, so a new episode appears here once its row is added there.
// The site rebuilds daily; run the "Build and deploy" workflow to update sooner.
import { cached, getText } from "./_fetch.js";

const repo = "https://github.com/harunaadoga/linux-server-hardening";
const branch = "main";

// Rows look like: | 05 | Filesystem Security | [Steps](./05-filesystem/README.md) | ... | [▶ Watch](https://youtu.be/ID) |
function parse(readme) {
  return readme
    .split("\n")
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => {
      const cells = line.split("|").map((c) => c.trim());
      const slug = (line.match(/\]\(\.\/([^/)]+)\//) || [])[1];
      const video = (line.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/) || [])[1] || "";
      return { n: cells[1].padStart(2, "0"), title: cells[2], slug, video };
    })
    .filter((e) => e.slug && e.title);
}

export default async function () {
  const episodes = await cached("hardening", async () =>
    parse(await getText(`https://raw.githubusercontent.com/harunaadoga/linux-server-hardening/${branch}/README.md`))
  );
  return { repo, branch, episodes };
}
