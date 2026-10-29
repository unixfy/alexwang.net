<script>
	import Station from '#lib/Station.svelte';
	import BlogLister from '#lib/BlogLister.svelte';
	import Network from '#lib/Network.svelte';
	import CopyButton from '#lib/CopyButton.svelte';
	import Tower from '#lib/Tower.svelte';
	import { monthYear, dateSpan } from '#lib/date.js';
	import { domain } from '#lib/url.js';

	let { data } = $props();

	// The CMS only serves the profile picture at width 200, 600 or 1200 (other widths return a JSON
	// error and the image silently disappears); project, certification and award images accept any.
	const cms = 'https://cms.alexwang.net/assets';
	const latest = $derived(data.projects[0]);
	const current = $derived(
		data.employments.find((/** @type {{ end_date: string | null }} */ job) => !job.end_date)
	);
	const hasPhoto = $derived(Boolean(data.config.links_profile_picture));

	// Assembled client-side so the address isn't sitting in the served HTML
	let email = $state('');
	$effect(() => {
		email = ['alex', 'alexwang.net'].join('@');
	});

	// Certifications and Recognition start open but can be folded away; a link to one (the tower, a shared URL)
	// opens it again if it was
	$effect(() => {
		const openTarget = () => {
			const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
			if (el instanceof HTMLDetailsElement) el.open = true;
		};
		openTarget();
		addEventListener('hashchange', openTarget);
		return () => removeEventListener('hashchange', openTarget);
	});

	// The parts of Work, in page order. Each gets a heading with its icon, a jump link under xl and a
	// small stop on the rail from xl up. Employment and education only appear once the CMS has some.
	const groups = $derived(
		[
			{
				id: 'work-employment',
				label: 'Employment',
				icon: 'fa-briefcase',
				show: data.employments.length
			},
			{
				id: 'work-education',
				label: 'Education',
				icon: 'fa-graduation-cap',
				show: data.educations.length
			},
			{ id: 'work-projects', label: 'Projects', show: true },
			{
				id: 'work-certifications',
				label: 'Certifications',
				icon: 'fa-certificate',
				show: data.certifications.length,
				count: data.certifications.length
			},
			{
				id: 'work-recognition',
				label: 'Recognition',
				icon: 'fa-trophy',
				show: data.recognitions.length,
				count: data.recognitions.length
			}
		].filter((g) => g.show)
	);

	// shortcuts for the rail on the right; the same sections the page is made of
	const stops = $derived(
		/** @type {{ id: string; label: string; line: 'work' | 'writing' | 'contact'; sub?: boolean }[]} */ ([
			...(data.config.homepage_welcome_text ? [{ id: 'about', label: 'About', line: 'work' }] : []),
			{ id: 'work', label: 'Work', line: 'work' },
			...groups.map((g) => ({ id: g.id, label: g.label, line: 'work', sub: true })),
			{ id: 'writing', label: 'Writing', line: 'writing' },
			{ id: 'beyond', label: 'Beyond work', line: 'work' },
			{ id: 'contact', label: 'Contact', line: 'contact' }
		])
	);

	const doors = [
		{ href: '#work', label: 'Work', line: 'work' },
		{ href: '#writing', label: 'Writing', line: 'writing' },
		{ href: '#contact', label: 'Contact', line: 'contact' }
	];

	/**
	 * One entry per line break, so each becomes its own spaced paragraph.
	 * @param {string} text
	 */
	const lines = (text) => text.split(/\r?\n/).filter((line) => line.trim());

	const row =
		'group flex items-baseline gap-4 py-4 no-underline text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white';
</script>

