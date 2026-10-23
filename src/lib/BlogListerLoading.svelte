<div class="max-w-4xl divide-y divide-gray-300 dark:divide-gray-700" aria-hidden="true">
	{#each Array(4) as _}
		<div class="flex gap-6 py-5 animate-pulse motion-reduce:animate-none">
			<div class="hidden sm:block w-36 aspect-video rounded bg-gray-300 dark:bg-gray-700"></div>
			<div class="flex-1 space-y-3">
				<div class="h-6 w-2/3 rounded bg-gray-300 dark:bg-gray-700"></div>
				<div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-800"></div>
			</div>
		</div>
	{/each}
</div>
