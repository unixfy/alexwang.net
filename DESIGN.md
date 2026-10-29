---
name: alexwang.net
description: One person's hub drawn as a transit line diagram, one purple trunk, stations as rings, a living map behind the doors.
colors:
  brand-50: 'oklch(0.975 0.012 324.6)'
  brand-100: 'oklch(0.95 0.03 324.6)'
  brand-200: 'oklch(0.9 0.06 324.6)'
  brand-300: 'oklch(0.82 0.1 324.6)'
  brand-400: 'oklch(0.7 0.15 324.6)'
  brand-500: 'oklch(0.55 0.18 324.6)'
  brand-600: 'oklch(0.438 0.176 324.6)'
  brand-700: 'oklch(0.37 0.15 324.6)'
  brand-800: 'oklch(0.3 0.12 324.6)'
  brand-900: 'oklch(0.24 0.09 324.6)'
  brand-950: 'oklch(0.18 0.06 324.6)'
  paper: 'oklch(0.985 0.004 324.6)'
  paper-shade: 'oklch(0.966 0.006 324.6)'
  rule-light: 'oklch(0.87 0.011 324.6)'
  meta-gray: 'oklch(0.46 0.016 324.6)'
  ink: 'oklch(0.21 0.012 324.6)'
  night: 'oklch(0.145 0.01 324.6)'
  night-raised: 'oklch(0.27 0.014 324.6)'
  rule-dark: 'oklch(0.37 0.016 324.6)'
  line-writing-day: 'oklch(0.52 0.09 200)'
  line-writing-night: 'oklch(0.78 0.09 200)'
  line-contact-day: 'oklch(0.62 0.14 65)'
  line-contact-night: 'oklch(0.8 0.14 75)'
typography:
  display:
    fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(3.25rem, 1.5rem + 7vw, 6rem)'
    fontWeight: 800
    lineHeight: 1
    letterSpacing: '-0.035em'
    fontVariation: "'wdth' 118"
  title:
    fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(1.875rem, 1.3rem + 2.2vw, 3rem)'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: '-0.02em'
  page:
    fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(2rem, 1.5rem + 2vw, 3rem)'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '-0.02em'
  group:
    fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1.5rem'
    fontWeight: 700
    lineHeight: 1.2
  item:
    fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)'
    fontWeight: 700
    lineHeight: 1.25
  lede:
    fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(1.25rem, 1rem + 1.2vw, 1.875rem)'
    fontWeight: 400
    lineHeight: 1.3
  prose:
    fontFamily: "'Public Sans Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem)'
    fontWeight: 400
    lineHeight: 1.65
  meta:
    fontFamily: "'Public Sans Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
rounded:
  sm: '0.25rem'
  lg: '0.5rem'
  photo: '1rem'
  pill: '9999px'
spacing:
  station-y-sm: '3.5rem'
  station-y-md: '5rem'
  trunk-x-sm: '1.5rem'
  trunk-x-md: '2.5rem'
  content-x-sm: '3.5rem'
  content-x-md: '6rem'
  ring: '1.5rem'
  trunk-width: '0.375rem'
components:
  trunk:
    backgroundColor: '{colors.rule-light}'
    width: '{spacing.trunk-width}'
    rounded: '{rounded.pill}'
  trunk-lit:
    backgroundColor: '{colors.brand-600}'
    width: '{spacing.trunk-width}'
  trunk-lit-night:
    backgroundColor: '{colors.brand-300}'
  station-ring:
    backgroundColor: '{colors.paper}'
    size: '{spacing.ring}'
    rounded: '{rounded.pill}'
  station-ring-night:
    backgroundColor: '{colors.night}'
  train:
    backgroundColor: '{colors.brand-600}'
    width: '0.875rem'
    height: '1.75rem'
    rounded: '{rounded.pill}'
  door-title:
    typography: '{typography.title}'
    textColor: '{colors.ink}'
  name-plate:
    typography: '{typography.display}'
    textColor: '{colors.brand-600}'
  name-plate-night:
    textColor: '{colors.brand-300}'
  nav-item:
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
  nav-item-current:
    backgroundColor: '{colors.brand-600}'
    textColor: '#ffffff'
  nav-item-current-night:
    backgroundColor: '{colors.brand-300}'
    textColor: '{colors.night}'
  copy-button:
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '2rem'
  cta-fill:
    backgroundColor: '{colors.brand-600}'
    textColor: '#ffffff'
    rounded: '{rounded.lg}'
    height: '3rem'
  cta-fill-hover:
    backgroundColor: '{colors.brand-700}'
  cta-fill-night:
    backgroundColor: '{colors.brand-300}'
    textColor: '{colors.night}'
