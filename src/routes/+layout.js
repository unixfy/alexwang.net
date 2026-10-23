import getDirectusInstance from "#lib/directus.js";
import { readSingleton } from '@directus/sdk';

export async function load({ fetch }) {
    const directus = getDirectusInstance(fetch);
    return {
        config: await directus.request(readSingleton('config', { fields: ["banner_enabled", "banner_content", "sshkey", "links_profile_picture", "homepage_welcome_text"] }))
    }
}