<script>
import { intros } from "svelte/internal";


	export let limit;
</script>

<div class="grid grid-cols-3 gap-8">
	{#each Array(parseInt(limit)) as item}
		<div
			class="transition-all flex-none drop-shadow rounded-lg bg-white hover:bg-gray-100 text-black dark:text-white dark:bg-slate-900 dark:hover:bg-slate-800"
		>
			<a href="#">
				<div class="flex flex-col">
					<img
						class="object-cover rounded-t-lg max-h-1/2 dark:brightness-75"
						src="https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-1.2.1&ixqx=3H1AJd0Pae&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80"
						alt=""
					/>
					<div class="p-4">
						<div class="text-lg md:text-xl lg:text-2xl mb-2 font-bold font-display capitalize ">
							<p>Some title goes here</p>
						</div>
						<div class="text-lg">
							<p>
								Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad recusandae, consequatur
								corrupti vel quisquam id itaque nam
							</p>
						</div>
					</div>
				</div>
			</a>
		</div>
	{/each}
</div>
