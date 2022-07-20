<script>
	export async function load({ fetch }) {}
</script>

<div class="grid grid-cols-1 grid-rows-4 sm:grid-rows-2 sm:grid-cols-2 gap-8">
	{#each Array(4) as it}
		<a href="#">
			<div class="flex justify-center">
				<div
					class="flex flex-col md:flex-row justify-between transition-all bg-gray-200 rounded-lg border shadow-md md:max-h-48 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
				>
					<img
						class="w-full h-96 md:h-auto object-cover md:w-48 rounded-t-lg md:rounded-none md:rounded-l-lg dark:brightness-75"
						src="https://images.unsplash.com/photo-1656078249583-c73346944f44?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
						alt=""
					/>
					<div class="p-4 flex flex-col justify-start">
						<p class="mb-2 text-2xl font-bold font-display text-gray-900 dark:text-white capitalize">
							Title goes here <i class="fa-solid fa-arrow-right" />
						</p>
						<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
							Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse
							chronological order.
						</p>
					</div>
				</div>
			</div>
		</a>
	{/each}
</div>

<div class="text-center mt-6 text-lg text-blue-500 hover:text-blue-300">
	<a href="https://blog.unixfy.net" target="_blank" rel="noopener"
		>View more <i class="fa-solid fa-arrow-right" /></a
	>
</div>
