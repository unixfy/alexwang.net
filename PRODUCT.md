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
- Stack: SvelteKit 3, Svelte 5, Tailwind CSS 4, Directus SDK; keep dependencies and extra code to a minimum.
- Content sources (Directus, WordPress) stay as they are.
- Light and dark mode must both be supported, with the choice persisted.

## Brand Commitments
- Brand purple `#7E1F86` (theme color, project section) and the hand-written signature mark are part of the identity.
- Fonts in use: IBM Plex Sans (body) and Space Grotesk (display).

## Evidence on Hand
Real projects, certifications, recognitions, social links and blog posts exist in the CMS/blog. No testimonials or metrics are on file; do not invent any.

## Product Principles
1. One hub, many entry points: every audience should reach their destination within a click or two.
2. Content belongs in the CMS; the front end presents it and stays lean.
3. Fewer dependencies and less code beat cleverness.
4. Light and dark are equal citizens.

## Accessibility & Inclusion
No product-specific standard stated; semantic, keyboard-operable controls are expected (the navbar now uses real buttons and links).
