import { json as json$1 } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET() {

  let response = await fetch('https://blog.unixfy.net/wp-json/wp/v2/posts?per_page=4');

  return json$1({
  posts: response.ok && (await response.json()),
}, {
    status: response.status
  });
}