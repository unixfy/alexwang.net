<script>
	import { enhance } from '$app/forms';
	import { fullDate } from '#lib/date.js';

	/** @type {{ comments: any[] | null, siteKey?: string }} */
	let { comments, siteKey = '' } = $props();

	/** @type {{ id: string, author_name: string } | null} */
	let replyTo = $state(null);
	let sending = $state(false);
	let sent = $state(false);
	let failed = $state('');
	/** @type {HTMLTextAreaElement | undefined} */
	let box = $state();
	/** @type {HTMLFormElement | undefined} */
	let form = $state();

	// replies sit under the comment they answer; a reply to a comment that is not visible stands alone
	const threads = $derived.by(() => {
		const all = comments ?? [];
		const ids = new Set(all.map((c) => c.id));
		/** @type {Map<string | null, any[]>} */
		const kids = new Map();
		for (const c of all) {
			const key = c.parent && ids.has(c.parent) ? c.parent : null;
			kids.set(key, [...(kids.get(key) ?? []), c]);
		}
		return kids;
	});

	// Cloudflare's widget adds the token to the form as `cf-turnstile-response`
	/** @type {any} */
	const w = typeof window === 'undefined' ? null : window;
	$effect(() => {
		if (!siteKey || document.querySelector('script[data-turnstile]')) return;
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		script.async = true;
		script.dataset.turnstile = '';
		document.head.append(script);
	});

	/** @type {import('$app/forms').SubmitFunction} */
	const submit = () => {
		sending = true;
		failed = '';
		return async ({ result }) => {
			sending = false;
			if (result.type === 'success') {
				sent = true;
				replyTo = null;
				form?.reset();
			} else if (result.type === 'failure') {
				failed = String(result.data?.error ?? 'That didn’t go through.');
			} else {
				failed = 'That didn’t go through. Please try again in a moment.';
			}
			w?.turnstile?.reset();
		};
	};

	function reply(/** @type {any} */ c) {
		replyTo = { id: c.id, author_name: c.author_name };
		sent = false;
		box?.focus();
		box?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}
</script>

{#snippet thread(/** @type {string | null} */ parent)}
	{#each threads.get(parent) ?? [] as c (c.id)}
		<li id="comment-{c.id}" class="py-4">
			<article>
				<header class="t-meta flex flex-wrap items-baseline gap-x-3">
					<strong class="text-base text-gray-900 dark:text-white">{c.author_name}</strong>
					<time datetime={c.date_created}>{fullDate(c.date_created)}</time>
				</header>
				<p class="mt-1 whitespace-pre-line">{c.content}</p>
				<button type="button" class="btn btn-link btn-sm px-0" onclick={() => reply(c)}>
					Reply<span class="sr-only"> to {c.author_name}</span>
				</button>
			</article>
			{#if threads.get(c.id)}
				<ol class="mt-1 list-none border-l-4 border-gray-300 pl-4 sm:pl-6 dark:border-gray-700">
					{@render thread(c.id)}
				</ol>
			{/if}
		</li>
	{/each}
{/snippet}

{#if comments === null}
	<div role="status" class="alert alert-soft"><span>Comments aren’t loading right now.</span></div>
{:else if comments.length}
	<ol class="list-none divide-y divide-gray-300 dark:divide-gray-700">
		{@render thread(null)}
	</ol>
{:else}
	<p class="text-lg">No comments yet. Be the first.</p>
{/if}

<form
	bind:this={form}
	method="POST"
	action="?/comment"
	use:enhance={submit}
	class="mt-10 max-w-3xl"
>
	<fieldset class="fieldset w-full rounded-box border border-base-300 bg-base-200 p-5 sm:p-6">
		<legend class="fieldset-legend t-group">{replyTo ? 'Reply' : 'Leave a comment'}</legend>

		{#if replyTo}
			<div role="status" class="alert alert-soft">
				<span>Replying to {replyTo.author_name}</span>
				<button type="button" class="btn btn-sm" onclick={() => (replyTo = null)}>Cancel</button>
			</div>
			<input type="hidden" name="parent" value={replyTo.id} />
		{/if}

		{#if sent}
			<div role="status" class="alert alert-success alert-soft">
				<span>Thanks! Your comment will appear once it has been approved.</span>
			</div>
		{/if}

		<label class="label" for="comment-content">Comment</label>
		<textarea
			bind:this={box}
			id="comment-content"
			name="content"
			required
			rows="5"
			maxlength="5000"
			class="textarea validator h-36 w-full"></textarea>
		<p class="validator-hint hidden">Write something first.</p>

		<div class="grid gap-x-4 sm:grid-cols-2">
			<div>
				<label class="label" for="comment-name">Name</label>
				<input
					id="comment-name"
					name="name"
					required
					maxlength="100"
					autocomplete="name"
					class="input validator w-full"
				/>
				<p class="validator-hint hidden">Please tell us your name.</p>
			</div>
			<div>
				<label class="label" for="comment-email">Email</label>
				<input
					id="comment-email"
					name="email"
					required
					type="email"
					maxlength="200"
					autocomplete="email"
					class="input validator w-full"
				/>
				<p class="validator-hint hidden">Enter a valid email address.</p>
				<p class="label">Never shown publicly.</p>
			</div>
		</div>

		<!-- a trap for bots: people never see it -->
		<div class="absolute -left-[9999px]" aria-hidden="true">
			<label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
		</div>

		{#if siteKey}
			<div class="cf-turnstile mt-4" data-sitekey={siteKey}></div>
		{/if}

		{#if failed}
			<div role="alert" class="alert alert-error alert-soft mt-4"><span>{failed}</span></div>
		{/if}
		<button class="btn btn-primary mt-4 w-fit" disabled={sending}>
			{#if sending}<span class="loading loading-spinner loading-sm"></span>{/if}
			{sending ? 'Sending…' : replyTo ? 'Post reply' : 'Post comment'}
		</button>
	</fieldset>
</form>
