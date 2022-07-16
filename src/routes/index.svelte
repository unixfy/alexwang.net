<script>
	import Navbar from '$components/Navbar.svelte';
	import SocialGrid from '$components/SocialGrid.svelte';
</script>

<div class="min-h-screen px-8">
	<img
		src="/curvy_things.svg"
		alt="Curvy things"
		class="absolute top-0 left-0 w-[18rem] h-[18rem]"
	/>
	<div class="absolute top-0 right-0">
		<Navbar />
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-screen">
		<div class="flex justify-center contents-center flex-col">
			<p class="font-display text-5xl drop-shadow-lg ml-16">👋 Hey there, I'm</p>
			<h1
				class="font-display text-8xl bg-gradient-to-t from-[#7BC6CC] to-[#BE93C5] bg-clip-text text-transparent font-black drop-shadow-lg my-8 py-2 ml-16"
			>
				Alex Wang
			</h1>
			<p class="font-display text-3xl ml-16">Driven by passion; restrained by reason.</p>
		</div>
		<div class="flex">
			<img src="/blob.svg" alt="Background blob" width="550px" height="550px" class="m-auto" />
		</div>
	</div>
</div>

<div class="bg-gray-200 p-8">
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

<div class="p-8">
	<h1 class="font-display text-4xl font-bold text-center">Writing</h1>

	<div class="grid grid-cols-2">
		<a
			href="#"
			class="flex flex-col items-center bg-white rounded-lg border shadow-md md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 w-full"
		>
			<img
				class="object-cover w-full h-96 rounded-t-lg md:h-auto md:w-1/3 object-cover md:rounded-none md:rounded-l-lg"
				src="https://images.unsplash.com/photo-1656078249583-c73346944f44?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
				alt=""
			/>
			<div class="flex flex-col justify-between p-4 leading-normal w-full">
				<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					Noteworthy technology acquisitions 2021
				</h5>
				<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
					Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse
					chronological order.
				</p>
			</div>
		</a>
		<a
			href="#"
			class="flex flex-col items-center bg-white rounded-lg border shadow-md md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
		>
			<img
				class="object-cover w-full h-96 rounded-t-lg md:h-auto md:w-1/3 object-cover md:rounded-none md:rounded-l-lg"
				src="https://images.unsplash.com/photo-1656078249583-c73346944f44?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
				alt=""
			/>
			<div class="flex flex-col justify-between p-4 leading-normal">
				<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					Noteworthy technology acquisitions 2021
				</h5>
				<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
					Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse
					chronological order.
				</p>
			</div>
		</a>
	</div>
</div>

