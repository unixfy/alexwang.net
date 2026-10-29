<script>
	import BlogArchive from '#lib/BlogArchive.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="Alex Wang's blog" href="/blog/feed" />
</svelte:head>

<BlogArchive
	{data}
	heading="Blog"
	lede="Technology, servers, transportation and travel."
	query={data.q}
/>
