<script>
	import { onMount } from 'svelte';
	import { startNetwork } from './network.js';

	let { children } = $props();

	let host = $state();
	let canvas = $state();

	// Decorative, so it starts only in the browser and simply stays absent without WebGL2
	onMount(() => startNetwork(host, canvas) ?? undefined);
</script>

<div bind:this={host} class="relative">
	<canvas
		bind:this={canvas}
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 size-full md:[mask-image:linear-gradient(to_bottom,transparent_2rem,black_7rem)]"
	></canvas>
	{@render children()}
</div>
