export async function handle({ event, resolve }) {
	return await resolve(event, {
		filterSerializedResponseHeaders: (key, value) => {
			return key.toLowerCase() === 'content-type';
		},
		// the two text faces are on every page and block its first paint; the icon fonts are not
		preload: ({ type, path }) =>
			type === 'font' ? /archivo|public-sans/.test(path) : type === 'js' || type === 'css'
	});
}
