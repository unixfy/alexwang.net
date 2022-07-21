/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET() {

  let response = await fetch('https://blog.unixfy.net/wp-json/wp/v2/posts?per_page=4');

  return {
    status: response.status,
    body: {
      posts: response.ok && (await response.json()),
    }
  };
}