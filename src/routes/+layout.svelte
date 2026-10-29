<script>
	import '../app.css';

	import Footer from '#lib/Footer.svelte';
	import Navbar from '#lib/Navbar.svelte';

	import { watchReveals } from '#lib/reveal.js';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	import { browser, dev } from '$app/env';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';

	let { data, children } = $props();

	const pageTitle = $derived(page.error ? 'Error' : page.data.title || 'Welcome');
	const description = $derived(page.data.description || "Alex Wang's portfolio site");
	// one address per page; a blog archive's later pages are their own pages, a search is not
	const canonical = $derived.by(() => {
		const n = Number(page.url.searchParams.get('page'));
		const paged = page.url.pathname.startsWith('/blog') && n > 1 ? `?page=${n}` : '';
		return `https://alexwang.net${page.url.pathname === '/' ? '' : page.url.pathname}${paged}`;
	});
	const image = $derived(page.data.image || 'https://alexwang.net/og.png');

	const calm = browser && matchMedia('(prefers-reduced-motion: reduce)').matches;
	// Where the browser can, pages cross-fade and shared images (a project card to its page) morph;
	// elsewhere the simple fade below applies. Neither runs under reduced motion.
	const morph = browser && !calm && 'startViewTransition' in document;

	/** @type {HTMLElement | undefined} */
	let main = $state();
	$effect(() => {
		if (main) return watchReveals(main);
	});

	onNavigate((navigation) => {
		if (!morph) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<title>{pageTitle} | Alex Wang</title>
	<meta name="description" content={description} />
	{#if page.data.robots}<meta name="robots" content={page.data.robots} />{/if}
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
	<meta name="theme-color" content="#e5aee8" />

	<meta property="og:type" content={page.data.ogType || 'website'} />
	<link rel="canonical" href={canonical} />
	<meta property="og:url" content={canonical} />
	<meta property="og:site_name" content="Alex Wang" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:title" content="{pageTitle} | Alex Wang" />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	{#if !page.data.image}
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{pageTitle} | Alex Wang" />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<link rel="alternate" type="application/rss+xml" title="Alex Wang's blog" href="/blog/feed" />

	{#if !dev && browser}
		<link rel="manifest" href="/manifest.webmanifest" />
	{/if}
</svelte:head>

{#if data.config.banner_enabled}
	<!-- a notice from the CMS: a bar above the page, in the brand colour; the page and its nav start below it -->
	<div
		role="status"
		class="bg-brand-600 px-6 py-3 text-white md:px-12 dark:bg-brand-300 dark:text-gray-950 [&_a]:text-inherit [&_a]:hover:text-inherit"
	>
		<p class="max-w-4xl">
			{@html data.config.banner_content}
		</p>
	</div>
{/if}

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-brand-600 focus:text-white focus:px-4 focus:py-2"
	>Skip to content</a
>

<div class="relative min-h-screen bg-gray-50 dark:bg-gray-950">
	<Navbar />

	<main id="main" bind:this={main}>
		{#key page.url.pathname}
			<div in:fade={{ duration: calm || morph ? 0 : 200, easing: cubicOut }}>
				{@render children()}
			</div>
		{/key}
	</main>

	<Footer />
</div>