---

# Design System: alexwang.net

## Overview

**Creative North Star: "The Line Diagram"**

The site is one person's hub drawn as a Beck-style transit diagram. One purple trunk runs down the home page; every section is a station hung off it as a ring; the three doors (Work, Writing, Contact) are lines that continue into a living WebGL map behind the hero. By day it is ink on paper; by night it is a glowing map on near-black. Light and dark are equal citizens, switched by the `.dark` class on `html` (which also sets the matching daisyUI theme).

The type is signage: Archivo Variable set expanded and heavy for the name, a tight heavy title for each station, Public Sans Variable for everything read. Every neutral shares the brand hue (324.6), so no gray is dead. Color is rationed: purple owns the trunk, links, focus and the name; teal and amber each belong to exactly one branch.

The home page is the full expression of the world, and the interior pages inherit it. Projects, project pages, CMS pages and links are more stops on the same line: the page heading is the terminus, section headings are stations, and the page ends at a closing station that points onward. They use the same trunk, rings and type roles but drop the map. Errors and the SSH key page are the exceptions: the error page is a line that runs out, and the SSH key is a ticket.

UI primitives come from daisyUI 5: buttons, the navbar and menus, badge, collapse, swap, toast, alert, skeleton and progress. They are themed by two custom themes, `line` (day) and `line-night`, which are derived from the site's own tokens, so a token change flows straight through to every primitive. The primitives are flat (depth 0, no noise), drawn with 2px borders and tight radii. The line-diagram pieces (trunk, stations, rings, terminus, the SSH ticket, the error line) stay bespoke and are not daisyUI.

**Key Characteristics:**

- One vertical trunk, stations as ringed nodes, content indented to a fixed content column.
- Octilinear geometry only in the map: 45 and 90 degree routes.
- Brand purple plus two branch hues; tinted neutrals.
- UI primitives are daisyUI, themed from the site's tokens; the line-diagram pieces are hand-drawn.
- Flat surfaces, no elevation system; depth comes from the lit trunk, rings and the map's bloom at night.
- Every motion has a still equivalent; the page is complete without WebGL2 or JavaScript.
- Interior pages ride the same line; CMS content is styled by its semantic elements, so editors can rewrite freely.

## Colors

