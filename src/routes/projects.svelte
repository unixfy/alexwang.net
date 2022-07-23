<script>
	import ProjectsLister from '$components/ProjectsLister.svelte';
	import { title } from '../stores';;
	
	$title = 'Portfolio';
</script>

<div class="bg-gray-100 dark:bg-gray-800 dark:text-white text-center min-h-[33vh] flex">
	<div class="m-auto p-16">
		<h1 class="text-4xl font-display font-bold my-4">Portfolio</h1>
		<h2 class="text-2xl">Some cool things I've done</h2>
	</div>
</div>

<div class="p-8 lg:p-16 bg-[#7E1F86]">
	<ProjectsLister limit="12" />
</div>
