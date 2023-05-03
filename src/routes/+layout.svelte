<script>
    import '../app.css';
    import '@fontsource/ibm-plex-sans';
    import '@fontsource/space-grotesk';
    import Footer from '$components/Footer.svelte';
    import Navbar from '$components/Navbar.svelte';

    import {browser, dev} from '$app/environment';
    import {onMount} from 'svelte';
    import {title} from '../stores';
    import {pwaInfo} from 'virtual:pwa-info';

    onMount(async () => {
        if (pwaInfo) {
            const {registerSW} = await import('virtual:pwa-register')
            registerSW({
                immediate: true,
                onRegistered(r) {
                    r && setInterval(() => {
                       console.log('Checking for sw update')
                       r.update()
                    }, 3600000)
                    console.log(`SW Registered: ${r}`)
                },
                onRegisterError(error) {
                    console.log('SW registration error', error)
                }
            })
        }
    })
</script>

<svelte:head>
    <title>{$title} | Alex Wang</title>
    <meta name="description" content="Alex's portfolio site"/>
    <link rel="apple-touch-icon" href="/favicon.png" sizes="512x512"/>
    <meta name="theme-color" content="#7E1F86"/>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website"/>
    <meta property="og:url" content="https://alexwang.net/"/>
    <meta property="og:title" content="Alex Wang"/>
    <meta property="og:description" content="Alex's portfolio site"/>
    <meta property="og:image" content="/favicon.png"/>

    <!-- Twitter -->
    <meta property="twitter:card" content="summary"/>
    <meta property="twitter:url" content="https://alexwang.net/"/>
    <meta property="twitter:title" content="Alex Wang"/>
    <meta property="twitter:description" content="Alex's portfolio site"/>
    <meta property="twitter:image" content="/favicon.png"/>

    {#if !dev && browser}
        <link rel="manifest" href="/manifest.webmanifest"/>
    {/if}
</svelte:head>

<div class="dark:bg-slate-500 dark:text-white bg-slate-300 p-6">
    <div class="ct">
        <p class="text-md">
            <span class="font-bold">My website has moved!</span> I've managed to get my hands on alexwang.net.
            Everything on alex-wang.net has been be moved to alexwang.net, including emails. No dash for me! 🎉
        </p>
    </div>
</div>
<div class="min-h-screen">
    <Navbar/>

    <slot/>

    <Footer/>
</div>