A purple trunk and ink-on-paper neutrals, with one teal and one amber branch. Brand-600 is the brand color (#7E1F86, also the PWA theme color); brand-300 is its night counterpart.

### Primary

- **Trunk Purple** (brand-600, oklch(0.438 0.176 324.6)): the trunk's lit edge, the name at display size, links, the train, the Work line, the current-page pill and current route stop (daisyUI primary), fills of calls to action. At night it becomes **Night Lilac** (brand-300).
- **Focus Purple** (brand-500 by day, brand-300 by night): the 2px focus outline with 2px offset; accent-color follows brand-600 / brand-300.

### Secondary

- **Writing Teal** (`--line-writing`: oklch(0.52 0.09 200) day, oklch(0.78 0.09 200) night): the Writing door, its station and its map route.
- **Contact Amber** (`--line-contact`: oklch(0.62 0.14 65) day, oklch(0.8 0.14 75) night): the Contact door, its station and its map route.

On interior pages the three line colours cycle (Work, Writing, Contact, repeat) down successive stations: project years, links, and the h2s of CMS content. There they mark position along the line, not a section; the closing end station is always Contact amber.

### Neutral

- **Paper** (gray-50) and **Night** (gray-950): page grounds; ring centers and covers repaint with the ground.
- **Paper Shade** (gray-100 / gray-800 at night): quiet bands on interior pages.
- **Hairline** (gray-300 day, gray-700 night): the unlit trunk and list dividers.
- **Ink** (gray-900) and white at night: body and headings. Base text colour is set in the base layer from this tinted ink, never the browser default. Secondary text is gray-700 / gray-300; meta is gray-600 / gray-300.
- **Theme mapping.** daisyUI reads these tokens, never stock colours. Day (`line`): primary brand-600, secondary Writing Teal, accent Contact Amber, base-100/200/300 gray-50/100/200, base-content gray-900, neutral gray-900. Night (`line-night`): primary brand-300, secondary and accent the night line hues, base-100/200/300 gray-950/900/800, base-content white. Success takes the teal and warning the amber; info is brand-500 / brand-400; error is a red (oklch 0.5 0.2 27 day, 0.7 0.17 25 night). Content on primary is white by day and gray-950 at night.
- The full tinted ramp (gray-50 to gray-950, brand-50 to brand-950) is defined in `@theme`; the frontmatter lists the steps in use.

### Named Rules

**The Hue Rule.** Every gray carries hue 324.6 at chroma 0.004 to 0.016. A neutral with no hue does not belong.

**The One Line, One Color Rule.** On the home page teal means Writing and amber means Contact. Branch hues are never used decoratively, and no fourth line color is added without a fourth door. On interior pages the same three hues cycle by station position (the Cycle Rule below), the one sanctioned departure.

**The Cycle Rule.** Down any interior page, successive stations take Work, Writing, Contact in turn (every third) and then repeat. The end station is Contact.

**The Underline Rule.** Links are brand-colored and always underlined; color is never the only cue. Links inside daisyUI buttons and menus are not repainted; the link rule skips them.

**The Derived Theme Rule.** daisyUI colours come from the tokens by reference (`var(--color-brand-*)`, `var(--color-gray-*)`, the line hues), never from a copied value, and the stock themes are off.

## Typography

**Display Font:** Archivo Variable (width axis 62 to 125%, weight 100 to 900), fallback ui-sans-serif, system-ui
**Body Font:** Public Sans Variable (weight 100 to 900), same fallbacks
**Character:** Archivo, expanded and heavy, reads like station signage; Public Sans is plain and readable at length. Both are Latin-subset variable files. The pairing is a working choice and may change.

### Hierarchy

- **Display** (800, clamp(3.25rem, 1.5rem + 7vw, 6rem), 1.0, width 118%, -0.035em): the name on the home terminus only.
- **Title** (700, clamp(1.875rem, 1.3rem + 2.2vw, 3rem), 1.0, -0.02em): each station heading and each door label. Ring position derives from this size.
- **Page** (700, clamp(2rem, 1.5rem + 2vw, 3rem), 1.1): the h1 of interior pages, brand-coloured; the ring centres on it (`--page-size`).
- **Group** (700, 1.5rem, 1.2): the parts of a station (Employment, Education, Projects, Certifications, Recognition). Each is a small station of its own: a ring on the trunk and a stub to the heading (`.group-head`).
- **Item** (700, clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem), 1.25): titles of the main entries: employers, schools, projects, posts, destinations.
- **Entry** (700 Archivo, 1.0625rem, 1.3): the same role one step down, for entries set in a grid (certifications, recognition).
- **Lede** (400 Archivo, clamp(1.25rem, 1rem + 1.2vw, 1.875rem), 1.3): the tagline.
- **Prose** (400 Public Sans, clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem), 1.65, max 65ch): long reading; at night letter-spacing 0.01em and line-height 1.75.
- **Meta** (0.875rem, gray-600 / gray-300): dates, references. Every date on the home page is MM/YYYY with tabular numerals.

### Named Rules

