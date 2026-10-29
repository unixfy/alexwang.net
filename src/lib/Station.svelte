<script>
	/** @type {{ id: string, title: string, line?: 'work' | 'writing' | 'contact', end?: boolean, tight?: boolean, children: import('svelte').Snippet }} */
	let { id, title, line = 'work', end = false, tight = false, children } = $props();
</script>

<section
	{id}
	aria-labelledby="{id}-title"
	class="station pb-14 md:pb-20 pr-6 md:pr-12 {tight
		? 'pt-6 md:pt-8 [--py:1.5rem] md:[--py:2rem]'
		: 'pt-14 md:pt-20'} {end ? 'station-end' : ''}"
	style="--line: var(--line-{line})"
>
	<span class="station-ring" aria-hidden="true"></span>
	<h2 id="{id}-title" class="t-title mb-8 md:mb-10 dark:text-white reveal">
		{title}
	</h2>
	<div class="reveal" style="--d: 100ms">
		{@render children()}
	</div>
</section>
