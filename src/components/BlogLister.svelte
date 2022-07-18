<script>
    export async function load({fetch}) {

    }
</script>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
	{#each Array(4) as it}
		<a
			href="#"
			class="flex flex-col items-center bg-white rounded-lg border shadow-md md:flex-row md:max-h-48 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 w-full"
		>
			<img
				class="w-full rounded-t-lg md:w-1/3 object-cover md:rounded-none md:max-h-48 md:rounded-l-lg"
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
	{/each}
</div>

<div class="text-center mt-6 text-lg text-blue-500 hover:text-blue-300">
    <a href="https://blog.unixfy.net" target="_blank" rel="noopener">View more <i class="fa-solid fa-arrow-right"></i></a>
</div>
