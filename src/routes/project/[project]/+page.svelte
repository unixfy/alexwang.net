<script>
	import { fullDate } from '#lib/date.js';

	let { data } = $props();
</script>

<div class="bg-gray-100 dark:bg-gray-800 dark:text-white min-h-[33vh] flex text-center">
	<div class="m-auto p-16">
		<h1 class="t-page my-4">Project: {data.project.title}</h1>
		<p class="text-xl">
			<a href="/projects"><i class="fas fa-arrow-left"></i> Return to all projects</a>
		</p>
	</div>
</div>

<div class="p-8 sm:p-16 bg-white dark:bg-gray-950 dark:text-white min-h-[50vh]">
	<div class="ct">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
			<div>
				<img
					src="//cms.alexwang.net/assets/{data.project.image}?format=webp"
					alt="Image for project {data.project.title}"
					class="rounded-lg dark:brightness-75"
				/>
				{#if data.project.url}
					<a
						href={data.project.url}
						target="_blank"
						rel="noopener"
						class="mt-4 bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-300 dark:hover:bg-brand-200 dark:text-gray-950 transition-colors p-2 sm:p-4 text-center rounded-lg text-xl w-full block"
					>
						View project
					</a>
				{/if}
			</div>
			<div class="text-lg space-y-6">
                <div class="page-content-container">
                    {@html data.project.content_html}
                </div>
				<hr class="my-4" />
				<p class="text-sm italic">Published {fullDate(data.project.date)}</p>
			</div>
		</div>
	</div>
</div>
