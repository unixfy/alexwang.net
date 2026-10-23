<script>
	import '../app.css';

	import Footer from '#lib/Footer.svelte';
	import Navbar from '#lib/Navbar.svelte';

	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	import { browser, dev } from '$app/env';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { pwaInfo } from 'virtual:pwa-info';

	let { data, children } = $props();

	const pageTitle = $derived(page.error ? 'Error' : page.data.title || 'Welcome');

	const calm = browser && matchMedia('(prefers-reduced-motion: reduce)').matches;
	// Where the browser can, pages cross-fade and shared images (a project card to its page) morph;
	// elsewhere the simple fade below applies. Neither runs under reduced motion.
	const morph = browser && !calm && 'startViewTransition' in document;

	onNavigate((navigation) => {
		if (!morph) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered(r) {
					r &&
						setInterval(() => {
							r.update();
						}, 3600000);
				},
				onRegisterError(error) {
					console.error('SW registration error', error);
				}
			});
		}
	});
</script>

<svelte:head>
	<title>{pageTitle} | Alex Wang</title>
	<meta name="description" content="Alex Wang's portfolio site" />
	<link rel="apple-touch-icon" href="/favicon.png" sizes="512x512" />
	<meta name="theme-color" content="#7E1F86" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://alexwang.net{page.url.pathname}" />
	<meta property="og:title" content="{pageTitle} | Alex Wang" />
	<meta property="og:description" content="Alex Wang's portfolio site" />
	<meta property="og:image" content="https://alexwang.net/favicon.png" />
	<meta name="twitter:card" content="summary" />

	{#if !dev && browser}
		<link rel="manifest" href="/manifest.webmanifest" />
	{/if}
</svelte:head>

{#if data.config.banner_enabled}
	<div class="dark:bg-gray-700 dark:text-white bg-gray-300 p-6">
		<div class="ct">
			<p>
				{@html data.config.banner_content}
			</p>
		</div>
	</div>
{/if}

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-brand-600 focus:text-white focus:px-4 focus:py-2"
	>Skip to content</a
>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
	<Navbar />

	<main id="main">
		{#key page.url.pathname}
			<div in:fade={{ duration: calm || morph ? 0 : 200, easing: cubicOut }}>
				{@render children()}
			</div>
		{/key}
	</main>

	<Footer />
</div>
