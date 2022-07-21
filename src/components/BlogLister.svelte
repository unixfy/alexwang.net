<script>
	export let data;
</script>

<div class="grid grid-cols-1 grid-rows-4 sm:grid-rows-2 sm:grid-cols-2 gap-8">
	{#each data as post}
		<a href={post.link} target="_blank" rel="noopener">
			<div class="flex justify-center h-full">
				<div
					class="h-full flex flex-col md:flex-row justify-start transition-all bg-gray-200 rounded-lg shadow-md md:max-h-48 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
				>
					<img
						class="w-full max-h-36 md:h-full object-cover md:w-1/3 md:max-h-full rounded-t-lg md:rounded-none md:rounded-l-lg dark:brightness-75"
						src={post.uagb_featured_image_src.medium[0]}
						alt=""
					/>
					<div class="p-4 flex flex-col justify-start">
						<p
							class="mb-2 text-lg md:text-xl lg:text-2xl font-bold font-display text-gray-900 dark:text-white capitalize"
						>
							{@html post.title.rendered} <i class="fa-solid fa-arrow-right" />
						</p>
						<p class="mb-3 font-normal text-gray-700 dark:text-gray-400 overflow-hidden">
							{@html post.uagb_excerpt}
						</p>
					</div>
				</div>
			</div>
		</a>
	{/each}
</div>

<div class="text-center mt-6 text-lg text-blue-500 hover:text-blue-300">
	<a href="https://blog.unixfy.net" target="_blank" rel="noopener"
		>View more <i class="fa-solid fa-arrow-right" /></a
	>
</div>