**The Signage Rule.** Only Archivo carries wide, heavy, tight-tracked setting; and only the name uses the 118% width. Text never goes heavy-expanded.

**The Role Rule.** New text takes one of the named roles. Heading balance (`text-wrap: balance`) and prose `pretty` wrapping are on globally.

## Layout

The home page is a single column offset by the trunk. `.line-page` is a relative box with the trunk as a 0.375rem pill at `--trunk-x` (1.5rem, 2.5rem from 48rem); content starts at `--content-x` (3.5rem, 6rem from 48rem). Stations pad 3.5rem top and bottom (5rem from 48rem); the terminus pads 6rem on top (8rem from 48rem). Station content is capped at 56rem and widens with the screen (see Width follows the screen) and the hero grid at 6xl; the portrait sits at the right on wide screens and above or below on narrow. Interior pages (projects, a project, CMS pages, links) also sit on `.line-page`: the opener is `.terminus-page` (6.5rem top padding, 8rem from 48rem; ring centred on the Page-role heading), followed by stations and a closing `station-end`. Grids sit inside the station column: project cards are two columns from 640px and three from xl, a project is a 5:6 image and text split from lg, and a CMS page is a 70ch column plus a 15rem route strip from xl. The `.ct` container (max 1920px) remains for the optional site banner. The SSH key page is a standalone centred ticket.

CMS content (`.page-content-container`) gets an even 1rem vertical rhythm between blocks (0.35rem between list items), empty blocks are hidden, and links are brand-coloured and underlined. Each `h2` inside a `.ride` container becomes a station: ring and stub hang left of the content column in the cycling line colour.

On xl and wider the home page also carries the signal tower rail in the right gutter (`w-64`, 1.5rem from the right edge, sticky 7rem from the top, height min(34rem, 100vh - 9rem)); the pointer passes through everything but the links.

The trunk is hidden above the first station and below the last by ground-colored covers (`station-start`, `station-end`), so the line has real termini. The map is a canvas filling the hero and doors host; it is decorative and absolute behind the type. Below 700px the map's geometry changes: the door lines turn back into the free space beside the portrait instead of running right.

Width follows the screen. Everything is in rem, and the root font size steps up on large displays (112.5% from 1600px, 125% from 2200px), so the page scales instead of floating in a big empty ground. Station lists sit in `.wide`: a 56rem measure that grows to 64rem at xl and, from 2xl, to the room left of the signal-tower rail (`--rail`, set on the home page), and it is a query container, so the Work list and the blog run in two columns, certifications in three and recognition in two or three once the container reaches 64rem or 80rem (`@5xl`, `@7xl`). On 2xl and wider, a CMS page with headings becomes an annotated timeline: each `h2` stands on the trunk in a 11-20rem column and its text sits beside it (74ch), what comes before the first heading spans both, and the table of contents keeps the right rail; a heading shares a row, and a top edge, with its first block, skipping the empty paragraphs the editor leaves behind. A project page is an exhibit: the image takes 5/12 of the width at lg, 6/12 at xl and 7/12 at 2xl and stays in view while the text scrolls, with previous and next stops as thumbnail links. The projects page is an auto-fit grid of 20-30rem cards, so a year with three projects fills its row.

Spacing rhythm is Tailwind's 4px scale; lists are dividers, not cards.

## Elevation & Depth

Flat. Surfaces are not lifted; there are no shadows on the home page. The daisyUI themes set depth and noise to 0, so buttons, alerts and menus are flat too. Depth is the lit trunk over the unlit trunk, ring covers, and, at night only, soft bloom on pulsing map routes. Photos dim slightly at night (brightness 0.9). The build carries no shadows at all; project cards have no chrome, just image and title. The SSH ticket and CMS blockquotes get their edge from a border.

### Named Rules

**The Flat Line Rule.** On the line-diagram surfaces, stations and rings are drawn with borders and fills, never shadows.

## Shapes

