<script>
	import Station from '#lib/Station.svelte';
	import { fullDate, year } from '#lib/date.js';

	let { data } = $props();

	const stopLink =
		'group flex items-center gap-5 no-underline text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white';
</script>

{#snippet thumb(/** @type {string | null | undefined} */ image)}
	{#if image}
		<img
			src="//cms.alexwang.net/assets/{image}?format=webp&width=480"
			alt=""
			loading="lazy"
			class="hidden aspect-video w-32 shrink-0 rounded-md object-cover transition-[filter] duration-200 group-hover:brightness-110 motion-reduce:transition-none sm:block 2xl:w-40 dark:brightness-90"
		/>
	{/if}
{/snippet}

<div class="line-page">
	<span class="train" aria-hidden="true"></span>

	<header class="station station-start terminus-page pb-8 pr-6 md:pr-12">
		<span class="station-ring" aria-hidden="true"></span>
		<h1 class="t-page max-w-4xl text-brand-600 dark:text-brand-300">{data.project.title}</h1>
		<p class="t-meta mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
			{#if data.index >= 0}
				<span>Stop {data.index + 1} of {data.total}</span>
				<progress
					class="progress progress-primary w-28"
					value={data.index + 1}
					max={data.total}
					aria-hidden="true"
				></progress>
			{/if}
			<span>{year(data.project.date)}</span>
			<a href="/projects">All projects</a>
		</p>
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
						class="btn btn-primary btn-lg btn-block mt-4 no-underline"
					>
						View project
						<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
					</a>
				{/if}
			</div>
			<div class="page-content-container max-w-[65ch] text-lg 2xl:text-xl">
				{@html data.project.content_html}
			</div>
		</div>
		<p class="t-meta mt-10">Published {fullDate(data.project.date)}</p>
	</div>

	<Station id="next" title="Keep riding" line="contact" end>
		<div class="grid max-w-5xl gap-8 sm:grid-cols-2 2xl:max-w-[80rem]">
			{#if data.prev}
				<a href="/project/{data.prev.slug}" class={stopLink}>
					{@render thumb(data.prev.image)}
					<span>
						<span class="t-meta block">Previous stop · {year(data.prev.date)}</span>
						<span class="t-item underline-offset-4 group-hover:underline">{data.prev.title}</span>
					</span>
				</a>
			{/if}
			{#if data.next}
				<a href="/project/{data.next.slug}" class={stopLink}>
					{@render thumb(data.next.image)}
					<span>
						<span class="t-meta block">Next stop · {year(data.next.date)}</span>
						<span class="t-item underline-offset-4 group-hover:underline">{data.next.title}</span>
					</span>
				</a>
			{/if}
		</div>
		{#if !data.prev && !data.next}
			<a href="/projects" class="t-item">All projects</a>
		{/if}
	</Station>
</div>
