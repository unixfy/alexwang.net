<script>
	import SocialGrid from '$lib/SocialGrid.svelte';
	export let data;
</script>

<div class="bg-black text-white p-8 pt-20 flex flex-col">
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<img src="/profile.jpg" class="h-32 w-32 rounded-full m-auto" alt="Account profile photo" />
	<h1 class="font-display text-2xl sm:text-3xl mt-4 m-auto">@alex.wang.64</h1>
</div>

<div class="bg-neutral-50 dark:bg-slate-800 dark:text-white sm:pb-8">
	<div class="max-w-screen-sm mx-auto px-4 py-6 space-y-4 flex flex-col">
		{#each data.links as link}
			<a href={link.url} target="_blank" rel="noopener">
				<div
					class="text-center text-lg sm:text-xl bg-sky-500 text-white hover:bg-black transition-all rounded-full py-3"
				>
					{#if link.icon}
						<i class="fa-solid {link.icon}" />
					{/if}
					{link.title}
				</div>
			</a>
		{/each}
	</div>
	<div class="max-w-screen-sm mx-auto">
		<SocialGrid />
	</div>
</div>
