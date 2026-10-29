<script>
	import RideRoute from '#lib/RideRoute.svelte';

	/**
	 * The ride on a phone: a slim bar at the foot of the screen saying which stop you are at and how
	 * long is left, opening to the whole route. It appears once the reader is under way and steps aside
	 * for the stops at the end.
	 * @type {{
	 *   stops: { id: string, text: string }[],
	 *   at: number,
	 *   minutesLeft: number,
	 *   arrival: string,
	 *   shown: boolean
	 * }}
	 */
	let { stops, at, minutesLeft, arrival, shown } = $props();

	/** @type {HTMLDetailsElement | undefined} */
	let menu = $state();

	const label = $derived(
		at === 0
			? 'Departure'
			: at > stops.length
				? 'Arrived'
				: `Stop ${at} of ${stops.length} · ${stops[at - 1].text}`
	);

	// the menu closes when a stop is chosen, on Escape, and when the bar goes away
	$effect(() => {
		if (!shown && menu) menu.open = false;
	});
	const onKey = (/** @type {KeyboardEvent} */ e) => {
		if (e.key === 'Escape' && menu?.open) {
			menu.open = false;
			menu.querySelector('summary')?.focus();
		}
	};
</script>

<svelte:window onkeydown={onKey} />

<div class="bar" class:shown inert={!shown}>
	<span class="track" aria-hidden="true">
		<span class="fill" style="--p: {at / (stops.length + 1)}"></span>
	</span>
	<details bind:this={menu}>
		<summary>
			<span class="ring" aria-hidden="true"></span>
			<span class="label">{label}</span>
			{#if at <= stops.length}<span class="left">{minutesLeft} min left</span>{/if}
			<i class="fa-solid fa-chevron-up chevron" aria-hidden="true"></i>
		</summary>
		<div class="sheet">
			<RideRoute {stops} {at} {arrival} pick={() => menu && (menu.open = false)} />
		</div>
	</details>
</div>

<style>
	.bar {
		position: fixed;
		inset-inline: 0;
		bottom: 0;
		z-index: 20;
		translate: 0 100%;
		visibility: hidden;
		background: var(--color-base-100);
		color: var(--color-base-content);
		border-top: 2px solid var(--color-gray-300);
		padding-bottom: env(safe-area-inset-bottom);
		transition:
			translate 0.4s cubic-bezier(0.16, 1, 0.3, 1),
			visibility 0s linear 0.4s;
	}

	:global(.dark) .bar {
		border-top-color: var(--color-gray-700);
	}

	.bar.shown {
		translate: 0 0;
		visibility: visible;
		transition-delay: 0s;
	}

	/* the progress line along the top edge of the bar */
	.track {
		position: absolute;
		inset-inline: 0;
		top: -2px;
		height: 2px;
		overflow: hidden;
	}

	.fill {
		display: block;
		height: 100%;
		background: var(--color-brand-600);
		transform: scaleX(var(--p, 0));
		transform-origin: left;
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	:global(.dark) .fill {
		background: var(--color-brand-300);
	}

	/* where the browser can tie it to scroll, the line follows the page itself */
	@supports (animation-timeline: scroll()) {
		.fill {
			transition: none;
			animation: ride linear both;
			animation-timeline: scroll(root block);
		}

		@keyframes ride {
			from {
				transform: scaleX(0);
			}
			to {
				transform: scaleX(1);
			}
		}
	}

	summary {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 3rem;
		padding: 0.5rem 1rem;
		list-style: none;
		cursor: pointer;
		font-size: 1rem;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	.ring {
		flex: none;
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		border: 0.25rem solid var(--color-brand-600);
		background: var(--color-base-100);
		box-shadow: 0 0 0 0.25rem color-mix(in oklch, var(--color-brand-600) 22%, transparent);
	}

	:global(.dark) .ring {
		border-color: var(--color-brand-300);
		box-shadow: 0 0 0 0.25rem color-mix(in oklch, var(--color-brand-300) 24%, transparent);
	}

	.label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 700;
	}

	.left {
		flex: none;
		color: var(--color-gray-700);
		font-variant-numeric: tabular-nums;
	}

	:global(.dark) .left {
		color: var(--color-gray-300);
	}

	.chevron {
		flex: none;
		font-size: 0.875rem;
		transition: rotate 0.25s ease-out;
	}

	details[open] .chevron {
		rotate: 180deg;
	}

	.sheet {
		position: absolute;
		inset-inline: 0;
		bottom: 100%;
		background: var(--color-base-100);
		max-height: min(60vh, 24rem);
		overflow-y: auto;
		padding: 0.5rem 1.25rem 1rem 1.5rem;
		border-top: 1px solid var(--color-gray-300);
	}

	:global(.dark) .sheet {
		border-top-color: var(--color-gray-800);
	}

	@media (min-width: 80rem) {
		.bar {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar,
		.fill,
		.chevron {
			transition: none;
		}
	}
</style>
