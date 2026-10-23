<script>
	/** @type {{ text: string, what?: string, label?: string, class?: string }} */
	let { text, what = 'text', label = 'Copy', class: cls = '' } = $props();

	let copied = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {
			// clipboard unavailable (insecure context or denied); the text itself is still selectable
		}
	}
</script>

<button
	type="button"
	onclick={copy}
	class="min-h-8 rounded border border-gray-400 px-2 py-0.5 text-sm hover:bg-gray-200 dark:border-gray-500 dark:hover:bg-gray-800 {cls}"
>
	{copied ? 'Copied' : label}<span class="sr-only">{` ${what}`}</span>
</button>
<span class="sr-only" role="status">{copied ? `${what} copied` : ''}</span>
