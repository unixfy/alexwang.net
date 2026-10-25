<script>
	import Station from '#lib/Station.svelte';
	import { goto } from '$app/navigation';
	import { dateSpan } from '#lib/date.js';
	import { domain } from '#lib/url.js';

	let { data } = $props();

	// ← and → ride the line: previous stop (newer) and next stop (older)
	const onKey = (/** @type {KeyboardEvent} */ e) => {
		if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
		const t = e.target;
		if (t instanceof HTMLElement && t.closest('input, textarea, select, [contenteditable]')) return;
		const to = e.key === 'ArrowLeft' ? data.prev : e.key === 'ArrowRight' ? data.next : null;
		if (to) goto(`/project/${to.slug}`);
	};
</script>

<svelte:window onkeydown={onKey} />

{#snippet thumb(/** @type {string | null | undefined} */ image)}
	{#if image}
		<img
			src="//cms.alexwang.net/assets/{image}?format=webp&width=480"
			alt=""
			loading="lazy"
			class="hidden aspect-video w-28 shrink-0 rounded-md object-cover transition-[filter] duration-200 group-hover:brightness-110 motion-reduce:transition-none lg:block 2xl:w-36 dark:brightness-90"
		/>
	{/if}
{/snippet}

<!-- A neighbouring stop. The ring says which way it goes: back is an outline, next is filled and points on. -->
{#snippet stop(/** @type {'prev' | 'next'} */ kind, /** @type {Record<string, any>} */ p)}
	<a href="/project/{p.slug}" rel={kind} class="stop group {kind}">
		<span class="stop-ring" aria-hidden="true">
			<i class="fa-solid {kind === 'next' ? 'fa-arrow-right' : 'fa-arrow-left'}"></i>
		</span>
		{@render thumb(p.image)}
		<span class="min-w-0 flex-1">
			<span class="t-meta flex items-center gap-2 {kind === 'next' ? 'justify-end' : ''}">
				{#if kind === 'prev'}<kbd class="kbd kbd-sm hidden lg:inline-flex" aria-hidden="true">←</kbd
					>{/if}
				<span>
					<span class={kind === 'next' ? 'font-bold text-brand-600 dark:text-brand-300' : ''}>
						{kind === 'next' ? 'Next stop' : 'Previous stop'}
					</span>
					· {dateSpan(p.start_date, p.end_date)}
				</span>
				{#if kind === 'next'}<kbd class="kbd kbd-sm hidden lg:inline-flex" aria-hidden="true">→</kbd
					>{/if}
			</span>
			<span class="t-item mt-1 block underline-offset-4 group-hover:underline">{p.title}</span>
		</span>
	</a>
{/snippet}

<div class="line-page">
	<span class="train" aria-hidden="true"></span>

	<header class="station station-start terminus-page pb-8 pr-6 md:pr-12">
		<span class="station-ring" aria-hidden="true"></span>
		<h1 class="t-page max-w-4xl text-brand-600 dark:text-brand-300">{data.project.title}</h1>
		<div class="t-meta mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
			{#if data.index >= 0}
				<p>
					Stop {data.index + 1} of {data.total} · {dateSpan(
						data.project.start_date,
						data.project.end_date
					)}
				</p>
				<!-- the whole line, most recent first: stops already passed are lit, like the trunk -->
				<ol class="route hidden sm:flex" aria-label="All projects, most recent first">
					{#each data.route as r, i}
						<li>
							<a
								href="/project/{r.slug}"
								title={r.title}
								aria-label={r.title}
								aria-current={i === data.index ? 'page' : undefined}
								class:passed={i < data.index}
							></a>
						</li>
					{/each}
				</ol>
			{:else}
				<p>{dateSpan(data.project.start_date, data.project.end_date)}</p>
			{/if}
			<a href="/projects" class="btn btn-outline btn-primary no-underline">
				<i class="fa-solid fa-table-cells-large" aria-hidden="true"></i>
				All projects
			</a>
		</div>
	</header>

	<div class="station pr-6 md:pr-12 pb-4">
		<div
			class="grid max-w-[100rem] gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] 2xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] 2xl:gap-20"
		>
			<!-- the picture is the exhibit: it stays in view while the text scrolls past it -->
			<div class="lg:sticky lg:top-8 lg:self-start">
				{#if data.project.image}
					<img
						src="//cms.alexwang.net/assets/{data.project.image}?format=webp"
						alt=""
						style="view-transition-name: p-{data.project.slug}"
						class="w-full rounded-lg dark:brightness-90"
					/>
				{/if}
				{#if data.project.url}
					<a
						href={data.project.url}
						target="_blank"
						rel="noopener"
						class="btn btn-primary btn-lg btn-block group mt-4 no-underline"
					>
						{domain(data.project.url) ?? 'View project'}
						<i
							class="fa-solid fa-arrow-up-right-from-square transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
							aria-hidden="true"
						></i>
					</a>
				{/if}
			</div>
			<div class="page-content-container project-content max-w-[65ch] text-lg 2xl:text-xl">
				{@html data.project.content_html}
			</div>
		</div>
	</div>

	<Station id="next" title="Keep riding" line="contact" end>
		<nav
			aria-label="Neighbouring projects"
			class="grid max-w-5xl gap-5 sm:grid-cols-2 2xl:max-w-[80rem]"
		>
			{#if data.prev}
				{@render stop('prev', data.prev)}
			{/if}
			{#if data.next}
				<div class="max-sm:order-first sm:col-start-2">
					{@render stop('next', data.next)}
				</div>
			{:else}
				<a href="/projects" class="stop end group max-sm:order-first sm:col-start-2">
					<span class="stop-ring" aria-hidden="true">
						<i class="fa-solid fa-flag-checkered"></i>
					</span>
					<span class="min-w-0 flex-1">
						<span class="t-meta block font-bold text-brand-600 dark:text-brand-300">
							End of the line
						</span>
						<span class="t-item mt-1 block underline-offset-4 group-hover:underline">
							All projects
						</span>
					</span>
				</a>
			{/if}
		</nav>
	</Station>
</div>

<style>
	/* ---- the route strip in the header ---- */
	.route {
		position: relative;
		align-items: center;
		width: min(100%, 34rem);
	}

	.route::before {
		content: '';
		position: absolute;
		inset-inline: 0.75rem;
		top: 50%;
		height: 0.1875rem;
		translate: 0 -50%;
		border-radius: 999px;
		background: var(--color-gray-300);
	}

	:global(.dark) .route::before {
		background: var(--color-gray-700);
	}

	.route li {
		position: relative;
		flex: 1;
	}

	.route a {
		display: block;
		height: 1.5rem;
		min-width: 1rem;
		text-decoration: none;
	}

	/* a stop: a dot on the line; stops already passed are lit */
	.route a::before {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		translate: -50% -50%;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--color-gray-400);
		outline: 0.25rem solid var(--color-base-100);
		transition: scale 0.15s ease-out;
	}

	.route a.passed::before {
		background: var(--color-brand-600);
	}

	:global(.dark) .route a.passed::before {
		background: var(--color-brand-300);
	}

	.route a:hover::before {
		scale: 1.6;
	}

	/* you are here: a station ring, as everywhere else on the line */
	.route a[aria-current='page']::before {
		width: 1.125rem;
		height: 1.125rem;
		border: 0.25rem solid var(--color-brand-600);
		background: var(--color-base-100);
		outline: none;
	}

	:global(.dark) .route a[aria-current='page']::before {
		border-color: var(--color-brand-300);
	}

	@media (prefers-reduced-motion: reduce) {
		.route a::before {
			transition: none;
		}
	}

	/* ---- the neighbouring stops at the bottom ---- */
	.stop {
		display: flex;
		align-items: center;
		gap: 1rem;
		height: 100%;
		padding: 1rem;
		border: 2px solid var(--color-gray-300);
		border-radius: 0.75rem;
		text-decoration: none;
		color: var(--color-gray-900);
		transition:
			border-color 0.2s ease-out,
			background-color 0.2s ease-out;
	}

	:global(.dark) .stop {
		border-color: var(--color-gray-700);
		color: white;
	}

	.stop:hover {
		color: var(--color-gray-900);
		border-color: var(--color-brand-600);
	}

	:global(.dark) .stop:hover {
		color: white;
		border-color: var(--color-brand-300);
	}

	/* next and the end of the line: the way on is the brand, tinted and pointing right */
	.stop.next,
	.stop.end {
		border-color: var(--color-brand-600);
		background: color-mix(in oklch, var(--color-brand-600) 7%, transparent);
	}

	:global(.dark) .stop.next,
	:global(.dark) .stop.end {
		border-color: var(--color-brand-300);
		background: color-mix(in oklch, var(--color-brand-300) 9%, transparent);
	}

	.stop.next {
		flex-direction: row-reverse;
		text-align: right;
	}

	/* the ring: an outline for back, a filled one for the way on */
	.stop-ring {
		display: grid;
		place-items: center;
		flex: none;
		width: 3rem;
		height: 3rem;
		border-radius: 999px;
		border: 0.3125rem solid var(--color-gray-400);
		color: var(--color-gray-700);
		background: var(--color-base-100);
	}

	:global(.dark) .stop-ring {
		border-color: var(--color-gray-600);
		color: var(--color-gray-300);
	}

	.stop.next .stop-ring,
	.stop.end .stop-ring {
		border-color: var(--color-brand-600);
		background: var(--color-brand-600);
		color: white;
	}

	:global(.dark) .stop.next .stop-ring,
	:global(.dark) .stop.end .stop-ring {
		border-color: var(--color-brand-300);
		background: var(--color-brand-300);
		color: var(--color-gray-950);
	}

	.stop-ring i {
		transition: translate 0.2s ease-out;
	}

	.stop.prev:hover .stop-ring i {
		translate: -0.25rem 0;
	}

	.stop.next:hover .stop-ring i {
		translate: 0.25rem 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.stop,
		.stop-ring i {
			transition: none;
		}
	}
</style>
