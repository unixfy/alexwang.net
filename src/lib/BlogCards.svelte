<script>
	import { asset } from '#lib/blog.js';
	import { fullDate, monthDay } from '#lib/date.js';

	/** @type {{ posts: any[], short?: boolean }} */
	let { posts, short = false } = $props();
</script>

<ol class="post-grid list-none">
	{#each posts as post, i (post.slug)}
		{@const external = !!post.redirect_url}
		<li class="reveal" style="--d: {(i % 3) * 80}ms">
			<a
				href={external ? post.redirect_url : `/blog/${post.slug}`}
				target={external ? '_blank' : undefined}
				rel={external ? 'noopener' : undefined}
				class="group block h-full no-underline text-gray-900 hover:text-gray-900 dark:text-white dark:hover:text-white"
			>
				<span class="block overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
					{#if post.featured_image}
						<img
							src={asset(post.featured_image, 900)}
							alt=""
							loading="lazy"
							class="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none dark:brightness-90"
						/>
					{:else}
						<span class="block aspect-[16/10] w-full"></span>
					{/if}
				</span>
				<span class="mt-5 flex items-baseline justify-between gap-4">
					{#if post.category}
						<span class="kicker">{post.category.name}</span>
					{:else}
						<span></span>
					{/if}
					<span class="t-meta tabular-nums">
						{short ? monthDay(post.date_published) : fullDate(post.date_published)}
					</span>
				</span>
				<span
					class="t-item mt-2 block underline-offset-4 decoration-[var(--line)] decoration-4 group-hover:underline"
				>
					{post.title}
					{#if external}
						<i class="fa-solid fa-arrow-up-right-from-square text-base" aria-hidden="true"></i>
					{/if}
				</span>
				{#if post.excerpt}
					<span class="mt-3 line-clamp-3 block text-lg text-gray-700 dark:text-gray-300">
						{post.excerpt}
					</span>
				{/if}
			</a>
		</li>
	{/each}
</ol>

<style>
	/* as many generous cards as the width allows */
	.post-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: 3.5rem 2rem;
	}
</style>
