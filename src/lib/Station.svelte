<script>
	/** @type {{ id: string, title: string, line?: 'work' | 'writing' | 'contact', end?: boolean, children: import('svelte').Snippet }} */
	let { id, title, line = 'work', end = false, children } = $props();
</script>

<section {id} aria-labelledby="{id}-title" class="station py-14 md:py-20 pr-6 md:pr-12 {end ? 'station-end' : ''}" style="--line: var(--line-{line})">
	<span class="station-ring" aria-hidden="true"></span>
	<h2
		id="{id}-title"
		class="font-display text-3xl md:text-5xl leading-none font-bold tracking-tight mb-8 md:mb-10 dark:text-white"
	>
		{title}
	</h2>
	{@render children()}
</section>
