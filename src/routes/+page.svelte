<script>
	import SocialGrid from '$lib/SocialGrid.svelte';
	import BlogLister from '$lib/BlogLister.svelte';
	import BlogListerLoading from '$lib/BlogListerLoading.svelte';
	import Error from '$lib/Error.svelte';
	import dayjs from 'dayjs/esm';
	import utc from 'dayjs/esm/plugin/utc';

	dayjs.extend(utc);

	export let data;
</script>

<div class="dark:bg-slate-900 dark:text-white">
	<div class="ct">
		<div class="min-h-screen px-8 z-0 relative">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-screen">
				<!-- the size of this thing should be ~56.25% of the size of the "hello" image -->
				<img
					src="/curvy_things.svg"
					alt="Curvy things"
					class="absolute top-[3.125rem] sm:top-0 left-0 h-[10rem] md:h-[13rem] lg:h-[18rem] dark:brightness-90 dark:invert aspect-square"
				/>
				<div class="flex flex-col">
					<div class="md:m-auto md:ml-16 text-center md:text-left">
						<p class="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-lg">
							👋 Hey there. I'm
						</p>
						<h1
							class="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-t from-[#7BC6CC] to-[#BE93C5] bg-clip-text text-transparent font-bold drop-shadow-lg my-2 md:my-8 py-2 hover:scale-105 transition-all leading-tight tracking-tight"
						>
							Alex Wang
						</h1>
						<p class="font-display text-xl md:text-2xl sm:text-3xl">
							I'm obsessed with mobility, technology, and solutions.
						</p>
					</div>
				</div>
				<div class="flex order-first md:order-last">
					<img
						src="/alex.jpg"
						alt="Picture of Alex"
						class="md:m-auto mt-auto mx-auto dark:brightness-90 aspect-square h-56 sm:h-72 md:h-96 lg:h-[32rem] rounded-2xl shadow-xl hover:scale-105 transition-all bg-gray-200 bg-pulse"
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="bg-gray-200 p-8 md:p-12 dark:bg-slate-700 dark:text-white">
	<div class="flex">
		<div class="text-2xl md:text-3xl m-auto font-display md:leading-relaxed max-w-4xl space-y-8">
			<p>
				I study <span class="font-bold">⚙️ industrial engineering</span> and
				<span class="font-bold">🏦 public policy</span>
				at the University of Southern California. I'm also a self-taught
				<span class="font-bold">🧑‍💻 web developer</span>.
			</p>
			<p>
				I'm interested in infrastructure policy, consumer technology, behavioral economics, and
				operations research.
			</p>
			<p>
				I am a 🚆 transportation nerd, 🔮 serial side quester, 🏃‍♂️ casual runner, ✈️ frequent miler,
				😋 serious foodie, and 📜 longform journalist enthusiast.
				<a class="font-bold" href="/i-like"
					>But I like too many things, so I've put them here. <i
						class="fa-solid fa-circle-arrow-right"
					></i></a
				>
			</p>
			<p class="font-bold">
				<a href="/now"
					>Find out what I'm up to right now. <i class="fa-solid fa-circle-arrow-right"></i></a
				>
			</p>
		</div>
	</div>
</div>

<!-- <div class="py-12 px-8 bg-[#7E1F86] flex">
	<p class="text-3xl italic text-white m-auto font-light">
		If passion drives you, let reason hold the reins.
	</p>
</div> -->

<div class="p-8 dark:bg-slate-900 dark:text-white">
	<div class="ct">
		<h1 class="font-display text-3xl md:text-4xl font-bold text-center mb-8">Writing</h1>
		<!--        is this a crappy way to handle the stream? -->
		{#await data.streamed.blogPostsRequest}
			<BlogListerLoading />
		{:then blogPostsReq}
			{#await blogPostsReq.json()}
				<BlogListerLoading />
			{:then posts}
				<BlogLister {posts} />
			{/await}
		{:catch error}
			<Error message={error} />
		{/await}

		<p class="text-center mt-6 text-lg">
			<a href="https://blog.alexwang.net" target="_blank" rel="noopener"
				>View more <i class="fa-solid fa-arrow-right"></i></a
			>
		</p>
	</div>
</div>

<div class="p-8 bg-[#7E1F86] text-white">
	<div class="ct">
		<div class="flex flex-col md:flex-row">
			<div class="flex">
				<h1
					class="font-display text-3xl md:text-4xl font-bold md:[writing-mode:vertical-lr] md:rotate-180 m-auto mb-8 md:mb-auto md:mr-8"
				>
					Things I've Worked On
				</h1>
			</div>

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

			<a
				href="/projects"
				class="p-4 md:p-6 bg-white text-black flex rounded-lg mt-8 md:mt-0 md:ml-8 hover:bg-gray-100 dark:text-white dark:bg-slate-900 dark:hover:bg-slate-800 transition-all"
				aria-label="View more projects"
			>
				<div class="m-auto text-center">
					<p class="md:hidden text-xl">View all <i class="fa-solid fa-arrow-right" /></p>
					<!-- This bit only shows md or larger -->
					<i class="hidden md:block fa-solid fa-arrow-right fa-3x m-auto" />
				</div>
			</a>
		</div>
	</div>
</div>

<div class="p-8 dark:bg-slate-900 dark:text-white">
	<div class="ct">
		<h1 class="font-display text-3xl md:text-4xl font-bold text-center mb-8">Certifications</h1>

		<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-8 lg:gap-16">
			{#each data.certifications as certification}
				<div
					class="flex flex-col justify-between grayscale hover:grayscale-0 hover:scale-110 transition-all"
				>
					<img
						src="https://cms.alexwang.net/assets/{certification.image}?format=webp"
						alt="Shield for {certification.name}"
						class="w-36 aspect-square justify-self-start self-center mb-4"
					/>
					<p class="font-bold font-display mb-2 text-center">{certification.name}</p>
					<p class="text-xs justify-self-end text-center">
						{certification.reference} - {dayjs(certification.date).utc().format('MMMM YYYY')}
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="dark:bg-slate-900 dark:text-white bg-gray-100">
	<div class="ct">
		<div class="grid grid-cols-1 lg:grid-cols-2">
			<SocialGrid socials={data.socials} />
			<div class="p-8 flex">
				<div class="m-auto">
					<h1 class="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
						Let's get in touch!
					</h1>
					<div
						class="bg-white dark:bg-slate-800 p-8 rounded-xl drop-shadow-lg hover:drop-shadow-2xl transition-all max-w-2xl mx-auto aspect-[1.618/1] border border-gray-200 dark:border-slate-700 hover:-translate-y-2 hover:scale-105 duration-300 ease-out"
					>
						<div class="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 h-full">
							<div class="flex flex-col items-center gap-4">
								<img
									src="/alex.jpg"
									alt="Alex Wang"
									class="w-32 h-32 rounded-full border-4 border-slate-400 dark:border-slate-600"
								/>
								<h2 class="text-3xl font-display font-bold text-slate-800 dark:text-white">
									Alex Wang
								</h2>
							</div>
							<div class="flex flex-col justify-center">
								<div class="space-y-4 font-medium text-slate-700 dark:text-slate-200">
									<div class="flex items-center gap-4">
										<i class="fa-solid fa-envelope w-6" />
										<p>alex [at] alexwang.net</p>
									</div>
									<div class="flex items-center gap-4">
										<i class="fa-brands fa-linkedin w-6" />
										<p>/in/alex-y-wang</p>
									</div>
									<div class="flex items-center gap-4">
										<i class="fa-solid fa-link w-6" />
										<p>alexwang.net</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
