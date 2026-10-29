<script>
	import BlogArchive from '#lib/BlogArchive.svelte';

	let { data } = $props();
</script>

<BlogArchive
	{data}
	heading={data.category.name}
	lede={data.category.description || `Posts filed under ${data.category.name}`}
	active={data.category.slug}
/>
