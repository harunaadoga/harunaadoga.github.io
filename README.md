# harunaadoga.github.io

Personal website of Haruna Umar Adoga, PhD: HPC infrastructure engineer and computing scientist. Built with [Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages by GitHub Actions.

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
| Name, role line, email, social links, navigation, SEO keywords | `src/_data/site.json` |
| Experience, education, certifications, skills, publications | `src/_data/profile.json` |
| Engineering portfolio (eight categories, projects) | `src/_data/portfolio.json` |
| Professional services | `src/_data/services.json` |
| Free courses | `src/_data/rhcsa.json`; hardening episodes are read from the linux-server-hardening README (`src/_data/hardening.js`) |
| Hand-picked posts from LinkedIn, X, TikTok | `src/_data/highlights.json` |
| Pages | `src/*.njk` |
| Blog posts | `src/posts/*.md` |
| Styles and scripts | `src/assets/` |
| Downloadable CV, robots.txt | `src/static/` |

## Pages

| URL | Purpose |
| --- | --- |
| `/` | Landing page: name, role, expertise, selected projects |
| `/about/` | Biography and technologies |
| `/experience/` | Professional experience with technical environment per role |
| `/portfolio/` | Engineering portfolio by category |
| `/research/` | Thesis, publications, Google Scholar |
| `/credentials/` | Academic qualifications, certifications, memberships |
| `/learn/`, `/rhcsa/`, `/hardening/` | Linux education and free courses |
| `/services/` | Consulting and training |
| `/writing/` | Technical blog |
| `/cv/` | Web CV and PDF download |
| `/contact/` | Contact form and links |
| `/media/`, `/engage/` | Videos and channels; speaking |

## Portfolio projects

Each project in `src/_data/portfolio.json` has a title, context, overview, problem, contribution, technologies, outcomes and links. Leave `problem` or `outcomes` empty if there is nothing verified to say; the page hides empty fields.

A project can carry a `todo` list of details still to be supplied. These show on the page as a dashed "To complete before publishing" box while `showPlaceholders` is `true` in `src/_data/site.json`. Set it to `false` to hide every placeholder across the site. The same switch hides the "Date and status to confirm" badges on `/credentials/`.

Set `"featured": true` on a project to list it on the home page.

## CV

`/cv/` is generated from `profile.json`, so it never drifts from the rest of the site. After changing your experience or skills, regenerate the PDF and commit it:

```bash
npm run cv
```

This needs Google Chrome or Chromium installed. The public CV deliberately leaves out phone number and postal address.

## Blog categories

Use these in a post's `topics` list so the filters stay tidy: Linux, HPC, OpenStack, Networking, Storage, Cloud Infrastructure, Infrastructure Automation, Cybersecurity, Research Computing.

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
