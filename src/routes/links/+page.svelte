<script>
	import Station from '#lib/Station.svelte';

	let { data } = $props();

	const lines = ['work', 'writing', 'contact'];
</script>

<div class="line-page">
	<span class="train" aria-hidden="true"></span>

	<header
		class="station station-start flex items-center gap-4 pb-8 pr-6 [--av:5rem] [--pt:3rem] [--ring-top:calc(var(--pt)+var(--av)/2)] pt-(--pt) sm:[--av:7rem] md:[--pt:7rem]"
	>
		<span class="station-ring" aria-hidden="true"></span>
		{#if data.config.links_profile_picture}
			<img
				src="//cms.alexwang.net/assets/{data.config.links_profile_picture}?format=webp&width=200"
				class="size-(--av) shrink-0 rounded-full object-cover dark:brightness-90"
				alt="Alex Wang"
			/>
		{/if}
		<h1 class="t-group min-w-0 text-brand-600 [overflow-wrap:anywhere] dark:text-brand-300">
			@alex.wang.64
		</h1>
	</header>

	<nav aria-label="Links">
		<ol class="max-w-2xl list-none">
			{#each data.links as link, i}
				<li class="station pr-6" style="--ring-top: 50%; --line: var(--line-{lines[i % 3]})">
					<span class="station-ring" aria-hidden="true"></span>
					<a
						href={link.url}
						target="_blank"
						rel="noopener"
						class="group flex min-h-16 items-center justify-between gap-4 py-3 no-underline text-gray-900 hover:text-gray-900 dark:text-white dark:hover:text-white"
					>
						<span class="t-item underline-offset-4 decoration-2 group-hover:underline"
							>{link.title}</span
						>
						{#if link.icon}
							<i class="fa-solid {link.icon} text-gray-500 dark:text-gray-400" aria-hidden="true"
							></i>
						{/if}
					</a>
				</li>
			{/each}
		</ol>
	</nav>

	<Station id="elsewhere" title="Elsewhere" line="contact" end>
		<ul class="flex max-w-2xl list-none flex-wrap gap-3">
			{#each data.socials as social}
				<li>
					<a
						href={social.url}
						target="_blank"
						rel="noopener"
						class="btn btn-soft btn-lg rounded-full no-underline"
					>
						<i class="fa-brands {social.icon}" aria-hidden="true"></i>
						{social.name}
					</a>
				</li>
			{/each}
		</ul>
	</Station>
</div>
