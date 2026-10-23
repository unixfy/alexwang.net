<script>
	import { fullDate } from '#lib/date.js';

	let { data } = $props();
</script>

<div class="bg-gray-100 dark:bg-gray-800 dark:text-white text-center min-h-[33vh] flex">
	<div class="m-auto p-16">
		<h1 class="text-4xl font-display font-bold mb-4">{data.page.title}</h1>

		{#if data.page.subtitle}
			<h2 class="text-2xl">
				{@html data.page.subtitle}
			</h2>
		{/if}

		<p class="mt-2 italic">Last updated {fullDate(data.page.date_updated)}</p>
	</div>
</div>

<div class="dark:bg-gray-900 dark:text-white min-h-[80vh]">
	<div class="p-8 max-w-(--breakpoint-lg) m-auto">
		<div class="flex flex-col space-y-4 text-lg page-content-container">
			{#if data.page.content_html}
				{@html data.page.content_html}
			{/if}
		</div>
	</div>
</div>
