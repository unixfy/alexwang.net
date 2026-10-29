<script>
	/**
	 * A post as a route: only its own headings are listed, as stops, and the track begins with a short
	 * stub above the first. Stops the reader has passed are lit like the trunk, the current one is a larger
	 * ring, the rest wait.
	 * @type {{
	 *   stops: { id: string, text: string }[],
	 *   at: number,
	 *   pick?: () => void
	 * }}
	 */
	let { stops, at, pick } = $props();
</script>

<ol class="route" data-started={at >= 1 ? '' : undefined}>
	{#each stops as stop, k (stop.id)}
		{@const state = k + 1 < at ? 'passed' : k + 1 === at ? 'current' : 'next'}
		<li class="node" data-state={state}>
			<a
				href="#{stop.id}"
				aria-current={state === 'current' ? 'location' : undefined}
				onclick={pick}>{stop.text}</a
			>
		</li>
	{/each}
</ol>

<style>
	.route {
		position: relative;
		list-style: none;
		margin: 0;
		padding: 0.9rem 0 0;
	}

	/* the start of the line: a short stub of track above the first stop */
	.route::before {
		content: '';
		position: absolute;
		left: 0.375rem;
		top: 0;
		height: 1.4rem;
		width: 0.25rem;
		border-radius: 999px;
		background: var(--color-gray-300);
		transition: background-color 0.25s ease-out;
	}

	:global(.dark) .route::before {
		background: var(--color-gray-700);
	}

	.route[data-started]::before {
		background: var(--color-brand-600);
	}

	:global(.dark) .route[data-started]::before {
		background: var(--color-brand-300);
	}

	.node {
		position: relative;
		padding: 0.3rem 0 0.3rem 1.9rem;
	}

	.node a {
		display: block;
		text-decoration: none;
		line-height: 1.35;
		color: var(--color-gray-700);
		transition: color 0.25s ease-out;
	}

	:global(.dark) .node a {
		color: var(--color-gray-300);
	}

	.node a:hover {
		color: var(--color-gray-900);
		text-decoration: underline;
		text-underline-offset: 0.25rem;
	}

	:global(.dark) .node a:hover {
		color: white;
	}

	/* the ring */
	.node::before {
		content: '';
		position: absolute;
		z-index: 1;
		left: 0;
		top: 0.5rem;
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		border: 0.25rem solid var(--color-gray-400);
		background: var(--color-base-100);
		transition:
			background-color 0.25s ease-out,
			border-color 0.25s ease-out,
			scale 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* the track to the next stop */
	.node::after {
		content: '';
		position: absolute;
		left: 0.375rem;
		top: 1.5rem;
		bottom: -0.5rem;
		width: 0.25rem;
		border-radius: 999px;
		background: var(--color-gray-300);
		transition: background-color 0.25s ease-out;
	}

	:global(.dark) .node::after {
		background: var(--color-gray-700);
	}

	/* the track ends at the last stop */
	.node:last-child::after {
		display: none;
	}

	.node[data-state='passed']::before {
		border-color: var(--color-brand-600);
		background: var(--color-brand-600);
	}

	.node[data-state='passed']::after {
		background: var(--color-brand-600);
	}

	/* you are here: a larger ring with a halo */
	.node[data-state='current']::before {
		scale: 1.3;
		border-color: var(--color-brand-600);
		background: var(--color-base-100);
		box-shadow: 0 0 0 0.25rem color-mix(in oklch, var(--color-brand-600) 22%, transparent);
	}

	.node[data-state='current'] a {
		font-weight: 700;
		color: var(--color-gray-900);
	}

	:global(.dark) .node[data-state='passed']::before {
		border-color: var(--color-brand-300);
		background: var(--color-brand-300);
	}

	:global(.dark) .node[data-state='passed']::after {
		background: var(--color-brand-300);
	}

	:global(.dark) .node[data-state='current']::before {
		border-color: var(--color-brand-300);
		box-shadow: 0 0 0 0.25rem color-mix(in oklch, var(--color-brand-300) 24%, transparent);
	}

	:global(.dark) .node[data-state='current'] a {
		color: white;
	}

	@media (prefers-reduced-motion: reduce) {
		.route::before,
		.node::before,
		.node::after,
		.node a {
			transition: none;
		}
	}
</style>
