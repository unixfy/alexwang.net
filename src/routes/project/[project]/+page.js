import getDirectusInstance from "$lib/directus";
import { readItems } from "@directus/sdk";
import { error } from "@sveltejs/kit";

export async function load({ fetch, params }) {
    const directus = getDirectusInstance(fetch);

    const project_req = await directus.request(readItems('projects', { fields: ["title", "slug", "content_html", "image", "date", "url"], filter: { slug: params.project }, limit: 1 }));

    if (project_req.length === 0) {
        error(404, "Page not found in CMS")
    }

    const project = project_req[0];

    return {
        project,
        title: project.title
    }
}