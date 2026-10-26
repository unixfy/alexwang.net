# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Alex Wang's personal site serves four overlapping audiences: recruiters and hiring managers evaluating background, certifications and projects; peers and collaborators in Alex's professional network; readers of Alex's blog (blog.alexwang.net); and social/link-in-bio traffic arriving at `/links` from a profile.

## Product Purpose

A personal home base that gathers everything in one place: introduction, writing, projects, certifications, recognitions, and ways to get in touch. There is no single conversion goal; success is that each visitor finds what they came for (the blog, a project, credentials, or a contact path) quickly.

## Positioning

It is one person's own hub rather than a template portfolio: content is authored in a self-hosted CMS and blends a portfolio, a blog front door, and a link-in-bio page under one identity.

## Operating Context

- Content is CMS-driven: Directus at cms.alexwang.net supplies config (banner, welcome text, profile picture, SSH key), projects, certifications, recognitions, socials, links and generic pages (`/[slug]`, e.g. /now, /i-like).
- The blog lives separately on WordPress (blog.alexwang.net); the homepage pulls the latest four posts via its REST API.
- Routes: `/`, `/projects`, `/project/[slug]`, `/links`, `/sshkey`, CMS pages; `/linkedin` redirects out, `/portfolio` redirects to `/projects`.
- Deployed on Cloudflare (SvelteKit adapter-cloudflare), installable as a PWA.

## Capabilities and Constraints

- Stack: SvelteKit 3, Svelte 5, Tailwind CSS 4, daisyUI 5 (the owner's chosen UI primitive library: navbar, menu, buttons, badge, collapse, swap, toast, alert, skeleton, progress; themed from the site's own tokens, never stock themes), Directus SDK, and three.js (the owner asked for it; it draws only the home page's signal-tower rail, is lazy-loaded as its own chunk, and only on screens 1280px and wider). Animation: Motion (`motion`, Framer Motion's framework-agnostic successor) for anything complex, Tailwind utility classes for anything simple, and never a scroll event listener. Every package is installed as a devDependency (`npm i -D`). Dependencies stay few: heavy visual effects are hand-written (the home page's WebGL2 map is a single shader with no library) or lazily loaded, never a framework added for one effect.
- Ambitious visuals are welcome (WebGL, scroll-driven and generative motion) provided every effect degrades: the page must be complete without WebGL2 and without JavaScript, respect `prefers-reduced-motion`, pause when off screen, and hold up on integrated and budget mobile GPUs.
- Content sources (Directus, WordPress) stay as they are.
- Light and dark mode must both be supported, with the choice persisted.

## Brand Commitments

- Brand purple `#7E1F86` (theme color, project section) and the hand-written signature mark are part of the identity.
- Typography is a working choice, not a fixed commitment. Currently Archivo Variable (display, expanded and heavy like station signage) and Public Sans Variable (text), both Latin-subset variable files. The owner has said the fonts may be changed freely.
- The site's visual world is a transit line diagram: one purple trunk, stations as rings, branch lines in teal (Writing) and amber (Contact).

## Evidence on Hand

Real projects, certifications, recognitions, social links and blog posts exist in the CMS/blog. No testimonials or metrics are on file; do not invent any.

## Product Principles

1. One hub, many entry points: every audience should reach their destination within a click or two.
2. Content belongs in the CMS; the front end presents it and stays lean.
3. Fewer dependencies and less code beat cleverness, unless the extra code is the distinctive thing and it degrades gracefully.
4. Light and dark are equal citizens.

## Accessibility & Inclusion

No product-specific standard stated; semantic, keyboard-operable controls are expected (the navbar now uses real buttons and links).
