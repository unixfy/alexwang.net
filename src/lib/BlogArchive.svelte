<script>
	import { page } from '$app/state';
	import BlogCards from '#lib/BlogCards.svelte';
	import Network from '#lib/Network.svelte';
	import Station from '#lib/Station.svelte';
	import { asset } from '#lib/blog.js';
	import { fullDate, year } from '#lib/date.js';

	/**
	 * @type {{
	 *   data: { posts: any[], hasOlder: boolean, page: number, categories: any[], tags?: any[] },
	 *   heading: string,
	 *   lede?: string | null,
	 *   query?: string,
	 *   active?: string,
	 *   scope?: string,
	 *   trail?: { label: string, href?: string }[]
	 * }}
	 */
	let { data, heading, lede = null, query = '', active = '', scope = '', trail = [] } = $props();

	// the archive as the server sent it, then whatever the scroll has added after it
	let posts = $derived(data.posts);
	let nextPage = $derived(data.page + 1);
	let more = $derived(data.hasOlder);
	let loading = $state(false);
	let failed = $state(false);
	/** @type {HTMLElement | undefined} */
	let sentinel = $state();

	// the newest post leads the first page of an archive; the rest are grouped by year, as on /projects
	const lead = $derived(data.page === 1 && !query ? posts[0] : null);
	const rest = $derived(lead ? posts.slice(1) : posts);
	const lines = /** @type {const} */ (['writing', 'contact', 'work']);
	const groups = $derived.by(() => {
		if (query) return /** @type {[string, any[]][]} */ ([[`Results for “${query}”`, rest]]);
		/** @type {Map<string, any[]>} */
		const byYear = new Map();
		for (const p of rest) {
			const y = year(p.date_published) || 'Undated';
			byYear.set(y, [...(byYear.get(y) ?? []), p]);
		}
		return /** @type {[string, any[]][]} */ ([...byYear]);
	});
	const tagged = $derived(!!data.tags?.length);

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

	<Network
		focus={1}
		narrowAlpha={0.4}
		starts={[
			[0.68, 0.62],
			[0.56, 0.44],
			[0.76, 0.8]
		]}
		fade="bottom"
	>
		<header class="station station-start terminus-page pb-6 pr-6 md:pr-12">
			<span class="station-ring" aria-hidden="true"></span>
			<div data-calm class="w-fit">
				{#if trail.length}
					<div class="breadcrumbs mb-1 text-base">
						<ul>
							{#each trail as crumb}
								<li>
									{#if crumb.href}<a href={crumb.href}>{crumb.label}</a>{:else}{crumb.label}{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
				<h1 class="t-page text-brand-600 dark:text-brand-300">{heading}</h1>
				{#if lede}
					<p class="t-lede mt-3 max-w-prose">{lede}</p>
				{/if}
			</div>

			<div data-calm class="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
				<nav
					aria-label="Categories"
					class="tabs tabs-border text-lg max-sm:-mr-6 max-sm:w-[calc(100%+1.5rem)] max-sm:flex-nowrap max-sm:overflow-x-auto"
				>
					<a
						href="/blog"
						class="tab whitespace-nowrap no-underline {active === '' && !query && !trail.length
							? 'tab-active font-bold'
							: ''}"
						aria-current={active === '' && !query && !trail.length ? 'page' : undefined}
						>All posts</a
					>
					{#each data.categories as c}
						<a
							href="/blog/category/{c.slug}"
							class="tab whitespace-nowrap no-underline {active === c.slug
								? 'tab-active font-bold'
								: ''}"
							aria-current={active === c.slug ? 'page' : undefined}>{c.name}</a
						>
					{/each}
				</nav>
				<div class="flex w-full items-center gap-3 sm:w-auto">
					<form action="/blog" method="get" role="search" class="join w-full sm:w-80">
						<label class="input join-item w-full">
							<i class="fa-solid fa-magnifying-glass opacity-60" aria-hidden="true"></i>
							<span class="sr-only">Search the blog</span>
							<input type="search" name="q" value={query} placeholder="Search the blog" />
						</label>
						<button class="btn btn-primary join-item">Search</button>
					</form>
					<!-- a feed is XML, not a page: it needs a real navigation, not the client router -->
					<a
						href="/blog/feed"
						data-sveltekit-reload
						class="btn btn-outline btn-square no-underline"
						aria-label="RSS feed"
						title="RSS feed"
					>
						<i class="fa-solid fa-rss" aria-hidden="true"></i>
					</a>
				</div>
			</div>
		</header>
	</Network>

	{#if data.page > 1}
		<div class="station pr-6 pb-2 md:pr-12">
			<a href={href(data.page - 1)} rel="prev" class="btn btn-outline btn-sm no-underline">
				<i class="fa-solid fa-arrow-up" aria-hidden="true"></i> Newer posts
			</a>
		</div>
	{/if}

	{#if lead}
		{@const external = !!lead.redirect_url}
		<Station id="latest" title="Latest" line="writing">
			<a
				href={external ? lead.redirect_url : `/blog/${lead.slug}`}
				target={external ? '_blank' : undefined}
				rel={external ? 'noopener' : undefined}
				class="lead group grid max-w-[90rem] items-center gap-x-12 gap-y-6 no-underline text-gray-900 hover:text-gray-900 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] dark:text-white dark:hover:text-white"
			>
				<span class="block overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
					{#if lead.featured_image}
						<img
							src={asset(lead.featured_image, 1400)}
							alt=""
							class="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none dark:brightness-90"
						/>
					{:else}
						<span class="block aspect-[16/10] w-full"></span>
					{/if}
				</span>
				<span class="block">
					<span
						class="t-title block underline decoration-[var(--line)] decoration-4 underline-offset-8 transition-[text-decoration-thickness] group-hover:decoration-[0.5rem]"
						>{lead.title}</span
					>
					<span class="t-meta mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
						<span class="tabular-nums">{fullDate(lead.date_published)}</span>
						{#if lead.category}<span class="kicker">{lead.category.name}</span>{/if}
					</span>
					{#if lead.excerpt}
						<span class="mt-5 line-clamp-5 block text-xl text-gray-700 dark:text-gray-300"
							>{lead.excerpt}</span
						>
					{/if}
					<span class="btn btn-primary mt-6">
						Read the post
						<i
							class="fa-solid {external
								? 'fa-arrow-up-right-from-square'
								: 'fa-arrow-right'} transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
							aria-hidden="true"
						></i>
					</span>
				</span>
			</a>
		</Station>
	{/if}

	{#each groups as [label, group], i (label)}
		{#if group.length}
			<Station
				id={query ? 'results' : `y${label}`}
				title={label}
				line={lines[(i + (lead ? 1 : 0)) % 3]}
				end={!more && !tagged && i === groups.length - 1}
			>
				<BlogCards posts={group} short={!query} />
			</Station>
		{/if}
	{/each}

	{#if !posts.length}
		<div class="station pr-6 pb-16 md:pr-12">
			<p class="text-xl">
				{query ? 'Nothing matches that search.' : 'No posts here yet.'}
				<a href="/blog">See all posts</a>.
			</p>
		</div>
	{/if}

	{#if more}
		<div bind:this={sentinel} class="station pr-6 pb-16 md:pr-12">
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

	{#if tagged}
		<Station id="tags" title="Browse by tag" line="contact" end>
			<ul class="flex max-w-5xl list-none flex-wrap gap-3 p-0">
				{#each data.tags ?? [] as t}
					<li>
						<a href="/blog/tag/{t.slug}" class="badge badge-lg badge-outline no-underline"
							>{t.name}</a
						>
					</li>
				{/each}
			</ul>
		</Station>
	{/if}
</div>
