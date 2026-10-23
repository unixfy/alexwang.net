<script>
	import Station from '#lib/Station.svelte';
	import BlogLister from '#lib/BlogLister.svelte';
	import BlogListerLoading from '#lib/BlogListerLoading.svelte';
	import { year, monthYear } from '#lib/date.js';

	let { data } = $props();

	const cms = 'https://cms.alexwang.net/assets';
	const latest = $derived(data.projects[0]);

	// Assembled client-side so the address isn't sitting in the served HTML
	let email = $state('');
	$effect(() => {
		email = ['alex', 'alexwang.net'].join('@');
	});

	const doors = [
		{ href: '#work', label: 'Work', line: 'work' },
		{ href: '#writing', label: 'Writing', line: 'writing' },
		{ href: '#contact', label: 'Contact', line: 'contact' }
	];

	const row =
		'group flex items-baseline gap-4 py-4 no-underline text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white';
</script>

<div class="line-page bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
	<!-- Terminus: who this is -->
	<header
		class="station station-start pt-24 md:pt-32 pb-10 pr-6 md:pr-12 [--ring-top:7.9rem] md:[--ring-top:10.25rem] lg:[--ring-top:12rem]"
	>
		<span class="station-ring" aria-hidden="true"></span>
		<div class="grid md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-start max-w-6xl">
			<div>
				<h1
					class="font-display font-bold tracking-tight leading-none text-6xl sm:text-7xl lg:text-9xl text-brand-600 dark:text-brand-300"
				>
					Alex Wang
				</h1>
				<p class="font-display text-xl sm:text-2xl md:text-3xl mt-6 max-w-xl">
					I'm obsessed with mobility, technology, and solutions.
				</p>
			</div>
			<img
				src="{cms}/{data.config.links_profile_picture}?format=webp&width=800"
				alt="Alex Wang"
				class="aspect-square w-40 sm:w-56 md:w-72 rounded-2xl object-cover bg-gray-200 dark:bg-gray-800 dark:brightness-90 md:order-last"
			/>
		</div>
	</header>

	<!-- Junction: three doors, one branch each -->
	<nav aria-label="Sections" class="pb-6">
		<ol class="list-none">
			{#each doors as door}
				<li class="station pr-6 md:pr-12" style="--ring-top: 50%; --line: var(--line-{door.line})">
					<span class="station-ring" aria-hidden="true"></span>
					<a
						href={door.href}
						class="group flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5 md:py-6 max-w-4xl no-underline text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white"
					>
						<span
							class="font-display text-3xl md:text-5xl font-bold tracking-tight group-hover:underline decoration-[var(--line)] decoration-4 underline-offset-8"
							>{door.label}</span
						>
						<span class="text-gray-700 dark:text-gray-300 md:text-lg">
							{#if door.line === 'work'}
								Latest: {latest.title}, {year(latest.date)}
							{:else if door.line === 'writing'}
								{#await data.posts}
									Latest posts from the blog
								{:then posts}
									Latest: {@html posts[0]?.title.rendered}
								{:catch}
									Posts from the blog
								{/await}
							{:else}
								Email, LinkedIn and elsewhere
							{/if}
						</span>
						<i class="fa-solid fa-arrow-down ml-auto text-gray-500 dark:text-gray-400" aria-hidden="true"></i>
					</a>
				</li>
			{/each}
		</ol>
	</nav>

	<Station id="about" title="About">
		<div
			class="max-w-prose text-lg md:text-xl leading-relaxed space-y-5 [&_strong]:font-semibold"
		>
			{@html data.config.homepage_welcome_text}
		</div>
	</Station>

	<Station id="work" title="Work">
		<ol class="list-none max-w-4xl divide-y divide-gray-300 dark:divide-gray-700">
			{#each data.projects as project}
				<li>
					<a href="/project/{project.slug}" class={row}>
						<span class="w-14 shrink-0 tabular-nums text-gray-600 dark:text-gray-300">{year(project.date)}</span>
						<span class="flex-1 font-display text-xl md:text-2xl font-bold group-hover:underline underline-offset-4"
							>{project.title}</span
						>
						<img
							src="{cms}/{project.image}?format=webp&width=400"
							alt=""
							loading="lazy"
							class="hidden sm:block w-32 aspect-video object-cover rounded dark:brightness-90 self-center"
						/>
					</a>
				</li>
			{/each}
			<li>
				<a href="/projects" class={row}>
					<span class="w-14 shrink-0" aria-hidden="true"></span>
					<span class="font-display text-xl font-bold group-hover:underline underline-offset-4">
						All projects <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
					</span>
				</a>
			</li>
		</ol>

		<h3 class="font-display text-2xl font-bold mt-16 mb-6">Certifications</h3>
		<ul class="list-none grid sm:grid-cols-2 gap-x-10 gap-y-6 max-w-4xl">
			{#each data.certifications as certification}
				<li class="flex gap-4 items-center">
					<img
						src="{cms}/{certification.image}?format=webp&width=160"
						alt=""
						loading="lazy"
						class="w-14 aspect-square shrink-0 dark:brightness-90"
					/>
					<div>
						<p class="font-bold">{certification.name}</p>
						<p class="text-sm text-gray-600 dark:text-gray-300">
							{certification.reference}, {monthYear(certification.date)}
						</p>
					</div>
				</li>
			{/each}
		</ul>

		<h3 class="font-display text-2xl font-bold mt-16 mb-6">Recognition</h3>
		<ul class="list-none grid md:grid-cols-2 gap-x-10 gap-y-8 max-w-4xl">
			{#each data.recognitions as recognition}
				<li class="flex gap-4">
					<img
						src="{cms}/{recognition.image}?format=webp&width=120"
						alt=""
						loading="lazy"
						class="w-12 h-12 shrink-0 object-contain rounded bg-white p-1 dark:brightness-90"
					/>
					<div>
						<p class="font-bold">{recognition.name}</p>
						<p class="text-sm text-gray-600 dark:text-gray-300">{monthYear(recognition.date)}</p>
						<p class="mt-1 text-gray-700 dark:text-gray-300">{recognition.description}</p>
					</div>
				</li>
			{/each}
		</ul>
	</Station>

	<Station id="writing" title="Writing" line="writing">
		{#await data.posts}
			<BlogListerLoading />
		{:then posts}
			<BlogLister {posts} />
		{:catch}
			<p class="text-lg">
				The latest posts aren't loading right now.
				<a href="https://blog.alexwang.net" target="_blank" rel="noopener">Read them on the blog</a>.
			</p>
		{/await}
		<p class="mt-6 text-lg">
			<a href="https://blog.alexwang.net" target="_blank" rel="noopener">
				More on the blog <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
			</a>
		</p>
	</Station>

	<Station id="beyond" title="Beyond work">
		<ul class="list-none max-w-4xl divide-y divide-gray-300 dark:divide-gray-700">
			<li>
				<a href="/now" class={row}>
					<span class="font-display text-xl md:text-2xl font-bold group-hover:underline underline-offset-4"
						>Now</span
					>
					<span class="text-gray-700 dark:text-gray-300">What I'm up to right now</span>
				</a>
			</li>
			<li>
				<a href="/i-like" class={row}>
					<span class="font-display text-xl md:text-2xl font-bold group-hover:underline underline-offset-4"
						>What I like</span
					>
					<span class="text-gray-700 dark:text-gray-300">I like too many things, so they're all here</span>
				</a>
			</li>
		</ul>
	</Station>

	<!-- End of the line -->
	<Station id="contact" title="Contact" line="contact" end>
		<ul class="list-none space-y-3 text-lg md:text-xl max-w-4xl">
			<li>
				<i class="fa-solid fa-envelope w-8" aria-hidden="true"></i>
				{#if email}
					<a href="mailto:{email}">{email}</a>
				{:else}
					alex [at] alexwang.net
				{/if}
			</li>
			{#each data.socials as social}
				<li>
					<i class="fa-brands {social.icon} w-8" aria-hidden="true"></i>
					<a href={social.url} target="_blank" rel="noopener">{social.name}</a>
				</li>
			{/each}
		</ul>
	</Station>
</div>
