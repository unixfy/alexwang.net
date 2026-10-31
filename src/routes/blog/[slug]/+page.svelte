<script>
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { goto } from '$app/navigation';
	import Station from '#lib/Station.svelte';
	import Stop from '#lib/Stop.svelte';
	import Comments from '#lib/Comments.svelte';
	import RideRoute from '#lib/RideRoute.svelte';
	import RideBar from '#lib/RideBar.svelte';
	import { asset } from '#lib/blog.js';
	import { fullDate } from '#lib/date.js';

	let { data } = $props();
	const post = $derived(data.post);
	const category = $derived(post.categories[0]);
	// "Comments (9)": built as one string, because Svelte trims the space at the start of an {#if} block
	const commentsLabel = $derived(
		data.comments?.length ? `Comments (${data.comments.length})` : 'Comments'
	);
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

	// ← and → ride the line, as on a project: previous stop (newer) and next stop (older)
	const onKey = (/** @type {KeyboardEvent} */ e) => {
		if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
		const t = e.target;
		if (t instanceof HTMLElement && t.closest('input, textarea, select, [contenteditable]')) return;
		const to = e.key === 'ArrowLeft' ? data.newer : e.key === 'ArrowRight' ? data.older : null;
		if (to) goto(`/blog/${to.slug}`);
	};

	// ---- the ride: the post's headings are its stops ----
	const stops = $derived(data.headings);
	// "· 11 min ride · 7 stops", one string for the same reason
	const journey = $derived(
		`· ${data.minutes} min ride` +
			(stops.length ? ` · ${stops.length} ${stops.length === 1 ? 'stop' : 'stops'}` : '')
	);
	let passed = $state(0);
	let arrived = $state(false);
	let started = $state(false);
	let atEnd = $state(false);
	/** @type {HTMLElement | undefined} */
	let endMark = $state();

	// 0 is the departure, 1..n the stops, n + 1 the arrival
	const at = $derived(arrived ? stops.length + 1 : passed);
	const minutesLeft = $derived(
		at === 0
			? data.minutes
			: at > stops.length
				? 0
				: Math.max(1, Math.round((data.words - stops[at - 1].before) / 220))
	);
	const status = $derived(
		at === 0
			? `${stops.length} ${stops.length === 1 ? 'stop' : 'stops'} · ${data.minutes} min`
			: at > stops.length
				? 'Arrived'
				: `Stop ${at} of ${stops.length} · ${minutesLeft} min left`
	);

	// Where the reader is comes from IntersectionObservers on a reading line 45% down the screen: a
	// heading is passed once it is on or above that line. Nothing listens to scroll.
	onMount(() => {
		if (!stops.length) return;
		const line = { rootMargin: '0px 0px -55% 0px' };
		const above = (/** @type {IntersectionObserverEntry} */ e) =>
			e.isIntersecting || e.boundingClientRect.bottom <= 0;

		/** @type {Map<string, boolean>} */
		const seen = new Map();
		const headings = new IntersectionObserver((entries) => {
			for (const e of entries) seen.set(e.target.id, above(e));
			passed = stops.filter((s) => seen.get(s.id)).length;
		}, line);
		for (const s of stops) {
			const el = document.getElementById(s.id);
			if (el) headings.observe(el);
		}

		const finish = new IntersectionObserver(([e]) => (arrived = above(e)), line);
		if (endMark) finish.observe(endMark);

		const top = document.getElementById('post-top');
		const begin = new IntersectionObserver(
			([e]) => (started = !e.isIntersecting && e.boundingClientRect.bottom <= 0)
		);
		if (top) begin.observe(top);

		const next = document.getElementById('next');
		const end = new IntersectionObserver(([e]) => (atEnd = e.isIntersecting), {
			rootMargin: '0px 0px -10% 0px'
		});
		if (next) end.observe(next);

		return () => {
			headings.disconnect();
			finish.disconnect();
			begin.disconnect();
			end.disconnect();
		};
	});

	// arriving at the end of the line: the closing station's ring pulses once
	let pulsed = false;
	$effect(() => {
		if (!atEnd || pulsed) return;
		pulsed = true;
		const ring = document.querySelector('#next .station-ring');
		if (ring && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
			animate(ring, { scale: [1, 1.7, 1] }, { duration: 0.8, ease: [0.16, 1, 0.3, 1] });
		}
	});
</script>

<svelte:window onkeydown={onKey} />

