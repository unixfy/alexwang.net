<script>
	import { page } from '$app/state';
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-white flex text-center">
	<div class="m-auto space-y-4 p-8">
		<h1 class="t-page">
			{page.status === 404 ? 'That page doesn’t exist.' : 'Something went wrong on my end.'}
		</h1>
		<p class="text-xl">
			{page.status === 404 ? 'The link may be old or mistyped.' : 'Try refreshing in a moment.'}
		</p>
		<p class="mt-8 text-lg space-x-6">
			<a href="/">Home</a>
			<a href="/projects">Projects</a>
		</p>
	</div>
</div>
