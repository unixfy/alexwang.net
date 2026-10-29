<script>
	import { page } from '$app/state';
	import BlogCards from '#lib/BlogCards.svelte';
	import Station from '#lib/Station.svelte';

	/**
	 * @type {{
	 *   data: { posts: any[], hasOlder: boolean, page: number, categories: any[], tags?: any[] },
	 *   heading: string,
	 *   lede?: string | null,
	 *   query?: string,
	 *   active?: string,
	 *   scope?: string
	 * }}
	 */
	let { data, heading, lede = null, query = '', active = '', scope = '' } = $props();

	// the archive as the server sent it, then whatever the scroll has added after it
	let posts = $derived(data.posts);
	let nextPage = $derived(data.page + 1);
	let more = $derived(data.hasOlder);
	let loading = $state(false);
	let failed = $state(false);
	/** @type {HTMLElement | undefined} */
	let sentinel = $state();

	const href = (/** @type {number} */ n) => {
		const url = new URL(page.url.href);
		if (n > 1) url.searchParams.set('page', String(n));
		else url.searchParams.delete('page');
		return url.pathname + url.search;
	};

	async function loadMore() {
		if (loading || !more) return;
		loading = true;
		failed = false;
		try {
			const params = new URLSearchParams(scope);
			if (query) params.set('q', query);
			params.set('page', String(nextPage));
			const res = await fetch(`/blog/posts.json?${params}`);
			if (!res.ok) throw new Error(String(res.status));
			const next = await res.json();
			const seen = new Set(posts.map((p) => p.slug));
			posts = [...posts, ...next.posts.filter((/** @type {any} */ p) => !seen.has(p.slug))];
			more = next.hasOlder;
			nextPage += 1;
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	}

	// the link below the list is the no-script way on; with script, reaching it loads the next page
	$effect(() => {
		if (!sentinel || !more || failed) return;
		const watch = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) loadMore();
			},
			{ rootMargin: '800px 0px' }
		);
		watch.observe(sentinel);
		return () => watch.disconnect();
	});
</script>

<svelte:head>
	{#if data.page > 1}<link rel="prev" href={href(data.page - 1)} />{/if}
	{#if data.hasOlder}<link rel="next" href={href(data.page + 1)} />{/if}
</svelte:head>

<div class="line-page">
	<span class="train" aria-hidden="true"></span>

	<header class="station station-start terminus-page pb-10 pr-6 md:pr-12">
		<span class="station-ring" aria-hidden="true"></span>
		<h1 class="t-page text-brand-600 dark:text-brand-300">{heading}</h1>
		{#if lede}
			<p class="t-lede mt-3 max-w-prose">{lede}</p>
		{/if}

		<div class="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
			{#if data.categories.length}
				<nav aria-label="Categories" class="flex flex-wrap gap-x-5 gap-y-2 text-lg">
					<a
						href="/blog"
						class="nav-link"
						aria-current={active === '' && !query ? 'page' : undefined}>All</a
					>
					{#each data.categories as c}
						<a
							href="/blog/category/{c.slug}"
							class="nav-link"
							aria-current={active === c.slug ? 'page' : undefined}>{c.name}</a
						>
					{/each}
				</nav>
			{/if}
			<form action="/blog" method="get" role="search" class="join w-full sm:w-96">
				<label class="input join-item w-full">
					<i class="fa-solid fa-magnifying-glass opacity-60" aria-hidden="true"></i>
					<span class="sr-only">Search the blog</span>
					<input type="search" name="q" value={query} placeholder="Search the blog" />
				</label>
				<button class="btn btn-primary join-item">Search</button>
			</form>
		</div>
	</header>

	<Station id="posts" title={query ? `Results for “${query}”` : 'Latest'} line="writing" end>
		{#if data.page > 1}
			<p class="mb-8">
				<a href={href(data.page - 1)} rel="prev" class="btn btn-outline btn-sm no-underline">
					<i class="fa-solid fa-arrow-up" aria-hidden="true"></i> Newer posts
				</a>
			</p>
		{/if}

		{#if posts.length}
			<BlogCards {posts} />
			{#if more}
				<div bind:this={sentinel} class="mt-12 flex justify-center">
					{#if failed}
						<button type="button" class="btn btn-outline" onclick={loadMore}>
							Couldn’t load more. Try again
						</button>
					{:else}
						<a
							href={href(nextPage)}
							rel="next"
							class="btn btn-outline no-underline"
							aria-busy={loading}
							onclick={(e) => {
								e.preventDefault();
								loadMore();
							}}
						>
							{#if loading}<span class="loading loading-spinner loading-sm"></span>{/if}
							Older posts
						</a>
					{/if}
				</div>
			{/if}
		{:else}
			<p class="text-xl">
				{query ? 'Nothing matches that search.' : 'No posts here yet.'}
				<a href="/blog">See all posts</a>.
			</p>
		{/if}

		{#if data.tags?.length}
			<details class="mt-16">
				<summary class="t-group w-fit cursor-pointer">Browse by tag</summary>
				<ul class="mt-5 flex list-none flex-wrap gap-3 p-0">
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

<style>
	/* categories read as quiet text, the current one underlined in the line's colour */
	.nav-link {
		text-decoration: none;
		padding-block: 0.15rem;
		border-bottom: 3px solid transparent;
		color: var(--color-gray-700);
	}
	:global(.dark) .nav-link {
		color: var(--color-gray-300);
	}
	.nav-link:hover {
		border-bottom-color: var(--line-writing);
	}
	.nav-link[aria-current='page'] {
		border-bottom-color: var(--line-writing);
		font-weight: 700;
		color: inherit;
	}
</style>
