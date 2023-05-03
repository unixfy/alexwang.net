<script>
	import ProjectsLister from '$lib/ProjectsLister.svelte';
</script>

<div class="bg-gray-100 dark:bg-gray-800 dark:text-white text-center min-h-[33vh] flex">
	<div class="m-auto p-16">
		<h1 class="text-4xl font-display font-bold my-4">Portfolio</h1>
		<h2 class="text-2xl">Some cool things I've done</h2>
	</div>
</div>

<div class="p-8 lg:p-16 bg-[#7E1F86]">
	<div class="ct">
		<ProjectsLister limit="100" />
	</div>
</div>
