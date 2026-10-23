<script>
	let { data } = $props();
</script>

<div class="p-8 min-h-screen flex bg-gray-100 dark:bg-gray-950 dark:text-white">
	<div class="m-auto max-w-4xl container text-center">
		<p
			class="select-all text-3xl md:text-5xl font-mono font-bold tracking-wide leading-relaxed break-words"
		>
			{data.config.sshkey}
		</p>
		<p class="t-meta mt-6">Click the key to select all of it.</p>
	</div>
</div>
