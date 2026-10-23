<script>
	import { onMount } from 'svelte';
	import Station from '#lib/Station.svelte';
	import { fullDate } from '#lib/date.js';
	import { foldLists } from '#lib/enhance.js';

	let { data } = $props();

	/** @type {HTMLElement | undefined} */
	let content = $state();
	let stops = $state(/** @type {{ id: string; text: string }[]} */ ([]));
	let current = $state('');
	let fresh = $state(false);

	// Returning visitors are told when the page has changed since they last looked
	onMount(() => {
		try {
			const key = `seen:${data.page.slug}`;
			const seen = localStorage.getItem(key);
			fresh = seen !== null && seen < data.page.date_updated;
			localStorage.setItem(key, data.page.date_updated);
		} catch {
			// storage unavailable: no note
		}
	});

	// The page's own headings become a route strip, and very long lists fold
	onMount(() => {
		if (!content) return;
		const heads = [...content.querySelectorAll('h2')].filter((h) => h.textContent?.trim());
		heads.forEach((h, i) => (h.id ||= `stop-${i + 1}`));
		stops = heads.map((h) => ({ id: h.id, text: h.textContent?.trim() ?? '' }));
		foldLists(content);

		const io = new IntersectionObserver(
			(entries) => entries.forEach((e) => e.isIntersecting && (current = e.target.id)),
			{ rootMargin: '-35% 0px -60% 0px' }
		);
		heads.forEach((h) => io.observe(h));
		return () => io.disconnect();
	});

	const next = $derived(data.next ?? { slug: 'projects', title: 'Projects' });
	const stopLink =
		'relative block py-1 no-underline text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white aria-[current=location]:font-bold aria-[current=location]:text-gray-900 dark:aria-[current=location]:text-white pl-5 before:absolute before:left-0 before:top-[0.6rem] before:block before:size-2.5 before:rounded-full before:border-2 before:border-brand-600 dark:before:border-brand-300 aria-[current=location]:before:bg-brand-600 dark:aria-[current=location]:before:bg-brand-300';
</script>

<div class="line-page">
	<span class="train" aria-hidden="true"></span>

	<header class="station station-start terminus-page pb-8 pr-6 md:pr-12">
		<span class="station-ring" aria-hidden="true"></span>
		<h1 class="t-page text-brand-600 dark:text-brand-300">{data.page.title}</h1>
		{#if data.page.subtitle}
			<div class="t-lede mt-3 max-w-prose">
				{@html data.page.subtitle}
			</div>
		{/if}
		<p class="t-meta mt-4">
			Updated {fullDate(data.page.date_updated)}
			{#if fresh}
				<span
					class="ml-3 rounded-full bg-brand-600 px-3 py-0.5 text-white dark:bg-brand-300 dark:text-gray-950"
					>New since your last visit</span
				>
			{/if}
		</p>
	</header>

	<div class="station pr-6 md:pr-12 pb-16">
		<div class="xl:grid xl:grid-cols-[minmax(0,70ch)_15rem] xl:gap-14">
			<div>
				{#if stops.length > 3}
					<details class="group mb-8 xl:hidden">
						<summary class="flex min-h-11 cursor-pointer items-center font-semibold">
							Stops on this page
							<i
								class="fa-solid fa-chevron-down ml-2 text-sm transition-transform group-open:rotate-180 motion-reduce:transition-none"
								aria-hidden="true"
							></i>
						</summary>
						<ol class="mt-2 list-none">
							{#each stops as stop}
								<li><a href="#{stop.id}" class={stopLink}>{stop.text}</a></li>
							{/each}
						</ol>
					</details>
				{/if}
				<div bind:this={content} class="ride text-lg page-content-container">
					{#if data.page.content_html}
						{@html data.page.content_html}
					{/if}
				</div>
			</div>
			{#if stops.length > 3}
				<aside class="hidden xl:block">
					<nav aria-label="Stops on this page" class="sticky top-8">
						<ol class="list-none">
							{#each stops as stop}
								<li>
									<a
										href="#{stop.id}"
										aria-current={current === stop.id ? 'location' : undefined}
										class={stopLink}>{stop.text}</a
									>
								</li>
							{/each}
						</ol>
					</nav>
				</aside>
			{/if}
		</div>
	</div>

	<Station id="next" title="Next stop" line="contact" end>
		<a href="/{next.slug}" class="t-item inline-flex items-center gap-3">
			{next.title}
			<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
		</a>
	</Station>
</div>
