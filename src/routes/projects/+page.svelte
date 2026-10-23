<script>
	import { year } from '#lib/date.js';

	let { data } = $props();
</script>

<div class="bg-gray-100 dark:bg-gray-800 dark:text-white text-center min-h-[33vh] flex">
	<div class="m-auto p-16">
		<h1 class="t-page mb-4">Projects</h1>
		<p class="t-lede">Some cool things I’ve done</p>
	</div>
</div>

<div class="p-8 lg:p-16 bg-brand-600">
	<div class="ct">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each data.projects as project}
				<div
					class="transition-colors flex-none drop-shadow rounded-lg bg-white hover:bg-gray-100 text-black dark:text-white dark:bg-gray-900 dark:hover:bg-gray-800"
				>
					<a href="/project/{project.slug}">
						<img
							class="object-cover rounded-t-lg dark:brightness-75 aspect-video w-full"
							src="//cms.alexwang.net/assets/{project.image}?format=webp&width=1000"
							alt=""
							loading="lazy"
						/>
						<div class="p-4 text-center">
							<p class="t-item my-2">{project.title}</p>
							<p class="t-meta tabular-nums">{year(project.date)}</p>
						</div>
					</a>
				</div>
			{/each}
		</div>
	</div>
</div>
