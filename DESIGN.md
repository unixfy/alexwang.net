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
  nav-pill:
    backgroundColor: '#e5e7eb'
    typography: '{typography.item}'
    rounded: '{rounded.sm}'
    padding: '8px 24px'
  nav-pill-current:
    backgroundColor: '{colors.brand-600}'
    textColor: '{colors.paper}'
  copy-button:
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '2px 8px'
  cta-fill:
    backgroundColor: '{colors.brand-600}'
    textColor: '{colors.paper}'
    rounded: '{rounded.lg}'
    padding: '16px'
  cta-fill-hover:
    backgroundColor: '{colors.brand-700}'
---

# Design System: alexwang.net

## Overview

**Creative North Star: "The Line Diagram"**

The site is one person's hub drawn as a Beck-style transit diagram. One purple trunk runs down the home page; every section is a station hung off it as a ring; the three doors (Work, Writing, Contact) are lines that continue into a living WebGL map behind the hero. By day it is ink on paper; by night it is a glowing map on near-black. Light and dark are equal citizens, switched by the `.dark` class on `html`.

The type is signage: Archivo Variable set expanded and heavy for the name, a tight heavy title for each station, Public Sans Variable for everything read. Every neutral shares the brand hue (324.6), so no gray is dead. Color is rationed: purple owns the trunk, links, focus and the name; teal and amber each belong to exactly one branch.

The home page is the full expression of the world. Interior pages (projects, links, CMS pages, error) share the tokens and type roles but are quieter, ordinary page layouts.

**Key Characteristics:**

- One vertical trunk, stations as ringed nodes, content indented to a fixed content column.
- Octilinear geometry only in the map: 45 and 90 degree routes.
- Brand purple plus two branch hues; tinted neutrals.
- Flat surfaces, no elevation system; depth comes from the lit trunk, rings and the map's bloom at night.
- Every motion has a still equivalent; the page is complete without WebGL2 or JavaScript.

## Colors

A purple trunk and ink-on-paper neutrals, with one teal and one amber branch. Brand-600 is the brand color (#7E1F86, also the PWA theme color); brand-300 is its night counterpart.

### Primary

- **Trunk Purple** (brand-600, oklch(0.438 0.176 324.6)): the trunk's lit edge, the name at display size, links, the train, the Work line, current-page pill, fills of calls to action. At night it becomes **Night Lilac** (brand-300).
- **Focus Purple** (brand-500 by day, brand-300 by night): the 2px focus outline with 2px offset; accent-color follows brand-600 / brand-300.

### Secondary

- **Writing Teal** (`--line-writing`: oklch(0.52 0.09 200) day, oklch(0.78 0.09 200) night): the Writing door, its station and its map route.
- **Contact Amber** (`--line-contact`: oklch(0.62 0.14 65) day, oklch(0.8 0.14 75) night): the Contact door, its station and its map route.

### Neutral

- **Paper** (gray-50) and **Night** (gray-950): page grounds; ring centers and covers repaint with the ground.
- **Paper Shade** (gray-100 / gray-800 at night): quiet bands on interior pages.
- **Hairline** (gray-300 day, gray-700 night): the unlit trunk and list dividers.
- **Ink** (gray-900) and white at night: body and headings. Secondary text is gray-700 / gray-300; meta is gray-600 / gray-300.
- The full tinted ramp (gray-50 to gray-950, brand-50 to brand-950) is defined in `@theme`; the frontmatter lists the steps in use.

### Named Rules

**The Hue Rule.** Every gray carries hue 324.6 at chroma 0.004 to 0.016. A neutral with no hue does not belong.

**The One Line, One Color Rule.** Teal means Writing and amber means Contact, everywhere. Branch hues are never used decoratively, and no fourth line color is added without a fourth door.

**The Underline Rule.** Links are brand-colored and always underlined; color is never the only cue.

## Typography

**Display Font:** Archivo Variable (width axis 62 to 125%, weight 100 to 900), fallback ui-sans-serif, system-ui
**Body Font:** Public Sans Variable (weight 100 to 900), same fallbacks
**Character:** Archivo, expanded and heavy, reads like station signage; Public Sans is plain and readable at length. Both are Latin-subset variable files. The pairing is a working choice and may change.

### Hierarchy

- **Display** (800, clamp(3.25rem, 1.5rem + 7vw, 6rem), 1.0, width 118%, -0.035em): the name on the home terminus only.
- **Title** (700, clamp(1.875rem, 1.3rem + 2.2vw, 3rem), 1.0, -0.02em): each station heading and each door label. Ring position derives from this size.
- **Page** (700, clamp(2rem, 1.5rem + 2vw, 3rem), 1.1): the h1 of interior pages.
- **Group** (700, 1.5rem, 1.2): sub-heads inside a station (Certifications, Recognition).
- **Item** (700, clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem), 1.25): list titles: projects, posts, destinations.
- **Lede** (400 Archivo, clamp(1.25rem, 1rem + 1.2vw, 1.875rem), 1.3): the tagline.
- **Prose** (400 Public Sans, clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem), 1.65, max 65ch): long reading; at night letter-spacing 0.01em and line-height 1.75.
- **Meta** (0.875rem, gray-600 / gray-300): dates, references. Dates use tabular numerals.

