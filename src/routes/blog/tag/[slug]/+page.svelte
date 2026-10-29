<script>
	import BlogArchive from '#lib/BlogArchive.svelte';

	let { data } = $props();
</script>

<BlogArchive
	{data}
	heading={data.tag.name}
	lede={data.tag.description || `Posts tagged “${data.tag.name}”`}
/>