<svelte:head>
	<meta property="article:published_time" content={post.date_published} />
	<meta property="article:author" content="Alex Wang" />
	{#if category}<meta property="article:section" content={category.name} />{/if}
	{#each post.tags as t}<meta property="article:tag" content={t.name} />{/each}
	{@html `<script type="application/ld+json">${ld}</script>`}
</svelte:head>

{#snippet tagList()}
	<ul class="flex list-none flex-wrap gap-2 p-0" aria-label="Tags">
		{#each post.tags as t}
			<li>
				<a href="/blog/tag/{t.slug}" class="badge badge-lg badge-outline no-underline">{t.name}</a>
			</li>
		{/each}
	</ul>
{/snippet}

<article class="line-page">
	<span class="train" aria-hidden="true"></span>

	<header
		id="post-top"
		class="station station-start terminus-page pb-8 pr-6 md:pr-12"
		style="--line: var(--line-writing)"
	>
		<span class="station-ring" aria-hidden="true"></span>
		<h1 class="t-page max-w-6xl text-brand-600 dark:text-brand-300">{post.title}</h1>
		<div class="t-meta mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
			<p>
				<time datetime={post.date_published}>{fullDate(post.date_published)}</time>
				{journey}
			</p>
			{#if category}
				<a href="/blog/category/{category.slug}" class="kicker">{category.name}</a>
			{/if}
			{#if post.comments_enabled}
				<a href="#comments" class="btn btn-ghost no-underline">
					<i class="fa-solid fa-comments" aria-hidden="true"></i>
					{commentsLabel}
				</a>
			{/if}
			<a href="/blog" class="btn btn-outline btn-primary no-underline">
				<i class="fa-solid fa-table-cells-large" aria-hidden="true"></i>
				All posts
			</a>
		</div>
		{#if post.featured_image}
			<img
				src={asset(post.featured_image, 1600)}
				alt=""
				fetchpriority="high"
				decoding="async"
				style="view-transition-name: b-{post.slug}"
				class="mt-10 aspect-[2/1] max-h-[min(60vh,30rem)] w-full max-w-[90rem] rounded-xl object-cover dark:brightness-90"
			/>
		{/if}
	</header>

	<div class="station pr-6 pb-16 md:pr-12">
		<div
			class="xl:grid xl:grid-cols-[minmax(0,75ch)_16rem] xl:gap-16 2xl:grid-cols-[minmax(0,max-content)_18rem] 2xl:gap-20"
		>
			<div>
				<div class="ride page-content-container post-body text-xl leading-relaxed">
					{@html data.body}
				</div>
				<span bind:this={endMark} aria-hidden="true"></span>
				{#if post.tags.length}
					<div class="mt-12 xl:hidden">{@render tagList()}</div>
				{/if}
			</div>

			<!-- the rail: where this post sits in the blog, whatever it contains -->
			<aside class="hidden xl:block">
				<div class="sticky top-8 space-y-8">
					{#if stops.length}
						<nav aria-label="Ride route">
							<p class="t-label mb-3">The ride</p>
							<RideRoute {stops} {at} />
							<p class="t-meta mt-3 tabular-nums">{status}</p>
						</nav>
					{/if}
					<nav aria-label="Around the blog">
						<p class="t-label mb-2">The blog</p>
						<ul class="menu w-full p-0">
							<li>
								<a href="/blog"
									><i class="fa-solid fa-table-cells-large w-4" aria-hidden="true"></i> All posts</a
								>
							</li>
							{#if post.comments_enabled}
								<li>
									<a href="#comments"
										><i class="fa-solid fa-comments w-4" aria-hidden="true"></i>
										{commentsLabel}</a
									>
								</li>
							{/if}
							{#if category}
								<li>
									<a href="/blog/category/{category.slug}"
										><i class="fa-solid fa-folder w-4" aria-hidden="true"></i> More in {category.name}</a
									>
								</li>
							{/if}
							<li>
								<a href="/blog/feed" data-sveltekit-reload
									><i class="fa-solid fa-rss w-4" aria-hidden="true"></i> RSS feed</a
								>
							</li>
						</ul>
					</nav>
					{#if post.tags.length}
						<div>
							<p class="t-label mb-3">Tagged</p>
							{@render tagList()}
						</div>
					{/if}
				</div>
			</aside>
		</div>
	</div>

	{#if post.comments_enabled}
		<Station id="comments" title={commentsLabel} line="writing">
			<div class="max-w-4xl">
				<Comments comments={data.comments} siteKey={data.turnstileSiteKey} />
			</div>
		</Station>
	{/if}

	<Station id="next" title="Keep riding" line="contact" end>
		<nav
			aria-label="Neighbouring posts"
			class="grid max-w-5xl gap-5 sm:grid-cols-2 2xl:max-w-[80rem]"
		>
			{#if data.newer}
				<Stop
					kind="prev"
					href="/blog/{data.newer.slug}"
					title={data.newer.title}
					meta={fullDate(data.newer.date_published)}
					image={data.newer.featured_image}
				/>
			{/if}
			<div class="max-sm:order-first sm:col-start-2">
				{#if data.older}
					<Stop
						kind="next"
						href="/blog/{data.older.slug}"
						title={data.older.title}
						meta={fullDate(data.older.date_published)}
						image={data.older.featured_image}
					/>
				{:else}
					<Stop kind="end" href="/blog" title="All posts" />
				{/if}
			</div>
		</nav>
	</Station>
	{#if stops.length}
		<RideBar {stops} {at} {minutesLeft} shown={started && !atEnd} />
	{/if}
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
	/* A table is a timetable: quiet small-caps column heads over a rule, the row's name in the display
	   face, hairlines between rows, and the last row set apart when it is a total. On a phone each row
	   becomes its own block, its cells labelled by their column. */
	.post-body :global(.table-scroll) {
		margin-block: 2.5rem;
		overflow-x: auto;
		border: 2px solid var(--color-gray-300);
		border-radius: 1rem;
	}
	:global(.dark) .post-body :global(.table-scroll) {
		border-color: var(--color-gray-700);
	}
	.post-body :global(table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 1.125rem;
		line-height: 1.55;
		font-variant-numeric: tabular-nums;
	}
	.post-body :global(thead th) {
		padding: 0.9rem 1.25rem;
		text-align: left;
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-gray-700);
		background: transparent;
		border-bottom: 2px solid var(--color-gray-300);
	}
	:global(.dark) .post-body :global(thead th) {
		color: var(--color-gray-300);
		border-bottom-color: var(--color-gray-700);
	}
	.post-body :global(tbody th),
	.post-body :global(tbody td) {
		padding: 1.1rem 1.25rem;
		vertical-align: top;
		text-align: left;
		border-top: 1px solid var(--color-gray-300);
		border-bottom: 0;
		background: transparent;
		color: inherit;
	}
	:global(.dark) .post-body :global(tbody th),
	:global(.dark) .post-body :global(tbody td) {
		border-top-color: var(--color-gray-800);
	}
	.post-body :global(tbody tr:first-child th),
	.post-body :global(tbody tr:first-child td) {
		border-top: 0;
	}
	.post-body :global(tbody th) {
		width: 22%;
		min-width: 9rem;
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
	}
	.post-body :global(tr.total th),
	.post-body :global(tr.total td) {
		font-weight: 700;
		border-top: 2px solid var(--color-brand-600);
		background: color-mix(in oklch, var(--color-brand-600) 7%, transparent);
	}
	:global(.dark) .post-body :global(tr.total th),
	:global(.dark) .post-body :global(tr.total td) {
		border-top-color: var(--color-brand-300);
		background: color-mix(in oklch, var(--color-brand-300) 9%, transparent);
	}

	@media (max-width: 39.99rem) {
		.post-body :global(.table-scroll) {
			overflow: visible;
		}
		.post-body :global(thead) {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}
		.post-body :global(table),
		.post-body :global(tbody),
		.post-body :global(tr),
		.post-body :global(tbody th),
		.post-body :global(tbody td) {
			display: block;
			width: auto;
			min-width: 0;
		}
		.post-body :global(tbody tr) {
			padding: 1.1rem 1.25rem;
			border-top: 1px solid var(--color-gray-300);
		}
		:global(.dark) .post-body :global(tbody tr) {
			border-top-color: var(--color-gray-800);
		}
		.post-body :global(tbody tr:first-child) {
			border-top: 0;
		}
		.post-body :global(tbody th),
		.post-body :global(tbody td) {
			padding: 0.4rem 0 0;
			border: 0;
			background: transparent;
		}
		.post-body :global(tbody th) {
			padding-top: 0;
		}
		.post-body :global(tbody td:empty) {
			display: none;
		}
		.post-body :global(tbody td[data-label])::before {
			content: attr(data-label);
			display: block;
			margin-bottom: 0.1rem;
			font-size: 0.875rem;
			font-weight: 700;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			color: var(--color-gray-600);
		}
		:global(.dark) .post-body :global(tbody td[data-label])::before {
			color: var(--color-gray-400);
		}
		.post-body :global(tr.total) {
			border-top: 2px solid var(--color-brand-600);
			background: color-mix(in oklch, var(--color-brand-600) 7%, transparent);
		}
		:global(.dark) .post-body :global(tr.total) {
			border-top-color: var(--color-brand-300);
			background: color-mix(in oklch, var(--color-brand-300) 9%, transparent);
		}
		.post-body :global(tr.total th),
		.post-body :global(tr.total td),
		:global(.dark) .post-body :global(tr.total th),
		:global(.dark) .post-body :global(tr.total td) {
			border-top: 0;
			background: transparent;
		}
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
