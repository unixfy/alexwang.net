<script>
	import Navbar from '$components/Navbar.svelte';
	import SocialGrid from '$components/SocialGrid.svelte';
	import BlogLister from '$components/BlogLister.svelte';
	import ProjectsLister from '$components/ProjectsLister.svelte';
</script>

<div class="absolute top-0 right-0">
	<Navbar />
</div>

<div class="min-h-screen px-8 dark:bg-slate-900 dark:text-white">
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-screen">
		<div class="flex justify-center contents-center flex-col">
			<img
				src="/curvy_things.svg"
				alt="Curvy things"
				class="absolute top-0 left-0 w-[18rem] h-[18rem] dark:brightness-90 dark:invert"
			/>

			<p class="font-display text-5xl drop-shadow-lg ml-16">👋 Hey there, I'm</p>
			<h1
				class="font-display text-8xl bg-gradient-to-t from-[#7BC6CC] to-[#BE93C5] bg-clip-text text-transparent font-black drop-shadow-lg my-8 py-2 ml-16"
			>
				Alex Wang
			</h1>
			<p class="font-display text-3xl ml-16">Driven by passion; restrained by reason.</p>
		</div>
		<div class="flex">
			<img
				src="/blob.svg"
				alt="Background blob"
				width="550px"
				height="550px"
				class="m-auto dark:brightness-90"
			/>
		</div>
	</div>
</div>

<div class="bg-gray-200 p-8 dark:bg-slate-700 dark:text-white">
	<div class="grid grid-cols-1 md:grid-cols-5 gap-6">
		<div class="col-span-2 flex">
			<h2 class="text-4xl m-auto">
				I am a <span class="font-bold text-5xl font-display">web developer</span>
			</h2>
		</div>
		<div class="col-span-3">
			<p class="text-xl">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel tellus convallis, tincidunt
				nisl eget, faucibus diam. Nullam ac nisi ac ante lacinia convallis. Suspendisse id lacus et
				dui interdum tincidunt. Aenean sollicitudin diam vel suscipit auctor. Suspendisse tempus
				rutrum nunc in pulvinar. Mauris auctor, nisi non auctor varius, diam ipsum efficitur nulla,
				in accumsan lectus augue quis nulla. Sed ut ex libero. Sed aliquam sed massa sit amet
				suscipit.
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
	<h1 class="font-display text-4xl font-bold text-center mb-8">Writing</h1>

	<BlogLister />
</div>

<div class="p-8 bg-[#7E1F86] text-white">
	<div class="flex">
		<div class="flex">
			<h1
				class="font-display text-4xl font-bold text-center [writing-mode:vertical-lr] rotate-180 inline my-auto  mr-8"
			>
				Stuff I've Done
			</h1>
		</div>
		<ProjectsLister />
		<a href="/portfolio" class="p-6 bg-white text-black flex rounded-lg" aria-label="View more projects">
			<div class="m-auto">
				<p class="md:hidden">View all</p>
				<i class="fa-solid fa-arrow-right fa-3x m-auto" />
			</div>
		</a>
	</div>
</div>

<div>
	<div class="grid grid-cols-1 lg:grid-cols-2">
		<SocialGrid />
		<div class="p-8 bg-gray-100 flex dark:bg-slate-800 dark:text-white">
			<div class="m-auto">
				<h1 class="text-3xl font-display font-bold mb-8 text-center">Let's get in touch!</h1>
				<div
					class="bg-slate-400 dark:bg-slate-500 p-4 drop-shadow-lg hover:drop-shadow-2xl dark:drop-shadow-white transition max-w-6xl text-white md:mx-8"
				>
					<div class="grid grid-cols-2 gap-12">
						<div class="flex flex-col">
							<p class="text-3xl font-display font-bold text-center mb-8">Alex Wang</p>
							<img class="mx-auto h-48 w-48" alt="Jumping out of an envelope" src="/envelope.png" />
						</div>
						<div>
							<p class="lowercase text-right font-extralight text-xl">
								Building reliable, efficient, usable, & informed solutions.
							</p>
							<div class="my-8 grid grid-rows-4 gap-4 font-semibold text-right text-2xl">
								<div class="flex flex-row justify-between">
									<i class="fa-solid fa-envelope" />
									<p>alex [at] unixfy.net</p>
								</div>
								<div class="flex flex-row justify-between">
									<i class="fa-brands fa-linkedin" />
									<p>/in/alex-y-wang</p>
								</div>
								<div class="flex flex-row justify-between">
									<i class="fa-solid fa-link" />
									<p>alex-wang.net</p>
								</div>
								<div class="flex flex-row justify-between">
									<i class="fa-solid fa-phone" />
									<p>+1 123-123-1234</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
