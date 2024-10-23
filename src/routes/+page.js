import getDirectusInstance from "$lib/directus";
import { readItems } from "@directus/sdk";

export async function load({ fetch }) {
    const directus = getDirectusInstance(fetch);

    return {
        // see this resource: https://svelte.dev/blog/streaming-snapshots-sveltekit
        // we stream the data to the browser as it's loaded so as to not delay pageloads
        streamed: {
            blogPostsRequest: fetch('https://blog.alexwang.net/wp-json/wp/v2/posts?per_page=4')
        },
        certifications: await directus.request(readItems('certifications', { fields: ["name", "reference", "date", "image", "url"], sort: "sort" })),
        title: "Home"
    }
}