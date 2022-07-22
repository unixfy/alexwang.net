import { basename, dirname, resolve } from 'path';

export async function GET() {
    let projects_raw = import.meta.glob("/src/routes/project/*.md", { eager: true })

    let projects = Object.entries(projects_raw).map(([path, data]) => {
        // this is a REALLY janky way to remove the .md extension and remove the first 2 parts of the path (the /src/routes bit)
        let slug = '/' + path.replace(/\..+$/, '').split('/').slice(3).join('/');
        // We don't actually need the HTML.. for now
        // let html = data.default.render()
        return {
            slug, 
            // html,
            ...data
        };
    })

    return {
        status: 200,
        body: {
            projects
        }
    }
}