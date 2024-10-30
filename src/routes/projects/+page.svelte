<script>
	import dayjs from 'dayjs/esm';
	import utc from 'dayjs/esm/plugin/utc';
	dayjs.extend(utc);

	export let data;
</script>

<div class="bg-gray-100 dark:bg-gray-800 dark:text-white text-center min-h-[33vh] flex">
	<div class="m-auto p-16">
		<h1 class="text-4xl font-display font-bold my-4">Portfolio</h1>
		<h2 class="text-2xl">Some cool things I've done</h2>
	</div>
</div>

<div class="p-8 lg:p-16 bg-[#7E1F86]">
	<div class="ct">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each data.projects as project}
				<div
					class="transition-all flex-none drop-shadow rounded-lg bg-white hover:bg-gray-100 text-black dark:text-white dark:bg-slate-900 dark:hover:bg-slate-800"
				>
					<a href="/project/{project.slug}">
						<div class="flex flex-col">
							<img
								class="object-cover rounded-t-lg max-h-1/2 dark:brightness-75 aspect-video"
								src="//cms.alexwang.net/assets/{project.image}?format=webp"
								alt="Image for project {project.title}"
							/>
							<div class="p-4">
								<div
									class="text-lg md:text-xl lg:text-2xl my-2 font-bold font-display text-center"
								>
									<p>{project.title}</p>
								</div>
								<div class="text-sm text-center italic">
									<p>{dayjs(project.date).utc().format('YYYY')}</p>
								</div>
								<!-- <div class="text-lg">
									<p>
										Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad recusandae, consequatur
										corrupti vel quisquam id itaque nam
									</p>
								</div> -->
								<!-- Note that I don't have descriptions in the page metadata so we aren't using this -->
							</div>
						</div>
					</a>
				</div>
			{/each}
		</div>
	</div>
</div>
