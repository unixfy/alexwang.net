<script>
	import { page } from '$app/state';

	const missing = $derived(page.status === 404);
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-white flex text-center">
	<div class="m-auto space-y-4 p-8">
		<h1 class="t-page">
			{missing ? 'This stop isn’t on the line.' : 'Service interrupted.'}
		</h1>
		<p class="text-xl">
			{missing
				? 'That page doesn’t exist. The link may be old or mistyped.'
				: 'Something went wrong on my end. Try refreshing in a moment.'}
		</p>
		<p class="mt-8 text-lg space-x-6">
			<a href="/">Back to the start</a>
			<a href="/projects">Projects</a>
		</p>
	</div>
</div>
