<script>
	import Station from '#lib/Station.svelte';
	import { fullDate, year } from '#lib/date.js';

	let { data } = $props();

	const stopLink =
		'group block no-underline text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white';
</script>

<div class="line-page">
	<span class="train" aria-hidden="true"></span>

	<header class="station station-start terminus-page pb-8 pr-6 md:pr-12">
		<span class="station-ring" aria-hidden="true"></span>
		<h1 class="t-page max-w-4xl text-brand-600 dark:text-brand-300">{data.project.title}</h1>
		<p class="t-meta mt-3">
			{#if data.index >= 0}Stop {data.index + 1} of {data.total} ·{/if}
			{year(data.project.date)} · <a href="/projects">All projects</a>
		</p>
	</header>

	<div class="station pr-6 md:pr-12 pb-4">
		<div class="grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
			<div>
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
						class="mt-4 block w-full rounded-lg bg-brand-600 p-2 text-center text-xl text-white no-underline transition-colors hover:bg-brand-700 hover:text-white dark:bg-brand-300 dark:text-gray-950 dark:hover:bg-brand-200 dark:hover:text-gray-950 sm:p-4"
					>
						View project
						<i class="fa-solid fa-arrow-up-right-from-square ml-1 text-base" aria-hidden="true"></i>
					</a>
				{/if}
			</div>
			<div class="page-content-container max-w-[65ch] text-lg">
				{@html data.project.content_html}
			</div>
		</div>
		<p class="t-meta mt-10">Published {fullDate(data.project.date)}</p>
	</div>

	<Station id="next" title="Keep riding" line="contact" end>
		<div class="grid max-w-4xl gap-8 sm:grid-cols-2">
			{#if data.prev}
				<a href="/project/{data.prev.slug}" class={stopLink}>
					<span class="t-meta block">Previous stop · {year(data.prev.date)}</span>
					<span class="t-item underline-offset-4 group-hover:underline">{data.prev.title}</span>
				</a>
			{/if}
			{#if data.next}
				<a href="/project/{data.next.slug}" class={stopLink}>
					<span class="t-meta block">Next stop · {year(data.next.date)}</span>
					<span class="t-item underline-offset-4 group-hover:underline">{data.next.title}</span>
				</a>
			{/if}
		</div>
		{#if !data.prev && !data.next}
			<a href="/projects" class="t-item">All projects</a>
		{/if}
	</Station>
</div>
