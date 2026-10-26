<script>
	import Station from '#lib/Station.svelte';
	import { year, dateSpan } from '#lib/date.js';

	let { data } = $props();

	const lines = /** @type {const} */ (['work', 'writing', 'contact']);

	// grouped by the year each one ended (or still running), in the order they are already sorted
	const years = $derived.by(() => {
		/** @type {Map<string, typeof data.projects>} */
		const byYear = new Map();
		for (const p of data.projects) {
			const y = p.end_date ? year(p.end_date) : 'Present';
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
			<ul class="projects-grid list-none">
				{#each projects as project, j}
					<li class="reveal" style="--d: {(j % 3) * 80}ms">
						<a
							href="/project/{project.slug}"
							class="project-tile group block no-underline text-gray-900 hover:text-gray-900 dark:text-white dark:hover:text-white"
						>
							<span
								class="project-shot block overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800"
							>
								{#if project.image}
									<img
										src="https://cms.alexwang.net/assets/{project.image}?format=webp&width=1000"
										alt=""
										loading="lazy"
										style="view-transition-name: p-{project.slug}"
										class="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none dark:brightness-90"
									/>
								{:else}
									<span class="block aspect-[16/10] w-full"></span>
								{/if}
							</span>
							<span
								class="t-item mt-4 block underline-offset-4 decoration-[var(--line)] decoration-4 group-hover:underline"
							>
								{project.title}
							</span>
							<span class="t-meta mt-1 block tabular-nums">
								{dateSpan(project.start_date, project.end_date)}
							</span>
							{#if project.excerpt}
								<span class="mt-2 line-clamp-2 block text-gray-700 dark:text-gray-300"
									>{project.excerpt}</span
								>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</Station>
	{/each}
</div>

<style>
	/* the project grid uses the whole width: as many wide tiles as fit, never a capped column */
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 24rem), 1fr));
		gap: 3rem 1.5rem;
	}

	@media (min-width: 100rem) {
		.projects-grid {
			grid-template-columns: repeat(auto-fill, minmax(min(100%, 28rem), 1fr));
		}
	}
</style>
