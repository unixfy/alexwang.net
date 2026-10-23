<script>
	import { onMount } from 'svelte';

	/** @type {{ stops: { id: string; label: string; line: 'work' | 'writing' | 'contact' }[] }} */
	let { stops } = $props();

	/** @type {HTMLElement | undefined} */
	let host = $state();
	/** @type {HTMLCanvasElement | undefined} */
	let canvas = $state();
	let active = $state(0);
	let ready = $state(false);
	/** @type {{ hot: (index: number) => void, destroy: () => void } | null} */
	let tower = null;

	// The 3D tower is only a drawing behind the links, so the links work without it. It is loaded
	// (three.js and all) only where the rail is shown.
	onMount(() => {
		if (!matchMedia('(min-width: 80rem)').matches) return;
		let gone = false;
		import('./tower.js').then(({ startTower }) => {
			if (gone || !host || !canvas) return;
			tower = startTower(
				host,
				canvas,
				stops.map((s) => s.id),
				stops.map((s) => s.line),
				(i) => (active = i)
			);
			ready = tower !== null;
		});
		return () => {
			gone = true;
			tower?.destroy();
		};
	});
</script>

<div bind:this={host} class="tower relative h-full" class:ready>
	<canvas
		bind:this={canvas}
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 size-full"
	></canvas>
	<nav aria-label="Jump to a section" class="relative h-full">
		<ol class="flex h-full list-none flex-col justify-between pt-3 pb-14">
			{#each stops as stop, i}
				<li style="--line: var(--line-{stop.line})">
					<a
						href="#{stop.id}"
						data-stop
						class="stop t-item"
						aria-current={active === i ? 'location' : undefined}
						onpointerenter={() => tower?.hot(i)}
						onpointerleave={() => tower?.hot(-1)}
						onfocus={() => tower?.hot(i)}
						onblur={() => tower?.hot(-1)}
					>
						<span class="stop-dot" aria-hidden="true"></span>
						{stop.label}
					</a>
				</li>
			{/each}
		</ol>
	</nav>
</div>

<style>
	.stop {
		position: relative;
		display: flex;
		align-items: center;
		min-height: 2.75rem;
		padding-left: 4.7rem;
		text-decoration: none;
		color: var(--color-gray-700);
	}

	:global(.dark) .stop {
		color: var(--color-gray-300);
	}

	.stop:hover,
	.stop[aria-current='location'] {
		color: var(--color-gray-900);
	}

	:global(.dark) .stop:hover,
	:global(.dark) .stop[aria-current='location'] {
		color: white;
	}

	.stop:hover {
		text-decoration: underline;
		text-decoration-color: var(--line);
		text-decoration-thickness: 3px;
		text-underline-offset: 6px;
	}

	/* Without the 3D layer the rail is still a line: a spine and a ring at every stop */
	.tower:not(.ready) ol::before {
		content: '';
		position: absolute;
		left: calc(42px - 3px);
		top: 1.5rem;
		bottom: 1.5rem;
		width: 6px;
		border-radius: 999px;
		background: var(--color-gray-300);
	}

	:global(.dark) .tower:not(.ready) ol::before {
		background: var(--color-gray-700);
	}

	.stop-dot {
		position: absolute;
		left: calc(42px - 11px);
		top: 50%;
		translate: 0 -50%;
		width: 22px;
		height: 22px;
		border-radius: 999px;
		border: 5px solid var(--line);
		background: var(--color-base-100);
	}

	.tower.ready .stop-dot {
		display: none;
	}
</style>
