<script>
	import CopyButton from '#lib/CopyButton.svelte';

	let { data } = $props();

	const notch =
		'absolute -top-3 size-6 rounded-full bg-gray-50 dark:bg-gray-950 border-gray-300 dark:border-gray-700';
</script>

<div class="flex min-h-screen px-6 py-24">
	<div
		class="relative m-auto w-full max-w-3xl rounded-2xl border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
	>
		<div class="p-8 md:p-12">
			<h1 class="t-group text-brand-600 dark:text-brand-300">SSH key</h1>
			{#if data.config.sshkey}
				<p
					class="mt-4 select-all break-all font-mono text-xl font-bold leading-relaxed md:text-2xl"
				>
					{data.config.sshkey}
				</p>
			{:else}
				<p class="mt-4 text-lg">The key isn’t available right now. Try again in a moment.</p>
			{/if}
		</div>
		{#if data.config.sshkey}
			<div
				class="relative flex items-center justify-between gap-4 border-t-2 border-dashed border-gray-300 px-8 py-5 dark:border-gray-700 md:px-12"
			>
				<span class="{notch} -left-3 border-r-2" aria-hidden="true"></span>
				<span class="{notch} -right-3 border-l-2" aria-hidden="true"></span>
				<p class="t-meta">Click the key to select all of it.</p>
				<CopyButton text={data.config.sshkey} what="SSH key" />
			</div>
		{/if}
	</div>
</div>
