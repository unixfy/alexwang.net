export async function load() {
    let response = await fetch('https://blog.unixfy.net/wp-json/wp/v2/posts?per_page=4');

    return {
        blogPosts: response.ok && (await response.json())
    }
}