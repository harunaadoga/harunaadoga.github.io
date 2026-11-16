# Redesign notes (branch `engineer-redesign`)

This branch repositions the site around "HPC Infrastructure Engineer" and adds the sections a recruiter, institution or consultancy client looks for. The live site on `master` is untouched until this branch is merged.

## What changed

- **Positioning.** Name shown as "Haruna Umar Adoga, PhD" with the role line "HPC Infrastructure Engineer / Research Computing / Linux / Cloud & Networking".
- **Design.** Dark navy and white with one restrained amber accent, IBM Plex Sans and Mono, squared corners, ruled lists instead of stacked cards. Light theme is still available from the header toggle.
- **New pages.** `/experience/`, `/portfolio/`, `/services/`, `/credentials/`, `/cv/` (with PDF download).
- **Reworked pages.** Home, About, Research (Google Scholar added), Contact, Blog labels and categories, header and footer navigation.
- **SEO.** Keyword-bearing titles and descriptions on every page, canonical URLs, Open Graph and Twitter cards with a new preview image, `Person` and `WebSite` structured data on every page, `BlogPosting` data on posts, sitemap covering the new pages.
- **Fix.** The LinkedIn link pointed at an address that returns "not found". It now uses `linkedin.com/in/haruna-umar-adoga-72865517`. The live site on `master` still has the old link.

## Needs your attention

1. **Portfolio placeholders.** Dashed "To complete before publishing" boxes mark details only you can supply (the need each employer project met, public-safe diagrams, figures cleared for publication). Fill them in `src/_data/portfolio.json`, or set `showPlaceholders` to `false` in `src/_data/site.json` to hide them.
2. **Certification dates.** Only RHCSA (2025) has a date. AWS Cloud Practitioner, CCNA and ITIL v3 show "Date and status to confirm". AWS and Cisco certifications expire after three years, so please supply the year earned and whether each is current.
3. **MSc title.** The brief says "MSc Computer Science"; the CV says "MSc, Computing Science (Distinction)", University of Hertfordshire. The site follows the CV.
4. **Employer named again.** The About page and experience pages name the University of Sussex as current employer, which a professional experience section needs. The header and role line stay employer-neutral.
5. **Services and your employment.** `/services/` offers independent consulting and training. Check this against your contract's outside-work terms before it goes live.
6. **Google Scholar is back.** It was removed earlier at your request; the brief asks for it, so it is linked from Research, Contact and the social icons. ORCID stays removed.
7. **Public CV.** The PDF is generated from the site and leaves out phone and address. If you would rather offer your own PDF, replace `src/static/Haruna-Umar-Adoga-CV.pdf`.
8. **Architecture diagrams.** None are published, because no public-safe diagrams exist yet.
9. **Open repositories.** `ansible_lab` and `research-platform-lab` are listed with one-line descriptions only; a sentence on what each builds would help.

## Publishing

The workflow deploys only from `master`, so pushing this branch does not change the live site.

To preview:

```bash
git checkout engineer-redesign
npm install
npm run dev
```

To publish, merge into `master` and push:

```bash
git checkout master
git merge engineer-redesign
git push origin master
```

To drop the redesign, stay on `master` and delete the branch.
