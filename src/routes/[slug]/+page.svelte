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

		// scroll-spy: the current stop is the last heading above the reading line (the first, until then)
		let frame = 0;
		const update = () => {
			frame = 0;
			let id = heads[0]?.id ?? '';
			for (const h of heads) if (h.getBoundingClientRect().top <= innerHeight * 0.45) id = h.id;
			current = id;
		};
		const onScroll = () => (frame ||= requestAnimationFrame(update));
		addEventListener('scroll', onScroll, { passive: true });
		update();

		// The line ends at the page's last station: its last heading, or the title's ring when there are
		// none. The page has no closing station to cut the trunk off, so it says where the trunk stops.
		const line = content.closest('.line-page');
		const measure = () => {
			if (!(line instanceof HTMLElement) || !content) return;
			const last = [...content.querySelectorAll(':scope > h2')]
				.filter((h) => h.textContent?.trim())
				.at(-1);
			const ring = line.querySelector('.station-ring')?.getBoundingClientRect();
			const y = last
				? last.getBoundingClientRect().top + parseFloat(getComputedStyle(last, '::before').top)
				: ring
					? ring.top + ring.height / 2
					: line.getBoundingClientRect().bottom;
			line.style.setProperty(
				'--trunk-end',
				`${Math.max(0, line.getBoundingClientRect().bottom - y)}px`
			);
		};
		const watch = new ResizeObserver(measure);
		if (line) watch.observe(line);
		measure();

		return () => {
			removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
			watch.disconnect();
		};
	});
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
				<span class="badge badge-primary ml-3">New since your last visit</span>
			{/if}
		</p>
	</header>

	<div class="station pr-6 md:pr-12 pb-16">
		<div
			class="xl:grid xl:grid-cols-[minmax(0,70ch)_15rem] xl:gap-14 2xl:grid-cols-[minmax(0,max-content)_16rem] 2xl:gap-20"
		>
			<div>
				{#if stops.length > 3}
					<details class="collapse collapse-arrow mb-8 bg-base-200 xl:hidden">
						<summary class="collapse-title font-semibold">Stops on this page</summary>
						<div class="collapse-content">
							<ul class="menu menu-md w-full px-0">
								{#each stops as stop}
									<li><a href="#{stop.id}">{stop.text}</a></li>
								{/each}
							</ul>
						</div>
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
						<ul class="menu menu-lg w-full p-0">
							{#each stops as stop}
								<li>
									<a href="#{stop.id}" aria-current={current === stop.id ? 'location' : undefined}
										>{stop.text}</a
									>
								</li>
							{/each}
						</ul>
					</nav>
				</aside>
			{/if}
		</div>
	</div>
</div>
