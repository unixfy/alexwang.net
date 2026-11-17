// The built site over HTTP for Playwright, with the fake CMS behind it. Two extra routes let a test
// look at what the site sent the CMS: GET /__test/created lists the comments it tried to create.
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { start } from './app.js';

const port = Number(process.env.PORT ?? 4173);
const { respond, cms } = await start();

createServer(async (req, res) => {
	try {
		const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
		if (url.pathname === '/__test/created') {
			res.setHeader('content-type', 'application/json');
			res.end(JSON.stringify(cms.state.created));
			return;
		}
		const body =
			req.method === 'GET' || req.method === 'HEAD'
				? undefined
				: /** @type {any} */ (Readable.toWeb(req));
		const request = new Request(url, {
			method: req.method,
			headers: /** @type {any} */ (req.headers),
			body,
			// @ts-ignore Node needs this for a streamed body
			duplex: 'half'
		});
		const response = await respond(request);
		res.writeHead(response.status, Object.fromEntries(response.headers));
		if (response.body && req.method !== 'HEAD')
			Readable.fromWeb(/** @type {any} */ (response.body)).pipe(res);
		else res.end();
	} catch (err) {
		console.error(err);
		res.writeHead(500).end('test server error');
	}
}).listen(port, () => console.log(`system test server on http://localhost:${port}`));
