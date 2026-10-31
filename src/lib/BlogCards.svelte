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
							style="view-transition-name: b-{post.slug}"
							class="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none dark:brightness-90"
						/>
					{:else}
						<span class="block aspect-[16/10] w-full"></span>
					{/if}
				</span>
				<span
					class="t-item mt-4 block underline decoration-[var(--line)] decoration-2 underline-offset-4 transition-[text-decoration-thickness] group-hover:decoration-4"
				>
					{post.title}
					<i
						class="fa-solid {external
							? 'fa-arrow-up-right-from-square'
							: 'fa-arrow-right'} ml-1 inline-block text-base transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
						aria-hidden="true"
					></i>
				</span>
				<span class="t-meta mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums">
					<span>{short ? monthDay(post.date_published) : fullDate(post.date_published)}</span>
					{#if post.category}<span class="kicker">{post.category.name}</span>{/if}
					<span>{post.minutes} min ride</span>
				</span>
				{#if post.excerpt}
					<span class="mt-2 line-clamp-2 block text-gray-700 dark:text-gray-300">
						{post.excerpt}
					</span>
				{/if}
			</a>
		</li>
	{/each}
</ol>

<style>
	/* same grid as the project tiles, so sections keep the same rhythm */
	.post-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 24rem), 1fr));
		gap: 3rem 1.5rem;
	}
</style>
