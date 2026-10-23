<script>
	import { fade } from 'svelte/transition';

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
	class="btn btn-outline btn-sm {copied ? 'btn-success' : ''} {cls}"
>
	{copied ? 'Copied' : label}<span class="sr-only">{` ${what}`}</span>
</button>
{#if copied}
	<div
		class="toast toast-end toast-bottom z-50"
		aria-hidden="true"
		transition:fade={{ duration: 150 }}
	>
		<div class="alert alert-success"><span>{what} copied</span></div>
	</div>
{/if}
<span class="sr-only" role="status">{copied ? `${what} copied` : ''}</span>
