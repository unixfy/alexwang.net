import getDirectusInstance from "$lib/directus";
import { readItems } from "@directus/sdk";
import { error } from "@sveltejs/kit";

export async function load({ fetch, params }) {
    const directus = getDirectusInstance(fetch);

    const page_req = await directus.request(readItems('pages', { fields: ["title", "subtitle", "content_html", "slug", "date_updated"], filter: { slug: params.slug }, limit: 1 }));

    if (page_req.length === 0) {
        error(404, "Page not found in CMS")
    }

    const page = page_req[0];

    return {
        page,
        title: page.title
    }
}