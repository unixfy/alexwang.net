<script>
	export let data;
	import dayjs from 'dayjs/esm';
	import utc from 'dayjs/esm/plugin/utc';

	dayjs.extend(utc);
</script>

<div class="bg-gray-100 dark:bg-gray-800 dark:text-white min-h-[33vh] flex text-center">
	<div class="m-auto p-16">
		<h1 class="text-2xl sm:text-3xl md:text-4xl font-display font-bold my-4">Project: {data.project.title}</h1>
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
					src="//cms.alexwang.net/assets/{data.project.image}"
					alt="Image for project {data.project.title}"
					class="rounded-lg dark:brightness-75"
				/>
				{#if data.project.url}
					<a
						href={data.project.url}
						target="_blank"
						class="mt-4 bg-blue-500 hover:bg-blue-300 transition-all text-white p-2 sm:p-4 text-center rounded-lg text-xl w-full block"
					>
						View project
					</a>
				{/if}
			</div>
			<div class="text-lg space-y-6">
                <div class="page-content-container">
                    {@html data.project.content_html}
                </div>
				<hr class="my-4" />
				<p class="text-sm italic">Published {dayjs(data.project.date).utc().format('MMMM DD, YYYY')}</p>
			</div>
		</div>
	</div>
</div>
