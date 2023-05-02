---
title: SCÜP Spotify Playlist Generator
image: spotify-playlist-generator.png
date: 2022-12-22
---

SCÜP is a 100% student-run initiative at the University of Southern California that runs free shuttles from USC to Los Angeles International Airport during each university break. We aim to provide an affordable, safe, and sustainable alternative to expensive rideshare trips to LAX that currently capture most of the market at USC. As part of our guest-obsessed operations, riders can choose one song to be played on the drive to LAX. They input their selected song through our Eventbrite-based registration form.

The process of converting the text input from Eventbrite into a Spotify playlist that can be played on each shuttle was entirely manual. It was time consuming and had a poor value to effort ratio, making it unsustainable for our small SCÜP team.

To solve this problem, I bootstrapped a SvelteKit app with IBM Carbon UI Components to speed up UI development. The app allows the user to sign in through Spotify's OAuth flow (implemented with Vercel's NextAuth library) and input their Eventbrite API key. There is functionality to fetch the user's Spotify playlists, exposing an intuitive UI for the user to select a playlist where the app should deposit all requested songs. When the user submits their credentials and selected playlist to the server, a SvelteKit server-side hook uses the user's credentials to retrieve each requested song from the Eventbrite API. Then, the hook looks up each song and adds the songs to the user's target playlist using the Spotify API. The finished product took about one day (~8 hours) of effort, and is hosted in production on Netlify / Netlify Functions.

Over the long term, I hope to wean SCÜP off Eventbrite and onto perhaps a custom web application that has built in Spotify autocomplete for the song selection input.