<script>
	import '../app.css';
	import '@fontsource/ibm-plex-sans';
	import '@fontsource/space-grotesk';
	import Footer from '$components/Footer.svelte';
	import Navbar from '$components/Navbar.svelte';

	import { browser, dev } from '$app/env';
	import { onMount } from 'svelte';

	let PWAReloadPrompt;
	onMount(async () => {
		!dev &&
			browser &&
			(PWAReloadPrompt = (await import('$components/PWAReloadPrompt.svelte')).default);
	});
</script>

<svelte:head>
	<title>My Awesome App</title>
	<meta name="description" content="My Awesome App description">
	<link rel="apple-touch-icon" href="/favicon.png" sizes="180x180">
	<link rel="mask-icon" href="/favicon.png" color="#FFFFFF">
	<meta name="theme-color" content="#ffffff">

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
