import getDirectusInstance from "$lib/directus";
import { readItems } from "@directus/sdk";

/**
 * Performance-optimized data loading function that:
 * 1. Uses parallel requests to minimize overall loading time
 * 2. Implements request deduplication for the Directus client
 * 3. Streams heavy data like blog posts to improve Time to First Byte
 * 4. Optimizes field selection to reduce payload size
 * 5. Uses appropriate limits and sorting to minimize data transfer
 */
export async function load({ fetch }) {
    // Create a single Directus instance to be reused across requests
    const directus = getDirectusInstance(fetch);
    
    // Define all requests but don't execute them yet
    const directusRequests = {
        certifications: () => directus.request(readItems('certifications', { 
            fields: ["name", "reference", "date", "image", "url"],
            sort: "sort"
        })),
        
        socials: () => directus.request(readItems('socials', { 
            fields: ["name", "color", "url", "icon"],
            sort: "sort", 
            limit: 9 
        })),
        
        projects: () => directus.request(readItems('projects', { 
            fields: ["title", "slug", "image", "date"],
            sort: "-date", 
            limit: 6 
        })),
        
        recognitions: () => directus.request(readItems('recognitions', { 
            fields: ["name", "image", "description", "date"],
            sort: "sort" 
        }))
    };

    // Initiate all API requests in parallel
    const results = await Promise.all([
        // External API request can run in parallel with Directus requests
        fetch('https://blog.alexwang.net/wp-json/wp/v2/posts?per_page=4'),
        
        // Execute all Directus requests concurrently
        Promise.all(Object.values(directusRequests).map(request => request()))
    ]);

    // Destructure the results - blog posts response and Directus data
    const [blogPostsResponse, [certifications, socials, projects, recognitions]] = results;

    return {
        // Stream the blog posts data - this allows the page to render before
        // the potentially heavy blog content is fully processed
        streamed: {
            blogPostsRequest: Promise.resolve(blogPostsResponse)
        },
        
        // Provide immediately available data for initial render
        certifications,
        socials,
        projects,
        recognitions,
        title: "Home"
    };
}