<script>
	let { socials } = $props();
</script>

<div class="grid grid-cols-3">
	{#each socials as social}
		<a href={social.url} target="_blank" rel="noopener" aria-label={social.name}>
			<div
				class="flex transition-[filter] duration-200 motion-reduce:transition-none hover:brightness-110 h-full w-full"
				style="--tile: {social.color}; background-color: var(--tile);"
			>
				<span class="tile-icon m-auto p-10"><i class="fa-brands {social.icon} fa-3x"></i></span>
			</div>
		</a>
	{/each}
</div>
