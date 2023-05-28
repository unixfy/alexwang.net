---
title: ITE USC Website
image: iteusc-website.png
date: 05-15-2023
---


The University of Southern California's chapter of the Institute of Transportation Engineers (ITE USC) is a student
organization that promotes transportation engineering, planning, and enthusiasm at USC. I joined ITE's executive board
during my first semester at USC, and I've stayed on ever since.

ITE USC's website is the organization's primary online presence. However, the existing website was outdated and messy,
written in pure HTML and using vanilla JavaScript to fetch and display data from Firebase Realtime Database. There were
also some security issues, such as a risk for stored XSS attack through the Realtime Database.

So, I decided to rewrite the website from the ground up. I chose to use Svelte, SvelteKit, and TailwindCSS for the
frontend, and
Firebase for the backend (handling authentication and document storage through Firestore). I wasn't very familiar with
Firebase prior to this project, so I learned a lot about it during the development process - including implementing the
new modular client side SDK, along with the Firebase Admin SDK for the backend.

The new website looks much more modern, and has a smaller codebase with significantly less technical debt. This means
that future ITE USC leaders should find it easier to maintain the website. I also built a new, user-friendly CRUD
interface for non-technical users to manage the website's content. Through it, the entire ITE USC team can update the
projects, events, and other content on the website without needing to know how to update the code.

Overall, I hope that the new website will be a valuable resource that helps ITE USC grow and thrive for years to come.