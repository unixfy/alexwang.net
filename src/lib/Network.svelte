<script>
	import { onMount } from 'svelte';
	import { startNetwork } from './network.js';

	/**
	 * @type {{
	 *   focus?: number,
	 *   starts?: (number[] | null)[],
	 *   narrowAlpha?: number,
	 *   fade?: 'top' | 'bottom',
	 *   children: import('svelte').Snippet
	 * }}
	 */
	let { focus, starts, narrowAlpha, fade = 'top', children } = $props();

	let host = $state();
	let canvas = $state();

	// Decorative, so it starts only in the browser and simply stays absent without WebGL2
	onMount(() => startNetwork(host, canvas, { focus, starts, narrowAlpha }) ?? undefined);
</script>

<div bind:this={host} class="relative">
	<canvas
		bind:this={canvas}
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 size-full {fade === 'top'
			? 'md:[mask-image:linear-gradient(to_bottom,transparent_2rem,black_7rem)]'
			: '[mask-image:linear-gradient(to_bottom,black_72%,transparent)] md:[mask-image:linear-gradient(to_bottom,transparent_4rem,black_7rem,black_72%,transparent)]'}"
	></canvas>
	{@render children()}
</div>
