---
version: 1
slug: "src-routes-page-svelte"
primary_target: "src/routes/+page.svelte"
related_targets: []
---

# Home (`/`)

## Scope

Visitor mode: Experience, with three working doors. Surface: the home page of alexwang.net. Related: `src/lib/network.js`, `src/lib/Network.svelte`, `src/lib/Station.svelte`.

## Audience, job, proof

Four audiences (recruiters and hiring managers, peers and collaborators, blog readers, link-in-bio traffic) arrive wanting Work, Writing or Contact, and should see the whole person. Real proof comes from the CMS and blog: 14+ projects, 6 certifications, 6 awards, the four latest posts. Nothing is invented: no metrics, no testimonials, no fake schedules.

Constraints: brand purple #7E1F86 and the signature; CMS and blog stay the content sources; light and dark are equal; the page works without WebGL2 and without JavaScript; reduced motion gets a complete still. Fonts are free to change (the user opened this up).

## Direction contract

THESIS: The page is a transit map you can use. One purple trunk carries the whole page, and the three doors are real lines: their routes begin at the arrows at the end of each door row and run into a living WebGL map. It refuses the stack of alternating colour bands, the hero card, and the grid of equal cards.

OWN-WORLD: A Beck-style octilinear transit diagram (45 and 90 degree routes only, ground-cored interchanges, station rings). Brand purple (brand-600 by day, brand-300 at night) owns the trunk, links and focus. Two branch hues: teal for Writing, amber for Contact. Neutrals are tinted toward the brand hue (OKLCH 324.6). Display type is Archivo Variable, expanded and heavy, like a station sign; text is Public Sans Variable. Night is a glowing night map on near-black; day is ink on paper.

STORY: A visitor understands in seconds that this is one person with three places to go, picks a door, and travels the line. The signature signs off at the end of the line.

FIRST VIEWPORT: Top-left the terminus ring on the trunk, with the name at display size beside it, the tagline under it, and the portrait to the right. Below, three stacked doors (Work, Writing, Contact), each with a ring on the trunk, a live "Latest:" line, and an arrow at the right end. Behind and to the right, the map: the three door routes start at the arrows and run out across the canvas; three quieter routes cross them; interchanges form where routes meet. The map fades to about a tenth of its strength behind the type.

FORM: The line diagram (the user chose the pick card, position 1 of 7 on the grounded list). seed:0a3aebc42b63df3d

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction and motion

The map draws itself in over about 2.4 seconds, light pulses travel the routes, the cursor bends nearby lines like a lens and enlarges stations, and the DOM trunk lights up as the reader scrolls with a vehicle riding its lit edge. Every effect has a reduced-motion path; the map pauses off screen and when the tab is hidden.

## Open decisions

The portrait is the CMS image; a purpose-shot photo would lift the page more than any effect. A real Open Graph image and a route-bullet monogram are still to come.
