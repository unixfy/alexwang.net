import getDirectusInstance from "$lib/directus";
import { readItems } from '@directus/sdk';

export async function load({ fetch }) {
    const directus = getDirectusInstance(fetch);

    const [links, socials] = await Promise.all([
        directus.request(readItems('links', { fields: ["title", "url", "icon"], sort: "sort" })),
        directus.request(readItems('socials', { fields: ["name", "color", "url", "icon"], sort: "sort", limit: 9 }))
    ]);

    return {
        links,
        socials,
        title: "Links"
    }
}