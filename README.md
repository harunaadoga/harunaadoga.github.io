# harunaadoga.github.io

Personal website of Dr Haruna Adoga. Built with [Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages by GitHub Actions.

## Write a post

```bash
npm run new -- "My post title"
```

This creates a Markdown file in `src/posts/`. Edit it, remove `draft: true`, commit and push. The site rebuilds and publishes on its own.

You can also add a file in `src/posts/` straight from the GitHub website. Name it `YYYY-MM-DD-short-title.md` and start it with:

```yaml
---
title: "Post title"
description: "One or two sentences for listings and search results."
date: 2026-11-15
topics: ["Linux", "How-to"]
# video: YOUTUBE_VIDEO_ID   (optional, embeds a video at the top)
---
```

## Preview locally

```bash
npm install
npm run dev
```

Then open http://localhost:8080. Drafts are visible locally and hidden on the live site.

## Where things live

| What | File |
| --- | --- |
| Name, email, social links, feed settings | `src/_data/site.json` |
| Career, education, publications, services | `src/_data/profile.json` |
| Hand-picked posts from LinkedIn, X, TikTok | `src/_data/highlights.json` |
| Pages | `src/*.njk` |
| Posts | `src/posts/*.md` |
| Styles and scripts | `src/assets/` |

### Social channels

Add a profile URL for `x`, `tiktok` or `medium` in `site.json` and its icon and card appear across the site. Set `feeds.mediumHandle` to list your latest Medium stories.

YouTube videos and GitHub repositories are fetched at build time, and the site rebuilds daily to stay current.

LinkedIn, X and TikTok do not offer public feeds. To feature a post, add an entry to `highlights.json`:

```json
[
  { "platform": "linkedin", "title": "Reflections from SC26", "url": "https://www.linkedin.com/posts/...", "date": "2026-11-20", "note": "Optional one-line summary." }
]
```

## Deployment

`.github/workflows/deploy.yml` builds and publishes on every push to `master`, daily, and on demand. In the repository settings, **Pages → Build and deployment → Source** must be set to **GitHub Actions**.
