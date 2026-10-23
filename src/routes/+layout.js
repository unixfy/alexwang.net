import getDirectusInstance from '#lib/directus.js';
import { readSingleton } from '@directus/sdk';

const emptyConfig = {
	banner_enabled: false,
	banner_content: '',
	sshkey: '',
	links_profile_picture: null,
	homepage_welcome_text: ''
};

export async function load({ fetch }) {
	const directus = getDirectusInstance(fetch);
	try {
		return {
			config: await directus.request(
				readSingleton('config', {
					fields: [
						'banner_enabled',
						'banner_content',
						'sshkey',
						'links_profile_picture',
						'homepage_welcome_text'
					]
				})
			)
		};
	} catch (err) {
		console.error('Directus config unavailable', err);
		return { config: emptyConfig };
	}
}