<div class="p-8 bg-gray-200">
	<div class="flex">
		<div class="flex">
			<h1
				class="font-display text-4xl font-bold text-center [writing-mode:vertical-lr] rotate-180 inline my-auto  mr-8"
			>
				Stuff I've Done
			</h1>
		</div>
		<div>
			<div
				id="scrollContainer"
				class="flex flex-no-wrap overflow-x-scroll scroll-smooth cursor-[grab] scrolling-touch items-start mb-8"
			>
				<div class="flex-none w-2/3 md:w-1/3 mr-8 md:pb-4 border rounded-lg">
					<a href="#" class="space-y-4">
						<div class="aspect-w-16 aspect-h-9">
							<img
								class="object-cover shadow-md hover:shadow-xl rounded-lg"
								src="https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-1.2.1&ixqx=3H1AJd0Pae&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80"
								alt=""
							/>
						</div>
						<div class="px-4 py-2">
							<div class="text-lg leading-6 font-medium space-y-1">
								<h3 class="font-bold text-gray-800 text-3xl mb-2">Some title goes here</h3>
							</div>
							<div class="text-lg">
								<p class="">
									Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad recusandae,
									consequatur corrupti vel quisquam id itaque nam
								</p>
								<p class="font-medium text-sm text-indigo-600 mt-2">
									Read more<span class="text-indigo-600">&hellip;</span>
								</p>
							</div>
						</div>
					</a>
				</div>
				<div class="flex-none w-2/3 md:w-1/3 mr-8 md:pb-4 border rounded-lg">
					<a href="#" class="space-y-4">
						<div class="aspect-w-16 aspect-h-9">
							<img
								class="object-cover shadow-md hover:shadow-xl rounded-lg"
								src="https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-1.2.1&ixqx=3H1AJd0Pae&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80"
								alt=""
							/>
						</div>
						<div class="px-4 py-2">
							<div class="text-lg leading-6 font-medium space-y-1">
								<h3 class="font-bold text-gray-800 text-3xl mb-2">Some title goes here</h3>
							</div>
							<div class="text-lg">
								<p class="">
									Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad recusandae,
									consequatur corrupti vel quisquam id itaque nam
								</p>
								<p class="font-medium text-sm text-indigo-600 mt-2">
									Read more<span class="text-indigo-600">&hellip;</span>
								</p>
							</div>
						</div>
					</a>
				</div>
				<div class="flex-none w-2/3 md:w-1/3 mr-8 md:pb-4 border rounded-lg">
					<a href="#" class="space-y-4">
						<div class="aspect-w-16 aspect-h-9">
							<img
								class="object-cover shadow-md hover:shadow-xl rounded-lg"
								src="https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-1.2.1&ixqx=3H1AJd0Pae&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80"
								alt=""
							/>
						</div>
						<div class="px-4 py-2">
							<div class="text-lg leading-6 font-medium space-y-1">
								<h3 class="font-bold text-gray-800 text-3xl mb-2">Some title goes here</h3>
							</div>
							<div class="text-lg">
								<p class="">
									Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad recusandae,
									consequatur corrupti vel quisquam id itaque nam
								</p>
								<p class="font-medium text-sm text-indigo-600 mt-2">
									Read more<span class="text-indigo-600">&hellip;</span>
								</p>
							</div>
						</div>
					</a>
				</div>
				<div class="flex-none w-2/3 md:w-1/3 mr-8 md:pb-4 border rounded-lg">
					<a href="#" class="space-y-4">
						<div class="aspect-w-16 aspect-h-9">
							<img
								class="object-cover shadow-md hover:shadow-xl rounded-lg"
								src="https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-1.2.1&ixqx=3H1AJd0Pae&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80"
								alt=""
							/>
						</div>
						<div class="px-4 py-2">
							<div class="text-lg leading-6 font-medium space-y-1">
								<h3 class="font-bold text-gray-800 text-3xl mb-2">Some title goes here</h3>
							</div>
							<div class="text-lg">
								<p class="">
									Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad recusandae,
									consequatur corrupti vel quisquam id itaque nam
								</p>
								<p class="font-medium text-sm text-indigo-600 mt-2">
									Read more<span class="text-indigo-600">&hellip;</span>
								</p>
							</div>
						</div>
					</a>
				</div>
				<div class="flex-none w-2/3 md:w-1/3 mr-8 md:pb-4 border rounded-lg">
					<a href="#" class="space-y-4">
						<div class="aspect-w-16 aspect-h-9">
							<img
								class="object-cover shadow-md hover:shadow-xl rounded-lg"
								src="https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-1.2.1&ixqx=3H1AJd0Pae&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80"
								alt=""
							/>
						</div>
						<div class="px-4 py-2">
							<div class="text-lg leading-6 font-medium space-y-1">
								<h3 class="font-bold text-gray-800 text-3xl mb-2">Some title goes here</h3>
							</div>
							<div class="text-lg">
								<p class="">
									Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad recusandae,
									consequatur corrupti vel quisquam id itaque nam
								</p>
								<p class="font-medium text-sm text-indigo-600 mt-2">
									Read more<span class="text-indigo-600">&hellip;</span>
								</p>
							</div>
						</div>
					</a>
				</div>
				<div class="flex-none w-2/3 md:w-1/3 mr-8 md:pb-4 border rounded-lg">
					<a href="#" class="space-y-4">
						<div class="aspect-w-16 aspect-h-9">
							<img
								class="object-cover shadow-md hover:shadow-xl rounded-lg"
								src="https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-1.2.1&ixqx=3H1AJd0Pae&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80"
								alt=""
							/>
						</div>
						<div class="px-4 py-2">
							<div class="text-lg leading-6 font-medium space-y-1">
								<h3 class="font-bold text-gray-800 text-3xl mb-2">Some title goes here</h3>
							</div>
							<div class="text-lg">
								<p class="">
									Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad recusandae,
									consequatur corrupti vel quisquam id itaque nam
								</p>
								<p class="font-medium text-sm text-indigo-600 mt-2">
									Read more<span class="text-indigo-600">&hellip;</span>
								</p>
							</div>
						</div>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

<div>
	<div class="grid grid-cols-1 lg:grid-cols-2">
		<SocialGrid />
		<div class="p-8 bg-gray-100 flex">
			<div class="m-auto">
				<h1 class="text-3xl font-display font-bold mb-8 text-center">Let's get in touch!</h1>
				<div
					class="bg-slate-400 p-4 drop-shadow-lg hover:drop-shadow-2xl transition max-w-6xl text-white md:mx-8"
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
