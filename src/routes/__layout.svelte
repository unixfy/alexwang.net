<script>
	import '../app.css';
	import '@fontsource/ibm-plex-sans';
	import '@fontsource/space-grotesk';
	import Footer from '$components/Footer.svelte';
	import Navbar from '$components/Navbar.svelte';
</script>

<div class="min-h-screen max-w-[1920px] relative">
	<Navbar />

	<slot />

	<Footer />
</div>