Rings are circles (1.5rem, 0.3125rem border in the line color, center filled with the page ground). Lines are pills (999px caps). Photography is softly rounded (rounded 4px for thumbnails, 1rem for the portrait, 0.5rem for project images, a full circle for the links avatar). daisyUI shapes come from the themes: buttons and fields 0.5rem, badges and swaps 0.25rem, boxes (alert, collapse) 0.75rem, all with a 2px border. Interior CTA buttons are 0.5rem; social link buttons are full pills. The missing stop on a 404 is a dashed ring; the SSH ticket is 1rem rounded with circular notches (1.5rem) at the ends of its dashed divider. The map is strictly octilinear: routes turn only at multiples of 45 degrees. Its station rings, interchanges included, are filled with the page ground colour (gray-50 / gray-950), not white.

## Brand Mark

A W drawn as a route: one round-capped line, three interior stops cut out as rings in the three door colours (Work purple, Writing teal, Contact amber). The rings are masked out of the line, so the mark is transparent and sits on any ground. Files in `static/`: `mark.svg` (day), `mark-night.svg` (dark grounds), `mark-mono.svg` (`currentColor`), `favicon.svg` and `icon-maskable.svg` (heavier stroke and larger stops for small sizes, white W with night-tint rings on a brand-purple tile), plus PNG exports and the 1200x630 `og.png` share card (Archivo heavy at wdth 118 on brand purple). Use the tile versions wherever the host crops or backgrounds the icon; use the bare mark on the site's own surfaces. Never recolour a ring or change their order. On every page but the home page the mark sits in the top left of the navbar with the name beside it in the Display face (800, width 118%), the mark centred on the trunk's axis so the line appears to start from it; on phones it is the middle of the menu bar. It is drawn inline with the site's tokens (the W in brand colour, the rings in the three line colours), so it follows the theme, and it links home.

## Components

### Trunk, station and ring (signature)

A station is a block with the ring on the trunk at `--ring-top` and a short stub of the line color (0.3125rem tall) reaching toward the content. Sections default to the Work (purple) line; Writing and Contact set `--line`. Door stations set `--ring-top: 50%`. On hover or keyboard focus of a door, the ring fills with its branch color (0.2s ease-out; none under reduced motion).

### Train

A small pill (0.875rem by 1.75rem, ground-colored 3px border) riding the lit edge of the trunk. Shown only where scroll-driven animation is supported and motion is allowed. Its ride ends at `calc(100% - 2rem)`, just short of the page end.

### Signal tower

From xl (1280px) the home page's right-hand gutter holds a sticky rail of section shortcuts (About when the welcome text exists, Work, Writing, Beyond work, Contact) drawn as a small 3D copy of the line: a bespoke line-diagram piece, not daisyUI. Behind the links, three.js draws a tilted orthographic spine with a lit part running from the top to a train capsule that follows the reader, pulses falling to the train, and per station a camera-facing ring (always a true circle, ground-filled so the spine does not show through) standing on a small hexagonal platform, with a soft glow. The drawing and the labels have separate columns: the first 6rem of each link is the drawing's (spine at 42px, platforms 28px either side, symmetric so they cannot swing under the text) and the label starts clear of it, never wrapping. Colours are the site's tokens (line colours per station, hairline track, gray platforms) and repaint on theme change. The current section's ring is larger and glows and its platform takes a tint of the line colour; hovering or focusing a link lights its station and leans the tower. The parts of Work (Employment, Education, Projects, Certifications, Recognition) follow Work as smaller stops: a 0.65 scale station and a 0.9375rem, 600 label on a tighter row. Labels are Item-role links (sub-stops one step quieter), one per stop, and the canvas is decorative. Without WebGL, or below xl, the rail stays as a plain CSS spine with a ring dot at every link.

### Entry grammar (Work)

