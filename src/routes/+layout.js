import getDirectusInstance from "$lib/directus";
import {readItems} from '@directus/sdk';

export async function load({fetch}) {
    const directus = getDirectusInstance(fetch);
    return {
        config: await directus.request(readItems('config'))
    }
}