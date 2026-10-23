<script>
	import SocialGrid from '#lib/SocialGrid.svelte';
	let { data } = $props();
</script>

<div class="bg-gray-950 text-white p-8 pt-20 flex flex-col">
	<img
		src="//cms.alexwang.net/assets/{data.config.links_profile_picture}?format=webp&width=200"
		class="h-32 w-32 rounded-full m-auto"
		alt="Alex Wang"
	/>
	<h1 class="font-display text-2xl sm:text-3xl mt-4 m-auto">@alex.wang.64</h1>
</div>

<div class="bg-gray-50 dark:bg-gray-800 dark:text-white sm:pb-8">
	<div class="max-w-(--breakpoint-sm) mx-auto px-4 py-6 space-y-4 flex flex-col">
		{#each data.links as link}
			<a href={link.url} target="_blank" rel="noopener">
				<div
					class="text-center text-lg sm:text-xl bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-300 dark:text-gray-950 dark:hover:bg-brand-200 transition-colors rounded-full py-3"
				>
					{#if link.icon}
						<i class="fa-solid {link.icon}"></i>
					{/if}
					{link.title}
				</div>
			</a>
		{/each}
	</div>
	<div class="max-w-(--breakpoint-sm) mx-auto">
		<SocialGrid socials={data.socials} />
	</div>
</div>
