import { redirect } from '@sveltejs/kit';


export async function load() {
	throw redirect(302, 'https://linkedin.com/in/alex-y-wang');
}
