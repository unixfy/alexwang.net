<script>
	import { page } from '$app/state';

	const missing = $derived(page.status === 404);
	const bar = 'h-1.5 rounded-full bg-brand-600 dark:bg-brand-300';
</script>

<div class="flex min-h-screen bg-gray-50 text-center dark:bg-gray-950 dark:text-white">
	<div class="m-auto space-y-4 p-8">
		<!-- the line, and where it should have gone -->
		<div class="mb-8 flex items-center justify-center" aria-hidden="true">
			<span class="{bar} w-24"></span>
			<span class="w-10 border-t-[6px] border-dashed border-gray-400 dark:border-gray-600"></span>
			{#if missing}
				<span
					class="size-6 rounded-full border-[5px] border-dashed border-brand-600 dark:border-brand-300"
				></span>
			{:else}
				<span class="{bar} w-24"></span>
			{/if}
		</div>
		<h1 class="t-page">
			{missing ? 'This stop isn’t on the line.' : 'Service interrupted.'}
		</h1>
		<p class="text-xl">
			{missing
				? 'That page doesn’t exist. The link may be old or mistyped.'
				: 'Something went wrong on my end. Try refreshing in a moment.'}
		</p>
		<p class="mt-8 flex flex-wrap justify-center gap-3">
			<a href="/" class="btn btn-primary no-underline">Back to the start</a>
			<a href="/projects" class="btn btn-ghost no-underline">Projects</a>
		</p>
	</div>
</div>
