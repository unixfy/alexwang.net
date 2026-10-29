import { readItems } from '@directus/sdk';
import { error } from '@sveltejs/kit';
import { excerpt } from '#lib/excerpt.js';
import { render } from '#lib/editorjs.js';

/** Posts on one page of an archive. */
export const PER_PAGE = 10;

/** The site's public origin, for feeds and absolute links. */
export const ORIGIN = 'https://alexwang.net';

/** What a listing needs from each post; the body stays behind on the post's own page. */
export const CARD_FIELDS = [
	'title',
	'slug',
	'excerpt',
	'seo_description',
	'content',
	'date_published',
	'featured_image',
	'redirect_url',
	'categories.is_primary',
	'categories.categories_id.name',
	'categories.categories_id.slug'
];

/** Published, and not scheduled for later. */
export const visible = () => ({
	_and: [
		{ status: { _eq: 'published' } },
		{ _or: [{ date_published: { _null: true } }, { date_published: { _lte: '$NOW' } }] }
	]
});

/**
 * A Directus asset URL, resized by the CMS.
 * @param {string | null | undefined} id
 * @param {number} [width]
 */
export const asset = (id, width = 1200) =>
	id ? `https://cms.alexwang.net/assets/${id}?format=webp&width=${width}` : null;

/**
 * Flatten a post's category junction rows: the primary one first.
 * @param {any} post
 */
export function categoriesOf(post) {
	return /** @type {{ is_primary: boolean, name: string, slug: string }[]} */ (
		(post.categories ?? [])
			.filter((/** @type {any} */ c) => c.categories_id)
			.map((/** @type {any} */ c) => ({ is_primary: !!c.is_primary, ...c.categories_id }))
			.sort(
				(/** @type {any} */ a, /** @type {any} */ b) => Number(b.is_primary) - Number(a.is_primary)
			)
	);
}

/**
 * A post as a listing shows it: its summary as plain text and its main category.
 * @param {any} post
 */
export function toCard({ categories, excerpt: summary, seo_description, content, ...post }) {
	const cats = categoriesOf({ categories });
	return {
		...post,
		// the editor's summary, then the SEO description, then the opening words of the body
		excerpt: excerpt(summary || seo_description || render(content).html, 220),
		category: cats[0] ?? null
	};
}

/**
 * One page of posts, newest first. Asks for one more than a page holds, which says whether an older
 * page exists without a second count request.
 * @param {ReturnType<typeof import('#lib/directus.js').default>} directus
 * @param {{ page?: number, filter?: object, search?: string }} options
 */
export async function listPosts(directus, { page = 1, filter, search }) {
	const rows = await directus.request(
		readItems('posts', {
			fields: CARD_FIELDS,
			filter: filter ? { _and: [visible(), filter] } : visible(),
			sort: ['-date_published'],
			limit: PER_PAGE + 1,
			offset: (page - 1) * PER_PAGE,
			...(search ? { search } : {})
		})
	);
	return {
		posts: rows.slice(0, PER_PAGE).map(toCard),
		hasOlder: rows.length > PER_PAGE,
		page
	};
}

/**
 * The page number a request asks for.
 * @param {URL} url
 */
export function pageOf(url) {
	const n = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
	return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * The shared data of a blog archive page: its posts, the categories to move between, and a way to
 * the next and previous page.
 * @param {ReturnType<typeof import('#lib/directus.js').default>} directus
 * @param {URL} url
 * @param {{ filter?: object, search?: string }} [scope]
 */
export async function archive(directus, url, scope = {}) {
	const page = pageOf(url);
	const [listing, categories] = await Promise.all([
		listPosts(directus, { page, ...scope }),
		directus
			.request(
				readItems('categories', { fields: ['name', 'slug'], sort: ['sort', 'name'], limit: -1 })
			)
			.catch(() => [])
	]);
	if (page > 1 && listing.posts.length === 0) error(404, 'No posts on this page');
	return { ...listing, categories };
}

/**
 * The filter a category or tag archive applies to posts.
 * @param {{ category?: string | null, tag?: string | null }} scope
 */
export function scopeFilter({ category, tag }) {
	const all = [];
	if (category) all.push({ categories: { categories_id: { slug: { _eq: category } } } });
	if (tag) all.push({ tags: { tags_id: { slug: { _eq: tag } } } });
	return all.length ? { _and: all } : undefined;
}
