<script>
	import Station from '#lib/Station.svelte';
	import Comments from '#lib/Comments.svelte';
	import { asset } from '#lib/blog.js';
	import { fullDate } from '#lib/date.js';

	let { data } = $props();
	const post = $derived(data.post);
	const category = $derived(post.categories[0]);
	// structured data for search engines, built from the same fallbacks as the page's own tags
	const ld = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: post.title,
			description: data.description,
			image: data.image ? [data.image] : undefined,
			datePublished: post.date_published,
			url: `https://alexwang.net/blog/${post.slug}`,
			mainEntityOfPage: `https://alexwang.net/blog/${post.slug}`,
			articleSection: category?.name,
			keywords: post.tags.map((/** @type {any} */ t) => t.name).join(', ') || undefined,
			author: { '@type': 'Person', name: 'Alex Wang', url: 'https://alexwang.net' },
			publisher: { '@type': 'Person', name: 'Alex Wang', url: 'https://alexwang.net' }
		}).replace(/</g, '\\u003c')
	);
</script>

<svelte:head>
	<meta property="article:published_time" content={post.date_published} />
	<meta property="article:author" content="Alex Wang" />
	{#if category}<meta property="article:section" content={category.name} />{/if}
	{#each post.tags as t}<meta property="article:tag" content={t.name} />{/each}
	{@html `<script type="application/ld+json">${ld}</script>`}
</svelte:head>

{#snippet neighbour(/** @type {any} */ p, /** @type {'older' | 'newer'} */ kind)}
	<a
		href="/blog/{p.slug}"
		rel={kind === 'older' ? 'prev' : 'next'}
		class="stop group {kind === 'newer' ? 'next' : 'prev'}"
	>
		<span class="stop-ring" aria-hidden="true">
			<i class="fa-solid {kind === 'newer' ? 'fa-arrow-right' : 'fa-arrow-left'}"></i>
		</span>
		<span class="min-w-0 flex-1">
			<span class="t-meta block {kind === 'newer' ? 'text-right' : ''}">
				<span class={kind === 'newer' ? 'font-bold text-brand-600 dark:text-brand-300' : ''}>
					{kind === 'newer' ? 'Newer post' : 'Older post'}
				</span>
				· {fullDate(p.date_published)}
			</span>
			<span class="t-item mt-1 block underline-offset-4 group-hover:underline">{p.title}</span>
		</span>
	</a>
{/snippet}

{#snippet tagList()}
	{#if post.tags.length}
		<ul class="flex list-none flex-wrap gap-2 p-0" aria-label="Tags">
			{#each post.tags as t}
				<li>
					<a href="/blog/tag/{t.slug}" class="badge badge-lg badge-outline no-underline">{t.name}</a
					>
				</li>
			{/each}
		</ul>
	{/if}
{/snippet}

<article class="line-page">
	<span class="train" aria-hidden="true"></span>

	<header
		class="station station-start terminus-page pb-10 pr-6 md:pr-12"
		style="--line: var(--line-writing)"
	>
		<span class="station-ring" aria-hidden="true"></span>
		{#if category}
			<div class="mb-4">
				<a href="/blog/category/{category.slug}" class="kicker">{category.name}</a>
			</div>
		{/if}
		<h1 class="t-page max-w-6xl text-brand-600 dark:text-brand-300">{post.title}</h1>
		<p class="t-meta mt-4">
			<time datetime={post.date_published}>{fullDate(post.date_published)}</time>
			· {data.minutes} min read
		</p>
		{#if post.featured_image}
			<img
				src={asset(post.featured_image, 1600)}
				alt=""
				class="mt-10 aspect-[2/1] w-full max-w-[90rem] rounded-xl object-cover dark:brightness-90"
			/>
		{/if}
	</header>

	<div class="station pr-6 pb-16 md:pr-12">
		<div
			class="xl:grid xl:grid-cols-[minmax(0,75ch)_16rem] xl:gap-16 2xl:grid-cols-[minmax(0,max-content)_18rem] 2xl:gap-20"
		>
			<div>
				{#if data.headings.length > 3}
					<details class="collapse collapse-arrow mb-8 bg-base-200 xl:hidden">
						<summary class="collapse-title font-semibold">In this post</summary>
						<div class="collapse-content">
							<ul class="menu menu-md w-full px-0">
								{#each data.headings as h}
									<li><a href="#{h.id}">{h.text}</a></li>
								{/each}
							</ul>
						</div>
					</details>
				{/if}
				<div class="ride page-content-container post-body text-xl leading-relaxed">
					{@html data.body}
				</div>
				<div class="mt-12 xl:hidden">{@render tagList()}</div>
			</div>
			<aside class="hidden xl:block">
				<div class="sticky top-8 space-y-8">
					{#if post.tags.length}
						<div>
							<p class="t-meta mb-3 font-bold uppercase tracking-wider">Tagged</p>
							{@render tagList()}
						</div>
					{/if}
					{#if data.headings.length > 3}
						<nav aria-label="In this post">
							<p class="t-meta mb-2 font-bold uppercase tracking-wider">In this post</p>
							<ul class="menu w-full p-0">
								{#each data.headings as h}
									<li><a href="#{h.id}">{h.text}</a></li>
								{/each}
							</ul>
						</nav>
					{/if}
				</div>
			</aside>
		</div>
	</div>

	{#if post.comments_enabled}
		<Station id="comments" title="Comments" line="writing">
			<div class="max-w-4xl">
				<Comments comments={data.comments} siteKey={data.turnstileSiteKey} />
			</div>
		</Station>
	{/if}

	<Station id="next" title="Keep riding" line="contact" end>
		<nav aria-label="Neighbouring posts" class="grid max-w-6xl gap-6 sm:grid-cols-2">
			{#if data.older}
				{@render neighbour(data.older, 'older')}
			{/if}
			{#if data.newer}
				<div class="max-sm:order-first sm:col-start-2">
					{@render neighbour(data.newer, 'newer')}
				</div>
			{:else}
				<a href="/blog" class="stop end group max-sm:order-first sm:col-start-2">
					<span class="stop-ring" aria-hidden="true"
						><i class="fa-solid fa-flag-checkered"></i></span
					>
					<span class="min-w-0 flex-1">
						<span class="t-meta block font-bold text-brand-600 dark:text-brand-300"
							>End of the line</span
						>
						<span class="t-item mt-1 block underline-offset-4 group-hover:underline">All posts</span
						>
					</span>
				</a>
			{/if}
		</nav>
	</Station>
</article>

<style>
	/* a photo is shown at its own proportions, never taller than the screen can hold */
	.post-body :global(.post-figure) {
		margin-block: 2.5rem;
	}
	.post-body :global(.post-figure img) {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: min(75vh, 46rem);
		margin-inline: auto;
		border-radius: 1rem;
	}
	.post-body :global(.post-figure.stretched img) {
		width: 100%;
		object-fit: cover;
	}
	.post-body :global(.post-figure.bordered img) {
		border: 2px solid var(--color-gray-300);
	}
	.post-body :global(.post-figure figcaption) {
		margin-top: 0.75rem;
		text-align: center;
	}
	.post-body :global(pre) {
		overflow-x: auto;
		padding: 1rem 1.25rem;
		border-radius: 0.5rem;
		font-size: 0.9em;
		line-height: 1.6;
		background: var(--color-gray-900);
		color: var(--color-gray-100);
	}
	.post-body :global(:not(pre) > code) {
		padding: 0.1em 0.35em;
		border-radius: 0.25rem;
		font-size: 0.9em;
		background: var(--color-gray-200);
	}
	:global(.dark) .post-body :global(:not(pre) > code) {
		background: var(--color-gray-800);
	}
	.post-body :global(ol) {
		list-style: decimal outside;
		padding-left: 1.5rem;
	}
	.post-body :global(.checklist) {
		list-style: none;
		padding-left: 0;
	}
	.post-body :global(.table-scroll) {
		overflow-x: auto;
	}
	.post-body :global(blockquote cite) {
		display: block;
		margin-top: 0.4rem;
		font-style: normal;
		opacity: 0.75;
	}
	.post-body :global(iframe),
	.post-body :global(video) {
		max-width: 100%;
	}
	.post-body :global(h2),
	.post-body :global(h3) {
		scroll-margin-top: 1.5rem;
	}
	.post-body :global(h2) {
		margin-top: 3rem;
	}
	.post-body :global(h3) {
		margin-top: 2rem;
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
	}
</style>