One grammar for every list in Work. A date sits first (left column from md, above the entry below it) in Meta type; then the title (Item for main entries, Entry in grids), a bold role line, a Meta line for place, and a description at 0.875-1rem in gray-700 / gray-300, one paragraph per line break. Employment and education entries are stops on the trunk (`.stop-mark`: a small ring where the entry begins; the one still running is filled and breathes, still when motion is reduced). A project's entry puts its span under the title (home, `/projects` and the project page all use the same `MM/YYYY – MM/YYYY` or `– Present` span), then an excerpt; when it has a link, a small outlined button below the row is labelled with the link's domain, and the project page's button uses the same label. The "more" links (All projects, More on the blog) are one shared row. Entries in two or three columns carry no stop, since only the first column sits beside the trunk. A link in a list or row is ink and underlines on hover or focus (`.ink-link`, or the row's own hover); a link in running prose stays brand and underlined.

### Door row

Title role label, a live "Latest:" line in secondary text, and a down arrow at the far end that marks where the map route begins. Hover underlines the label in the branch color (4px, offset 8px) and nudges the arrow down.

### Lists

Project, post and destination rows are dividers (gray-300 / gray-700) with a year column, an Item-role title that underlines on hover, and a 16:9 thumbnail on larger screens.

### Navigation (interior and home)

daisyUI navbar, menu and swap, in Archivo. From 48rem it floats at the top right as a horizontal large menu with no bar behind it; the current page carries `aria-current="page"` and renders as the active pill, filled brand-600 with white text (brand-300 with dark text at night). Next to it, a ghost circle sun/moon swap toggles dark mode (swap-rotate, `aria-pressed`). Under 48rem it is a full-width bar on base-200: a 48px ghost burger/X swap-rotate button (`aria-expanded`, `aria-controls`) and the 48px theme toggle, with a large menu list below that opens on tap. The list closes on Escape, on a tap outside the nav, and when a link is chosen; without scripts it stays open. The theme switch crossfades through the view transition API over 0.4s. Page changes use a view transition too where supported (0.5s group timing, so shared images morph) and a 200ms fade otherwise; neither runs under reduced motion.

### Buttons

daisyUI buttons in the line theme: flat, 2px border, 0.5rem radius. Primary is brand-600 with white text (brand-300 with dark text at night): the "View project" call to action (large, full width) and the error page's "Back to the start". Ghost is the error page's "Projects" and the nav toggles. Soft and large with a full-pill radius are the social links on the links page. Small outline is the copy button; a plain small button sits in the home blog-failure alert. The fold toggle on long lists is a small link-style button. Focus uses the global brand outline.

### Copy button

Shared component. A small outlined daisyUI button; on success it turns the success (teal) fill and reads "Copied" for 1.8s, and a daisyUI toast at the bottom end of the screen carries a success alert "{what} copied". A polite live status region announces it; the toast is hidden from assistive tech. Used for the email on the home page and the SSH key.

### Badge

The "New since your last visit" note is a primary badge (brand fill, matching text colour).

### Alert and skeleton

Alerts are flat daisyUI boxes: a warning alert (amber) when the SSH key is unavailable, a soft alert for a comment that did not send, and a success alert once one is held for moderation. The home page is complete on the server, so nothing loads in late; the skeleton primitive stays available, and its shimmer stops under reduced motion.

### Forms

Every form control is a daisyUI primitive, never a hand-built field: `fieldset` with `fieldset-legend` for a group, `label` for each label, `input`, `textarea`, `validator` with `validator-hint` for inline validation, `join` for a field fused to its button (search), `loading` for a pending button, `breadcrumbs` and `tab` for trails and filters. daisyUI is built with an explicit `include` list in `src/app.css`, so a primitive that is not on that list renders unstyled: add it there before using it. The controls take the theme's 2px border and 0.5rem field radius; do not restyle them with utility borders. Used by the blog's search and the comment form.

### Blog

The blog is the Writing line (teal), at `/blog`. The archive opens on a lead story (image, Title-role headline, summary, a primary "Read the post" button), then the rest grouped by year as stations, as on the projects list, three to a row from the width up, loading more as the reader scrolls (the "Older posts" link underneath is the same step without script). A post's headline in a list is always underlined in the line colour with an arrow after it; hover thickens the underline and moves the arrow, so it reads as a link before it is touched. Date and category sit under the headline; the category is a small ring in the line colour and the name in small caps. There is no eyebrow above a headline.

