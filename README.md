# alexwang.net

This is my personal website. It is built with SvelteKit, Netlify, and MDSveX, among others. Thanks to the nature of Svelte, development time was pretty minimal and I think this marks a good improvement over my previous WordPress/Divi Builder based site. :)

The homepage fetches the "Writing" using the API of my WordPress blog. The projects are stored in a very hacky "CMS" powered by MDSveX - to create a project, I create a new Markdown file in src/routes/project and upload an associated image in static/project. Some magic enables this new project to show as soon as the Netlify publish build runs.

[![Netlify Status](https://api.netlify.com/api/v1/badges/09ab261f-a371-4bf4-b80d-5b28101a8736/deploy-status)](https://app.netlify.com/sites/sunny-croissant-b2ddcb/deploys)


## Environment variables

- `PUBLIC_SSHKEY`: Defines the SSH key returned on /sshkey (both API route and text/html route)

