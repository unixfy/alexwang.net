<script>
	import { asset } from '#lib/blog.js';
	import { fullDate } from '#lib/date.js';

	let { posts } = $props();
</script>

<!-- the same list as Projects above it: text on the left, a thumbnail on the right -->
<ol
	class="list-none grid gap-x-14 @5xl:grid-cols-2 [&>li]:border-b [&>li]:border-gray-300 dark:[&>li]:border-gray-700"
>
	{#each posts as post, i (post.slug)}
		{@const external = !!post.redirect_url}
		<li class="reveal" style="--d: {(i % 2) * 80}ms">
			<a
				href={external ? post.redirect_url : `/blog/${post.slug}`}
				target={external ? '_blank' : undefined}
				rel={external ? 'noopener' : undefined}
				class="group flex items-baseline gap-4 py-4 no-underline text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white"
			>
				<span class="min-w-0 flex-1">
					<span class="t-item block group-hover:underline underline-offset-4">
						{post.title}
						<i
							class="fa-solid {external
								? 'fa-arrow-up-right-from-square'
								: 'fa-arrow-right'} text-base"
							aria-hidden="true"
						></i>
					</span>
					<span class="t-meta mt-1 block tabular-nums">
						{fullDate(post.date_published)}{post.category ? ` · ${post.category.name}` : ''} · {post.minutes}
						min ride
					</span>
					{#if post.excerpt}
						<span class="mt-2 line-clamp-3 text-sm md:text-base text-gray-700 dark:text-gray-300"
							>{post.excerpt}</span
						>
					{/if}
				</span>
				{#if post.featured_image}
					<img
						src={asset(post.featured_image, 400)}
						alt=""
						loading="lazy"
						style="view-transition-name: b-{post.slug}"
						class="hidden sm:block w-32 aspect-video object-cover rounded dark:brightness-90 self-start mt-1"
					/>
				{/if}
			</a>
		</li>
	{/each}
</ol>
