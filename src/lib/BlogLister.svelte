<script>
	import { asset } from '#lib/blog.js';
	import { fullDate } from '#lib/date.js';

	let { posts } = $props();
</script>

<ol
	class="list-none grid gap-x-14 @5xl:grid-cols-2 [&>li]:border-b [&>li]:border-gray-300 dark:[&>li]:border-gray-700"
>
	{#each posts as post}
		{@const external = !!post.redirect_url}
		<li>
			<a
				href={external ? post.redirect_url : `/blog/${post.slug}`}
				target={external ? '_blank' : undefined}
				rel={external ? 'noopener' : undefined}
				class="group grid sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-3 py-5 no-underline text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white"
			>
				{#if post.featured_image}
					<img
						src={asset(post.featured_image, 480)}
						alt=""
						loading="lazy"
						class="w-full sm:w-36 aspect-video object-cover rounded dark:brightness-90"
					/>
				{:else}
					<span class="hidden sm:block"></span>
				{/if}
				<span>
					<span class="t-meta block tabular-nums">
						{fullDate(post.date_published)}{#if post.category}
							· {post.category.name}{/if}
					</span>
					<span class="block t-item group-hover:underline underline-offset-4">
						{post.title}
						<i
							class="fa-solid {external
								? 'fa-arrow-up-right-from-square'
								: 'fa-arrow-right'} text-base"
							aria-hidden="true"
						></i>
					</span>
					{#if post.excerpt}
						<span class="block mt-1 text-gray-700 dark:text-gray-300 line-clamp-2">
							{post.excerpt}
						</span>
					{/if}
				</span>
			</a>
		</li>
	{/each}
</ol>
