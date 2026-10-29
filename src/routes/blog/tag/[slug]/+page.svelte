<script>
	import BlogArchive from '#lib/BlogArchive.svelte';

	let { data } = $props();
</script>

<BlogArchive
	scope="tag={data.tag.slug}"
	{data}
	heading={data.tag.name}
	trail={[{ label: 'Blog', href: '/blog' }, { label: 'Tag' }, { label: data.tag.name }]}
	lede={data.tag.description || `Posts tagged “${data.tag.name}”`}
/>