The archive's header sits on the same living map as the home page (`Network`, one shader, no three.js): the teal Writing line at full strength with its pulses, the other routes dimmed, the title and the tabs row kept clear of lines, the cursor bending lines nearby, faded out at the top (under the navbar) and bottom, and at a 0.4 strength on phones. It stops off screen and under reduced motion draws one still frame. A post's length reads as a ride: "4 min ride".

Navigation: a daisyUI tabs row ("All posts" first, the current category underlined), breadcrumbs on a category, tag or search ("Blog / Name"), a search join and an RSS button (RSS is XML, so its links reload the page rather than use the client router). A post has an "All posts" outline button and, when comments are open, a Comments link in its meta line, the same two in a sticky right rail from xl (with contents, tags and the category), and closes with the same "Keep riding" neighbour stops as a project, from one shared component: previous is the newer post, next the older, the end of the line is "All posts", ← and → ride. Comments are stops on a branch line: each is a plain station ring (no avatar, no initial) in a line colour that changes with reply depth, a grey track runs from a comment down through its replies, and the count sits in the station title. Names and the "replying to" note wrap, so a long name never breaks the box. The form is a ticket, as on the SSH key page: the message above a dashed perforation with a notch at each edge, name, email and the submit button on the stub below. The post body is a CMS page: each h2 a station, photos at their own proportions and never taller than 75% of the screen.

### Interior terminus and end station

Every interior page opens with the ring on the Page-role heading (`.terminus-page`) and closes on a `station-end` titled for where to go next: "Next stop" on CMS pages, "Keep riding" on projects (previous and next project, with year in meta), the last year on the projects list, "Elsewhere" on links. The closing station is Contact amber (on the projects list the last year takes its cycle colour).

### Project list

Projects are grouped by year; each year is a Title-role station cycling line colours. A project is a 16:9 image and an Item-role title, with no card chrome; hover underlines the title and brightens the image slightly. A project without an image shows a gray block of the same ratio. The list image and the project page image share a view-transition name so the picture travels between pages.

### Project page

Terminus title; a meta line "Stop N of M · year" beside the route strip (from sm: one dot per project on a hairline, newest first, the stops already passed lit like the trunk, the current one a station ring, every dot a link with the project name as its label) and a link to all projects. Below: the image as a sticky exhibit beside the CMS prose, whose first paragraph leads in the display face (`first-lede`), a full-width primary "View project" button whose arrow lifts on hover, and a published date. The closing station, "Keep riding", is a pair of stops that say which way they go: Previous is a quiet outlined card with a grey ring and a back arrow on the left; Next is the way on, brand-tinted with a filled brand ring, a forward arrow and the label in brand colour, on the right (first on phones); the newest project has no Previous and the oldest ends with a flag ring and "End of the line", linking to all projects. On wide screens the cards carry thumbnails and ← / → key hints, and the keys move between projects.

### CMS page

The title is the terminus; each h2 is a station. A route strip lists the page's own h2s as a large daisyUI menu (sticky aside from xl; below xl a daisyUI collapse with an arrow, "Stops on this page", around a menu on base-200). The stop nearest the reading position carries `aria-current="location"` and renders as the active brand-purple item: the last heading above 45% of the viewport, the first until then. A returning visitor sees a primary badge, "New since your last visit", when the page changed since they last looked. Lists over 12 items keep 8 visible behind a "Show N more" link-style button.

### CMS content elements

Styled by semantic element so editors need no classes: blockquote is a plate (0.5rem radius, 2px brand border, Archivo, raised ground); hr is a 3px dashed track in the Work colour; a table is a timetable (full width, tabular numerals, inverted header row in brand-600 with white text, brand-300 with dark text at night, hairline row dividers); figcaption is meta.

### Links page

