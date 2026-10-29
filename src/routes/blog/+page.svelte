<script>
	import BlogArchive from '#lib/BlogArchive.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<link rel="alternate" type="application/rss+xml" title="Alex Wang's blog" href="/blog/feed" />
</svelte:head>

<BlogArchive
	{data}
	heading={data.q ? `Search: ${data.q}` : 'Blog'}
	lede={data.q ? null : 'Technology, servers, transportation and travel.'}
	query={data.q}
	trail={data.q ? [{ label: 'Blog', href: '/blog' }, { label: 'Search' }] : []}
/>