### Named Rules

**The Signage Rule.** Only Archivo carries wide, heavy, tight-tracked setting; and only the name uses the 118% width. Text never goes heavy-expanded.

**The Role Rule.** New text takes one of the named roles. Heading balance (`text-wrap: balance`) and prose `pretty` wrapping are on globally.

## Layout

The home page is a single column offset by the trunk. `.line-page` is a relative box with the trunk as a 0.375rem pill at `--trunk-x` (1.5rem, 2.5rem from 48rem); content starts at `--content-x` (3.5rem, 6rem from 48rem). Stations pad 3.5rem top and bottom (5rem from 48rem); the terminus pads 6rem on top (8rem from 48rem). Station content is capped near 4xl (56rem) and the hero grid at 6xl; the portrait sits at the right on wide screens and above or below on narrow. Interior pages use the `.ct` container (max 1920px) and ordinary stacked bands and grids.

The trunk is hidden above the first station and below the last by ground-colored covers (`station-start`, `station-end`), so the line has real termini. The map is a canvas filling the hero and doors host; it is decorative and absolute behind the type. Below 700px the map's geometry changes: the door lines turn back into the free space beside the portrait instead of running right.

Spacing rhythm is Tailwind's 4px scale; lists are dividers, not cards.

## Elevation & Depth

Flat. Surfaces are not lifted; there are no shadows on the home page. Depth is the lit trunk over the unlit trunk, ring covers, and, at night only, soft bloom on pulsing map routes. Photos dim slightly at night (brightness 0.9; 0.75 on interior cards). The one drop shadow in the codebase is on interior project cards (`drop-shadow`), a legacy of the older pages.

### Named Rules

**The Flat Line Rule.** On the line-diagram surfaces, stations and rings are drawn with borders and fills, never shadows.

## Shapes

Rings are circles (1.5rem, 0.3125rem border in the line color, center filled with the page ground). Lines are pills (999px caps). Photography is softly rounded (rounded 4px for thumbnails, 1rem for the portrait, 0.5rem for interior cards). Interior links and CTA buttons use 0.5rem or full pills. The map is strictly octilinear: routes turn only at multiples of 45 degrees.

## Components

### Trunk, station and ring (signature)

A station is a block with the ring on the trunk at `--ring-top` and a short stub of the line color (0.3125rem tall) reaching toward the content. Sections default to the Work (purple) line; Writing and Contact set `--line`. Door stations set `--ring-top: 50%`. On hover or keyboard focus of a door, the ring fills with its branch color (0.2s ease-out; none under reduced motion).

### Train

A small pill (0.875rem by 1.75rem, ground-colored 3px border) riding the lit edge of the trunk. Shown only where scroll-driven animation is supported and motion is allowed.

### Door row

Title role label, a live "Latest:" line in secondary text, and a down arrow at the far end that marks where the map route begins. Hover underlines the label in the branch color (4px, offset 8px) and nudges the arrow down.

### Lists

Project, post and destination rows are dividers (gray-300 / gray-700) with a year column, an Item-role title that underlines on hover, and a 16:9 thumbnail on larger screens.

### Navigation (interior and home)

Gray pills (gray-200 / gray-700, 0.25rem radius, Archivo xl) fixed at the top right on wide screens; the current page is filled brand-600 (brand-300 with dark text at night). Under 48rem it is a full-width gray bar with a toggle. The theme switch crossfades through the view transition API over 0.4s.

### Copy button

Small outlined (1px gray-400 / gray-500), 0.25rem radius, label swaps to "Copied" with a polite status announcement.

### Signature

The hand-written signature SVG closes the page and is written left to right as it enters view; inverted at night.

## Do's and Don'ts

### Do:

- **Do** let brand-600 (brand-300 at night) own the trunk, links, name and focus.
- **Do** give any new branch a line color via `--line` and keep the ring, stub and underline in that color.
- **Do** give every effect a still equivalent: whole lit trunk, finished map frame, whole signature.
- **Do** keep light and dark equal: override colors in the `.dark` class, not by media query.
- **Do** keep map fades behind type (data-calm regions go to about a tenth strength).

### Don't:

- **Don't** stack alternating colored bands, hero cards or grids of equal cards on the home page.
- **Don't** introduce neutrals without the brand hue.
- **Don't** use heavy expanded Archivo for running text.
- **Don't** add dependencies for an effect; the map is one shader.
- **Don't** put the direction contract or surface brief into any browser-delivered file.
