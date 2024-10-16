export async function load() {
    // basically a dummy function that stores all our links
    // can put a "name", "url", and a (font awesome) "icon"
    return {
        title: "Links",
        links: [
            {
                name: "Personal Site",
                url: "/"
            },
            {
                name: "Portfolio",
                url: "/portfolio"
            },
            {
                name: "Unixfy.net",
                url: "https://unixfy.net"
            },
            {
                name: "Blog",
                url: "https://blog.alexwang.net"
            }
        ]
    }
}