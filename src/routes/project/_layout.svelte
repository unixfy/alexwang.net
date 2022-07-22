<script>
	export let title;
	export let description;
	export let image;
</script>
<div class="bg-gray-100 dark:bg-gray-800 dark:text-white min-h-[33vh] flex text-center">
	<div class="m-auto p-16">
		<h1 class="text-4xl font-display font-bold my-4">Project: {title}</h1>
		<p class="text-xl text-blue-500 hover:text-blue-300 transition-all"><a href="/portfolio"><i class="fas fa-arrow-left" /> Return to all projects</a></p>
	</div>
</div>

<div class="p-8 bg-white dark:bg-black dark:text-white min-h-[50vh]">
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div>
			<img src={image} alt="Image for project {title}" class="rounded-lg dark:brightness-75" />
		</div>
		<div>
			{description}
		</div>
	</div>
	<hr class="my-4" />
    <slot />
</div>
