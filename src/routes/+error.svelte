<script>
	import { page } from '$app/stores';
</script>

<!--We do this hackiness because there's no endpoints for error routes-->
<svelte:head>
	<title>Error | Alex Wang</title>
</svelte:head>

<div class="min-h-screen dark:bg-black dark:text-white flex text-center">
	<div class="m-auto space-y-4">
		<h1 class="text-2xl sm:text-3xl font-display font-bold">Oops! An error occurred.</h1>
		<div class="text-xl sm:text-2xl">
			{$page.status} - {$page.error.message}
		</div>
		<p class="mt-8">You can try refreshing the page or going back home.</p>
	</div>
</div>
