<script>
	import dayjs from 'dayjs/esm';
	import utc from 'dayjs/esm/plugin/utc';
	dayjs.extend(utc);

	export let limit;

	//  note, we use the first n (n = limit) elements of our projects array

	let projects_raw = import.meta.glob('/src/routes/project/**/*.md', { eager: true });

	let projects = Object.entries(projects_raw)
		.map(([path, data]) => {
			// this is a REALLY janky way to remove the .md extension and remove the first 2 parts of the path (the /src/routes bit) along with the last part (the +page directory)
			let slug = '/' + path.replace(/\..+$/, '').split('/').slice(3, 5).join('/');
			// We don't actually need the HTML.. for now
			// let html = data.default.render()
			return {
				slug,
				// html,
				...data
			};
		})
		// this sorting algorithm sorts our data from newest to oldest
		.sort((a, b) => dayjs(b.metadata.date).diff(a.metadata.date))
		.slice(0, limit);
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
	{#each projects as project}
		<div
			class="transition-all flex-none drop-shadow rounded-lg bg-white hover:bg-gray-100 text-black dark:text-white dark:bg-slate-900 dark:hover:bg-slate-800"
		>
			<a href={project.slug}>
				<div class="flex flex-col">
					<img
						class="object-cover rounded-t-lg max-h-1/2 dark:brightness-75 aspect-video"
						src="/project/{project.metadata.image}"
						alt="Image for project {project.metadata.title}"
					/>
					<div class="p-4">
						<div class="text-lg md:text-xl lg:text-2xl my-2 font-bold font-display capitalize text-center">
							<p>{project.metadata.title}</p>
						</div>
						<div class="text-sm text-center italic">
							<p>{dayjs(project.metadata.date).utc().format('YYYY')}</p>
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
