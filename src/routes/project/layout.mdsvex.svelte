<script>
	export let title;
	export let image;
	export let date;
	import dayjs from 'dayjs/esm';
	import utc from 'dayjs/esm/plugin/utc';
	dayjs.extend(utc);
</script>

<!--We do this hackiness because there's no way for endpoints to access the title frontmatter from our MD files (limitation of Mdsvex)-->
<svelte:head>
    <title>{title} | Alex Wang</title>
</svelte:head>

<div class="bg-gray-100 dark:bg-gray-800 dark:text-white min-h-[33vh] flex text-center">
	<div class="m-auto p-16">
		<h1 class="text-2xl sm:text-3xl md:text-4xl font-display font-bold my-4">Project: {title}</h1>
		<p class="text-xl">
			<a href="/projects"><i class="fas fa-arrow-left" /> Return to all projects</a>
		</p>
	</div>
</div>

<div class="p-8 sm:p-16 bg-white dark:bg-black dark:text-white min-h-[50vh]">
	<div class="ct">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
			<div>
				<img
					src="/project/{image}"
					alt="Image for project {title}"
					class="rounded-lg dark:brightness-75"
				/>
			</div>
			<div class="text-lg space-y-6">
				<slot />
				<hr class="my-4" />
				<p class="text-sm italic">Published {dayjs(date).utc().format('MMMM DD, YYYY')}</p>
			</div>
		</div>
	</div>
</div>
