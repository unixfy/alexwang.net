<script>
	export let data;
</script>

<div class="p-8 min-h-screen flex bg-gray-100">
	<div
		class="m-auto max-w-4xl container text-center text-3xl md:text-5xl font-mono font-bold tracking-wide leading-relaxed break-words"
	>
		{data.config.sshkey}
	</div>
</div>
