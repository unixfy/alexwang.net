<script>
	/**
	 * A neighbouring stop at the foot of a page: back is an outline ring, the way on is filled and
	 * points on, and the end of the line is a flag. Shared by projects and posts so they read alike.
	 * @type {{
	 *   kind: 'prev' | 'next' | 'end',
	 *   href: string,
	 *   title: string,
	 *   meta?: string,
	 *   image?: string | null
	 * }}
	 */
	let { kind, href, title, meta = '', image = null } = $props();

	const label = $derived(
		kind === 'next' ? 'Next stop' : kind === 'end' ? 'End of the line' : 'Previous stop'
	);
</script>

<a {href} rel={kind === 'end' ? undefined : kind} class="neighbour group {kind}">
	<span class="neighbour-ring" aria-hidden="true">
		<i
			class="fa-solid {kind === 'next'
				? 'fa-arrow-right'
				: kind === 'end'
					? 'fa-flag-checkered'
					: 'fa-arrow-left'}"
		></i>
	</span>
	{#if image}
		<img
			src="https://cms.alexwang.net/assets/{image}?format=webp&width=480"
			alt=""
			loading="lazy"
			class="hidden aspect-video w-28 shrink-0 rounded-md object-cover transition-[filter] duration-200 group-hover:brightness-110 motion-reduce:transition-none lg:block 2xl:w-36 dark:brightness-90"
		/>
	{/if}
	<span class="min-w-0 flex-1">
		<span class="t-meta flex items-center gap-2 {kind === 'next' ? 'justify-end' : ''}">
			{#if kind === 'prev'}<kbd class="kbd kbd-sm hidden lg:inline-flex" aria-hidden="true">←</kbd
				>{/if}
			<span>
				<span class={kind === 'prev' ? '' : 'font-bold text-brand-600 dark:text-brand-300'}>
					{label}
				</span>
				{#if meta}· {meta}{/if}
			</span>
			{#if kind === 'next'}<kbd class="kbd kbd-sm hidden lg:inline-flex" aria-hidden="true">→</kbd
				>{/if}
		</span>
		<span class="t-item mt-1 block underline-offset-4 group-hover:underline">{title}</span>
	</span>
</a>
