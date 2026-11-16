#!/usr/bin/env node
// Usage: npm run new -- "My post title"
import { writeFile, access } from "node:fs/promises";

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new -- "My post title"');
  process.exit(1);
}
const date = new Date().toISOString().slice(0, 10);
const slug = title.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
const file = `src/posts/${date}-${slug}.md`;

try {
  await access(file);
  console.error(`${file} already exists`);
  process.exit(1);
} catch {}

await writeFile(
  file,
  `---
title: ${JSON.stringify(title)}
description: "One or two sentences shown in listings and search results."
date: ${date}
topics: ["Linux"]
# Categories: Linux, HPC, OpenStack, Networking, Storage, Cloud Infrastructure,
# Infrastructure Automation, Cybersecurity, Research Computing (or add your own)
draft: true
# video: YOUTUBE_VIDEO_ID   (optional: embeds a video at the top)
---

Write your post here in Markdown.

## A section heading

Text, lists, images and code blocks all work.
`
);
console.log(`Created ${file}\nRemove "draft: true" when it is ready to publish.`);
