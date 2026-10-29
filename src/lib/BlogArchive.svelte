<script>
	import { page } from '$app/state';
	import BlogLister from '#lib/BlogLister.svelte';
	import Station from '#lib/Station.svelte';

	/**
	 * @type {{
	 *   data: { posts: any[], hasOlder: boolean, page: number, categories: any[], tags?: any[] },
	 *   heading: string,
	 *   lede?: string | null,
	 *   query?: string,
	 *   active?: string
	 * }}
	 */
	let { data, heading, lede = null, query = '', active = '' } = $props();

	// the same archive one page over: only `page` changes, a search stays
	const to = (/** @type {number} */ n) => {
		const url = new URL(page.url.href);
		if (n > 1) url.searchParams.set('page', String(n));
		else url.searchParams.delete('page');
		return url.pathname + url.search;
	};
</script>

<div class="line-page">
	<span class="train" aria-hidden="true"></span>

	<header class="station station-start terminus-page pb-8 pr-6 md:pr-12">
		<span class="station-ring" aria-hidden="true"></span>
		<h1 class="t-page text-brand-600 dark:text-brand-300">{heading}</h1>
		{#if lede}
			<p class="t-lede mt-3 max-w-prose">{lede}</p>
		{/if}

		<form action="/blog" method="get" role="search" class="mt-6 flex max-w-xl gap-2">
			<label class="input input-bordered flex flex-1 items-center gap-2">
				<i class="fa-solid fa-magnifying-glass opacity-70" aria-hidden="true"></i>
				<span class="sr-only">Search the blog</span>
				<input type="search" name="q" value={query} placeholder="Search the blog" class="grow" />
			</label>
			<button class="btn btn-primary">Search</button>
		</form>

		{#if data.categories.length}
			<nav aria-label="Categories" class="mt-5 flex flex-wrap gap-2">
				<a
					href="/blog"
					class="btn btn-sm no-underline {active === '' && !query ? 'btn-primary' : 'btn-outline'}"
					aria-current={active === '' && !query ? 'page' : undefined}>All posts</a
				>
				{#each data.categories as c}
					<a
						href="/blog/category/{c.slug}"
						class="btn btn-sm no-underline {active === c.slug ? 'btn-primary' : 'btn-outline'}"
						aria-current={active === c.slug ? 'page' : undefined}>{c.name}</a
					>
				{/each}
			</nav>
		{/if}
	</header>

	<Station
		id="posts"
		title={query ? `Results for “${query}”` : data.page > 1 ? `Page ${data.page}` : 'Posts'}
		line="writing"
		end
	>
		<div class="wide">
			{#if data.posts.length}
				<BlogLister posts={data.posts} />
				{#if data.page > 1 || data.hasOlder}
					<nav aria-label="Pages" class="mt-8 flex items-center justify-between gap-4">
						{#if data.hasOlder}
							<a href={to(data.page + 1)} rel="next" class="btn btn-outline no-underline">
								<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Older posts
							</a>
						{:else}
							<span></span>
						{/if}
						{#if data.page > 1}
							<a href={to(data.page - 1)} rel="prev" class="btn btn-outline no-underline">
								Newer posts <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
							</a>
						{/if}
					</nav>
				{/if}
			{:else}
				<p class="text-lg">
					{query ? 'Nothing matches that search.' : 'No posts here yet.'}
					<a href="/blog">See all posts</a>.
				</p>
			{/if}
		</div>

		{#if data.tags?.length}
			<details class="wide mt-10">
				<summary class="t-group w-fit cursor-pointer">Browse by tag</summary>
				<ul class="mt-4 flex list-none flex-wrap gap-2 p-0">
					{#each data.tags as t}
						<li>
							<a href="/blog/tag/{t.slug}" class="badge badge-lg badge-outline no-underline"
								>{t.name}</a
							>
						</li>
					{/each}
				</ul>
			</details>
		{/if}
	</Station>
</div>
