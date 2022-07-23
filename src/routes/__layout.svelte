<script>
	import '../app.css';
	import '@fontsource/ibm-plex-sans';
	import '@fontsource/space-grotesk';
	import Footer from '$components/Footer.svelte';
	import Navbar from '$components/Navbar.svelte';

	import { browser, dev } from '$app/env';
	import { onMount } from 'svelte';
	import { title } from '../stores';

	let PWAReloadPrompt;
	onMount(async () => {
		!dev &&
			browser &&
			(PWAReloadPrompt = (await import('$components/PWAReloadPrompt.svelte')).default);
	});
</script>

<svelte:head>
	<title>{$title} | Alex Wang</title>
	<meta name="description" content="Alex's portfolio site" />
	<link rel="apple-touch-icon" href="/favicon.png" sizes="512x512" />
	<meta name="theme-color" content="#7E1F86" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://alex-wang.net/" />
	<meta property="og:title" content="Alex Wang" />
	<meta property="og:description" content="Alex's portfolio site" />
	<meta property="og:image" content="/favicon.png" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary" />
	<meta property="twitter:url" content="https://alex-wang.net/" />
	<meta property="twitter:title" content="Alex Wang" />
	<meta property="twitter:description" content="Alex's portfolio site" />
	<meta property="twitter:image" content="/favicon.png" />

	{#if !dev && browser}
		<link rel="manifest" href="/manifest.webmanifest" />
	{/if}
</svelte:head>

<div class="min-h-screen max-w-[1920px] relative">
	<Navbar />

	<slot />

	<Footer />

	{#if PWAReloadPrompt}
		<svelte:component this={PWAReloadPrompt} />
	{/if}
</div>
