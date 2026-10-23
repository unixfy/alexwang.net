<script>
	import Station from '#lib/Station.svelte';
	import { year } from '#lib/date.js';

	let { data } = $props();

	const lines = /** @type {const} */ (['work', 'writing', 'contact']);

	// newest first from the CMS, so the years come out newest first too
	const years = $derived.by(() => {
		/** @type {Map<string, typeof data.projects>} */
		const byYear = new Map();
		for (const p of data.projects) {
			const y = year(p.date);
			byYear.set(y, [...(byYear.get(y) ?? []), p]);
		}
		return [...byYear];
	});
</script>

<div class="line-page">
	<span class="train" aria-hidden="true"></span>

	<header class="station station-start terminus-page pb-6 pr-6 md:pr-12">
		<span class="station-ring" aria-hidden="true"></span>
		<h1 class="t-page text-brand-600 dark:text-brand-300">Projects</h1>
		<p class="t-lede mt-3">Some cool things I’ve done</p>
	</header>

	{#each years as [yr, projects], i}
		<Station id="y{yr}" title={yr} line={lines[i % 3]} end={i === years.length - 1}>
			<ul class="grid max-w-6xl list-none gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
				{#each projects as project}
					<li>
						<a
							href="/project/{project.slug}"
							class="group block no-underline text-gray-900 hover:text-gray-900 dark:text-white dark:hover:text-white"
						>
							{#if project.image}
								<img
									src="//cms.alexwang.net/assets/{project.image}?format=webp&width=1000"
									alt=""
									loading="lazy"
									style="view-transition-name: p-{project.slug}"
									class="aspect-video w-full rounded-lg object-cover transition-[filter] duration-200 group-hover:brightness-110 motion-reduce:transition-none dark:brightness-90"
								/>
							{:else}
								<div class="aspect-video w-full rounded-lg bg-gray-200 dark:bg-gray-800"></div>
							{/if}
							<span class="t-item mt-3 block underline-offset-4 group-hover:underline">
								{project.title}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</Station>
	{/each}
</div>
