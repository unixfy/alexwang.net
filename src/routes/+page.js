export async function load({fetch}) {

    return {
        // see this resource: https://svelte.dev/blog/streaming-snapshots-sveltekit
        // we stream the data to the browser as it's loaded so as to not delay pageloads
        streamed: {
            blogPostsRequest: fetch('https://blog.unixfy.net/wp-json/wp/v2/posts?per_page=4')
        }
    }
}