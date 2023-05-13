import { PUBLIC_SSHKEY } from "$env/static/public";
export function GET () {
    // note: according to SvelteKit, this GET() endpoint will only be reached if the client prefers non-text/html response
    // otherwise the +page.svelte is rendered
    return new Response(PUBLIC_SSHKEY);
}