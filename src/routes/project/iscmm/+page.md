---
title: Interactive SoCal Mobility Map
image: iscmm.png
date: 07-01-2023
---

Interactive SoCal Mobility Map (ISCMM) is a project I developed for fun during the summer. Heavily inspired by [Interactive Bay Area Highway Map](https://ibahm.org), it aims to display a map of, along with useful information about important transportation-related locations in the Southern California region. Currently, it includes freeway exits and mass transit stops.

The app is built entirely on SvelteKit, with UI assistance from Tailwind, Daisy UI, and LeafletJS (along with custom CSS for somewhat MUTCD-compliant highway sign lookalikes). Rather than loading data from an internal database like IBAHM, ISCMM pulls its data from the excellent OpenStreetMap project through OSM's Overpass API and Overpass Query Language. Because OpenStreetMap is community maintained, inconsistent schemas for specific locations are common, so I built significant logic to normalize and parse responses from the Overpass API. 

ISCMM also retrieves traffic alert data from SoCal 511, and I plan to incorporate real time transit predictions, provided by LA Metro's vehicle location API. I also leverage SvelteKit's powerful endpoints and streaming features to progressively enhance the client's experience as data is returned from (often large) queries to the Overpass API. ISCMM is deployed using Netlify and Netlify Edge Functions.

You can check out the [source code on GitHub](https://github.com/unixfy/iscmm).