<script>
	let { posts } = $props();
</script>

<ol class="list-none max-w-4xl divide-y divide-gray-300 dark:divide-gray-700">
	{#each posts as post}
		<li>
			<a
				href={post.link}
				target="_blank"
				rel="noopener"
				class="group grid sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-3 py-5 no-underline text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white"
			>
				{#if post.uagb_featured_image_src?.medium?.[0]}
					<img
						src={post.uagb_featured_image_src.medium[0]}
						alt=""
						loading="lazy"
						class="w-full sm:w-36 aspect-video object-cover rounded dark:brightness-90"
					/>
				{:else}
					<span class="hidden sm:block"></span>
				{/if}
				<span>
					<span class="block t-item group-hover:underline underline-offset-4">
						{@html post.title.rendered}
						<i class="fa-solid fa-arrow-right text-base" aria-hidden="true"></i>
					</span>
					<span class="block mt-1 text-gray-700 dark:text-gray-300 line-clamp-2">
						{@html post.uagb_excerpt}
					</span>
				</span>
			</a>
		</li>
	{/each}
</ol>
