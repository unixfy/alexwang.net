<script>
	export let title;
	export let image;
	export let date;
	import dayjs from 'dayjs/esm';
	import utc from 'dayjs/esm/plugin/utc';
	// use "as" here to prevent name collision
	import {title as pageTitle} from '../../stores'  

	dayjs.extend(utc);
	$pageTitle = title;
</script>

<div class="bg-gray-100 dark:bg-gray-800 dark:text-white min-h-[33vh] flex text-center">
	<div class="m-auto p-16">
		<h1 class="text-2xl sm:text-3xl md:text-4xl font-display font-bold my-4">Project: {title}</h1>
		<p class="text-xl text-blue-500 hover:text-blue-300 transition-all">
			<a href="/projects"><i class="fas fa-arrow-left" /> Return to all projects</a>
		</p>
	</div>
</div>

<div class="p-8 sm:p-16 bg-white dark:bg-black dark:text-white min-h-[50vh]">
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
