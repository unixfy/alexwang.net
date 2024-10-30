import getDirectusInstance from "$lib/directus";
import { readItems } from "@directus/sdk";

export async function load({ fetch }) {
    const directus = getDirectusInstance(fetch);

    const [certifications, socials, projects] = await Promise.all([
        directus.request(readItems('certifications', { fields: ["name", "reference", "date", "image", "url"], sort: "sort" })),
        directus.request(readItems('socials', { fields: ["name", "color", "url", "icon"], sort: "sort", limit: 9 })),
        directus.request(readItems('projects', { fields: ["title", "slug", "image", "date"], sort: "-date", limit: 6 }))
    ]);

    return {
        // see this resource: https://svelte.dev/blog/streaming-snapshots-sveltekit
        // we stream the data to the browser as it's loaded so as to not delay pageloads
        streamed: {
            blogPostsRequest: fetch('https://blog.alexwang.net/wp-json/wp/v2/posts?per_page=4')
        },
        certifications,
        socials,
        projects,
        title: "Home"
    }
}