<script>
	import '../app.css';
    import '@fontsource/ibm-plex-sans';
    import '@fontsource/space-grotesk';
    import Footer from '$components/Footer.svelte';
    import Navbar from '$components/Navbar.svelte';
</script>

<div class="min-h-screen max-w-[1920px]">
    <div class="absolute top-0 right-0">
        <Navbar />
    </div>

    <slot />
</div>

<Footer/>