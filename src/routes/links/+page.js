import getDirectusInstance from "$lib/directus";
import { readItems } from '@directus/sdk';

export async function load({ fetch }) {
    const directus = getDirectusInstance(fetch);
    return {
        links: await directus.request(readItems('links', { fields: ["title", "url", "icon"], sort: "sort" })),
        socials: await directus.request(readItems('socials', { fields: ["name", "color", "url", "icon"], sort: "sort", limit: 9 })),
        title: "Links"
    }
}