The avatar is the terminus. Each link is a station row (ring centred on the row, line colour cycling); hover or focus fills its ring. Social links are soft large full-pill buttons in the "Elsewhere" end station.

### SSH key ticket

A perforated ticket: bordered rounded plate, the key in bold monospace (select-all on click), a dashed divider with a notch at each end, and the Copy button. If the key is missing it shows a warning alert instead.

### Error page

A line that runs out. A 404 shows a bar, a dashed gap, then a dashed ring: the stop that is not there. Any other error shows the bar broken in two by the gap. Headline in Page role, with a primary "Back to the start" button and a ghost "Projects" button.

### Signature

The hand-written signature SVG closes the page and is written left to right as it enters view; inverted at night.

## Do's and Don'ts

### Do:

- **Do** let brand-600 (brand-300 at night) own the trunk, links, name and focus.
- **Do** give any new branch a line color via `--line` and keep the ring, stub and underline in that color.
- **Do** give every effect a still equivalent: whole lit trunk, finished map frame, whole signature.
- **Do** keep light and dark equal: override colors in the `.dark` class, not by media query.
- **Do** keep map fades behind type (data-calm regions go to about a tenth strength).
- **Do** open every interior page on a terminus ring and close it on an end station.
- **Do** style CMS content through semantic elements (`h2`, `blockquote`, `table`, `hr`), never per-page classes, and keep scripted enhancements optional so the content reads whole without scripts.

- **Do** keep the signal tower's shortcuts as real links with the 3D layer purely decorative, and measure station positions from the links in the DOM so labels and drawing never drift.
- **Do** reach for a daisyUI primitive before hand-rolling one, and theme it from the tokens.
- **Do** keep the daisyUI include list tight: add a component to it only when the site uses it.

### Don't:

- **Don't** stack alternating colored bands, hero cards or grids of equal cards on the home page.
- **Don't** introduce neutrals without the brand hue.
- **Don't** wrap interior project or link items in cards; they are rows or image-plus-title on the line.
- **Don't** use heavy expanded Archivo for running text.
- **Don't** add dependencies for an effect; the map is one shader. The exceptions already made: daisyUI for UI primitives, and three.js for the signal tower only.
- **Don't** load three.js on narrow screens or eagerly (it stays a dynamic import behind a min-width 80rem check), and don't put anything interactive on the canvas.
- **Don't** build a form field, search box or filter row by hand; use the daisyUI form primitives and make sure they are on the build's `include` list.
- **Don't** put a category or label above a headline as an eyebrow; the headline leads and the label follows it.
- **Don't** ship a stock daisyUI theme or data-theme; only `line` and `line-night`.
- **Don't** build the trunk, rings, terminus, ticket or error line from daisyUI, and don't hand-roll pills, toggles, chevrons, badges or alerts that a primitive already covers.
- **Don't** put the direction contract or surface brief into any browser-delivered file.

## Motion

- **Never `addEventListener('scroll', …)`.** Not for reveals, scroll-spy, progress or redraws. It is an anti-pattern here: it runs on the main thread for every scroll tick and almost always has a better tool. Use CSS scroll-driven animation (`animation-timeline`, as the trunk and train do), an `IntersectionObserver` for "which section is current", or Motion's `inView` / `scroll` helpers.
- **Complex animation uses Motion** (the `motion` package, Framer Motion's framework-agnostic successor): entrances (`src/lib/reveal.js` plays `inView` + `animate`), anything sequenced, staggered, scroll-linked or interrupted.
- **Simple animation uses Tailwind classes**: hover and focus transitions, colour and opacity changes, small transforms (`transition`, `duration-*`, `hover:-translate-y-0.5`, `motion-reduce:transition-none`). No hand-written keyframes or JS for what a utility class does.
- Transform and opacity only; every effect has a still equivalent under `prefers-reduced-motion`, and nothing is hidden when script has not run.
- **Install every package as a devDependency** (`npm i -D`). The site is built and bundled by Vite, so nothing needs to sit in `dependencies`.
