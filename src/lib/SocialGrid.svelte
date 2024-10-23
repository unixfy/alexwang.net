<script>
	// import the color/icon/url data from socials.json
	export let socials;
</script>

<div class="grid grid-cols-3 grid-rows-3">
	{#each socials as social}
		<a href={social.url} target="_blank" rel="noopener" aria-label={social.name}>
			<div
				class="flex hover:scale-110 transition hover:drop-shadow-lg h-full w-full"
				style="background-color: {social.color};"
			>
				<span class="text-white m-auto p-10"><i class="fa-brands {social.icon} fa-3x" /></span>
			</div>
		</a>
	{/each}
</div>
