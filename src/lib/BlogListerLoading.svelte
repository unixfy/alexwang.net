<div class="max-w-4xl divide-y divide-base-300" aria-hidden="true">
	{#each Array(4) as _}
		<div class="flex gap-6 py-5">
			<div
				class="skeleton hidden aspect-video w-36 rounded motion-reduce:animate-none sm:block"
			></div>
			<div class="flex-1 space-y-3">
				<div class="skeleton h-6 w-2/3 motion-reduce:animate-none"></div>
				<div class="skeleton h-4 w-full motion-reduce:animate-none"></div>
			</div>
		</div>
	{/each}
</div>