{#snippet more(/** @type {string} */ href, /** @type {string} */ label, external = false)}
	<a
		{href}
		class={row}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener' : undefined}
	>
		<span class="t-item group-hover:underline underline-offset-4">
			{label}
			<i
				class="fa-solid fa-arrow-right inline-block transition-transform motion-reduce:transition-none group-hover:translate-x-1"
				aria-hidden="true"
			></i>
		</span>
	</a>
{/snippet}

{#snippet foldHead(/** @type {string} */ id)}
	{@const g = groups.find((x) => x.id === id)}
	{#if g}
		<summary
			class="t-group group-head flex w-fit max-w-4xl cursor-pointer list-none items-baseline gap-3 underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden"
		>
			{g.label}
			<span class="t-meta font-normal tabular-nums">{g.count}</span>
			<i
				class="fa-solid fa-chevron-down self-center text-sm text-gray-500 transition-transform group-open:rotate-180 motion-reduce:transition-none dark:text-gray-400"
				aria-hidden="true"
			></i>
		</summary>
	{/if}
{/snippet}

{#snippet groupHead(/** @type {string} */ id)}
	{@const g = groups.find((x) => x.id === id)}
	{#if g}
		<h3 {id} class="t-group group-head scroll-mt-8 mt-20 first-of-type:mt-0 mb-8">{g.label}</h3>
	{/if}
{/snippet}

<div class="line-page bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
	<span class="train" aria-hidden="true"></span>
	<Network>
		<!-- Terminus: who this is -->
		<header class="station station-start terminus pb-10 pr-6 md:pr-12">
			<span class="station-ring" aria-hidden="true"></span>
			<div class="grid md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-start max-w-6xl">
				<div data-calm>
					<h1 class="t-display text-brand-600 dark:text-brand-300">Alex Wang</h1>
					{#if data.config.lead_text}
						<p class="t-lede mt-6 max-w-xl">{data.config.lead_text}</p>
					{/if}
				</div>
				{#if hasPhoto}
					<img
						src="{cms}/{data.config.links_profile_picture}?format=webp&width=1200"
						alt="Alex Wang"
						class="aspect-square w-40 sm:w-56 md:w-72 rounded-2xl object-cover bg-gray-200 dark:bg-gray-800 dark:brightness-90 md:order-last"
					/>
				{/if}
			</div>
		</header>

		<!-- Junction: three doors, one branch each -->
		<nav aria-label="Sections" class="pb-24">
			<ol class="list-none">
				{#each doors as door}
					<li
						class="station pr-6 md:pr-12"
						style="--ring-top: 50%; --line: var(--line-{door.line})"
					>
						<span class="station-ring" aria-hidden="true"></span>
						<a
							href={door.href}
							class="group flex items-baseline gap-x-6 py-5 md:py-6 max-w-4xl no-underline text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white"
						>
							<span data-calm class="flex flex-wrap items-baseline gap-x-6 gap-y-1">
								<span
									class="t-title group-hover:underline decoration-[var(--line)] decoration-4 underline-offset-8"
									>{door.label}</span
								>
								<span class="text-gray-700 dark:text-gray-300 text-lg leading-snug">
									{#if door.line === 'work'}
										{#if current}Currently: {current.title ? `${current.title} at` : 'at'}
											{current.employer_name}{:else if latest}Latest: {latest.title}, {monthYear(
												latest.start_date
											)}{:else}Selected projects{/if}
									{:else if door.line === 'writing'}
										{#if data.posts[0]}Latest: {data.posts[0].title}{:else}Posts from the blog{/if}
									{:else}
										Email, LinkedIn and elsewhere
									{/if}
								</span>
							</span>
							<!-- the door's own line, running on from the label to the arrow where its route begins -->
							<span
								class="hidden h-1 min-w-6 flex-1 self-center rounded-full bg-[var(--line)] opacity-70 transition-opacity group-hover:opacity-100 md:block"
								aria-hidden="true"
							></span>
							<i
								data-route-start={door.line}
								class="fa-solid fa-arrow-down ml-auto self-center text-gray-500 dark:text-gray-400 transition-transform motion-reduce:transition-none group-hover:translate-y-1"
								aria-hidden="true"
							></i>
						</a>
					</li>
				{/each}
			</ol>
		</nav>
	</Network>

	<div class="relative xl:[--rail:21rem]">
		{#if data.config.homepage_welcome_text}
			<Station id="about" title="About">
				<div class="t-prose space-y-5 [&_strong]:font-bold">
					{@html data.config.homepage_welcome_text}
				</div>
			</Station>
		{/if}

		<Station id="work" title="Work">
			<div class="wide">
				{#if data.employments.length}
					{@render groupHead('work-employment')}
					<ol class="list-none max-w-4xl divide-y divide-gray-300 dark:divide-gray-700">
						{#each data.employments as job}
							<li
								class="stop-mark reveal py-6 first:pt-0 md:grid md:grid-cols-[10rem_1fr] md:gap-x-8"
								data-current={job.end_date ? undefined : ''}
							>
								<p class="t-meta tabular-nums mb-1 md:mb-0 md:pt-1.5 text-balance">
									{dateSpan(job.start_date, job.end_date)}
								</p>
								<div>
									<h4 class="t-item">
										{#if job.employer_url}
											<a href={job.employer_url} target="_blank" rel="noopener" class="ink-link"
												>{job.employer_name}</a
											>
										{:else}
											{job.employer_name}
										{/if}
									</h4>
									{#if job.title}<p class="font-bold">{job.title}</p>{/if}
									{#if job.location}<p class="t-meta">{job.location}</p>{/if}
									{#if job.description}
										<div
											class="mt-3 max-w-prose space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300"
										>
											{#each lines(job.description) as line}<p>{line}</p>{/each}
										</div>
									{/if}
								</div>
							</li>
						{/each}
					</ol>
				{/if}

				{#if data.educations.length}
					{@render groupHead('work-education')}
					<ol class="list-none max-w-4xl divide-y divide-gray-300 dark:divide-gray-700">
						{#each data.educations as school}
							<li
								class="stop-mark reveal py-6 first:pt-0 md:grid md:grid-cols-[10rem_1fr] md:gap-x-8"
							>
								<p class="t-meta tabular-nums mb-1 md:mb-0 md:pt-1.5 text-balance">
									{dateSpan(school.start_date, school.end_date)}
								</p>
								<div>
									<h4 class="t-item">{school.institution_name}</h4>
									{#if school.degree_name}<p class="font-bold">{school.degree_name}</p>{/if}
									{#if school.description}
										<div
											class="mt-3 max-w-prose space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300"
										>
											{#each lines(school.description) as line}<p>{line}</p>{/each}
										</div>
									{/if}
								</div>
							</li>
						{/each}
					</ol>
				{/if}

				{@render groupHead('work-projects')}
				<ol
					class="list-none grid gap-x-14 @5xl:grid-cols-2 [&>li]:border-b [&>li]:border-gray-300 dark:[&>li]:border-gray-700"
				>
					{#each data.projects as project, i}
						<li class="reveal" style="--d: {(i % 2) * 80}ms">
							<a href="/project/{project.slug}" class={row}>
								<span class="min-w-0 flex-1">
									<span class="t-item block group-hover:underline underline-offset-4"
										>{project.title}</span
									>
									<span class="t-meta mt-1 block tabular-nums"
										>{dateSpan(project.start_date, project.end_date)}</span
									>
									{#if project.excerpt}
										<span
											class="mt-2 line-clamp-3 text-sm md:text-base text-gray-700 dark:text-gray-300"
											>{project.excerpt}</span
										>
									{/if}
								</span>
								{#if project.image}
									<img
										src="{cms}/{project.image}?format=webp&width=400"
										alt=""
										loading="lazy"
										style="view-transition-name: p-{project.slug}"
										class="hidden sm:block w-32 aspect-video object-cover rounded dark:brightness-90 self-start mt-1"
									/>
								{/if}
							</a>
							{#if project.url}
								<a
									href={project.url}
									target="_blank"
									rel="noopener"
									class="btn btn-sm btn-outline btn-primary group mb-5 no-underline"
								>
									{domain(project.url) ?? 'View project'}
									<i
										class="fa-solid fa-arrow-up-right-from-square transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
										aria-hidden="true"
									></i>
								</a>
							{/if}
						</li>
					{/each}
				</ol>
				{@render more('/projects', 'All projects')}

				{#if data.certifications.length}
					<details id="work-certifications" open class="group mt-20 scroll-mt-8">
						{@render foldHead('work-certifications')}
						<ul class="list-none mt-8 grid sm:grid-cols-2 @5xl:grid-cols-3 gap-x-10 gap-y-6">
							{#each data.certifications as certification}
								<li class="reveal flex gap-4 items-center">
									<img
										src="{cms}/{certification.image}?format=webp&width=160"
										alt=""
										loading="lazy"
										class="w-14 aspect-square shrink-0 dark:brightness-90"
									/>
									<div>
										<p class="t-entry">{certification.name}</p>
										<p class="t-meta tabular-nums">
											{certification.reference} · {monthYear(certification.date)}
										</p>
									</div>
								</li>
							{/each}
						</ul>
					</details>
				{/if}

				{#if data.recognitions.length}
					<details id="work-recognition" open class="group mt-20 scroll-mt-8">
						{@render foldHead('work-recognition')}
						<ul class="list-none mt-8 grid md:grid-cols-2 @7xl:grid-cols-3 gap-x-10 gap-y-8">
							{#each data.recognitions as recognition}
								<li class="reveal flex gap-4">
									<img
										src="{cms}/{recognition.image}?format=webp&width=120"
										alt=""
										loading="lazy"
										class="w-12 h-12 shrink-0 object-contain rounded bg-white p-1 dark:brightness-90"
									/>
									<div>
										<p class="t-entry">{recognition.name}</p>
										<p class="t-meta tabular-nums">{monthYear(recognition.date)}</p>
										<p class="mt-1 text-sm md:text-base text-gray-700 dark:text-gray-300">
											{recognition.description}
										</p>
									</div>
								</li>
							{/each}
						</ul>
					</details>
				{/if}
			</div>
		</Station>

		<Station id="writing" title="Writing" line="writing">
			<div class="wide">
				{#if data.posts.length}
					<BlogLister posts={data.posts} />
				{:else}
					<p class="text-lg">
						No posts to show right now. <a href="/blog">Browse the blog</a>.
					</p>
				{/if}
			</div>
			<div class="wide">{@render more('/blog', 'More on the blog')}</div>
		</Station>

		<Station id="beyond" title="Beyond work">
			<ul class="list-none max-w-4xl divide-y divide-gray-300 dark:divide-gray-700">
				<li>
					<a href="/now" class={row}>
						<span class="t-item group-hover:underline underline-offset-4">Now</span>
						<span class="text-gray-700 dark:text-gray-300">What I’m up to right now</span>
					</a>
				</li>
				<li>
					<a href="/i-like" class={row}>
						<span class="t-item group-hover:underline underline-offset-4">What I like</span>
						<span class="text-gray-700 dark:text-gray-300"
							>I like too many things, so they’re all here</span
						>
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
						<a href="mailto:{email}" class="ink-link">{email}</a>
						<CopyButton text={email} what="email address" class="ml-3 align-middle" />
					{:else}
						alex [at] alexwang.net
					{/if}
				</li>
				{#each data.socials as social}
					<li>
						<i class="fa-brands {social.icon} w-8" aria-hidden="true"></i>
						<a href={social.url} target="_blank" rel="noopener" class="ink-link">{social.name}</a>
					</li>
				{/each}
			</ul>
			<p class="t-meta mt-10">End of the line.</p>
		</Station>

		<!-- the right-hand gutter: a sticky signal tower of shortcuts, wide screens only. Last in the source
		     so keyboard and screen-reader visitors reach the content before its nine shortcuts. -->
		<aside
			aria-label="Page shortcuts"
			class="pointer-events-none absolute inset-y-0 right-6 z-10 hidden w-64 xl:block"
		>
			<div class="pointer-events-auto sticky top-28 mt-40 h-[min(34rem,calc(100vh-9rem))]">
				<Tower {stops} />
			</div>
		</aside>
	</div>
</div>
