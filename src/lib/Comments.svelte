<script>
	import { enhance } from '$app/forms';
	import { fullDate } from '#lib/date.js';

	// the three line colours, handed out by name so a commenter keeps theirs
	const lines = ['work', 'writing', 'contact'];
	const lineOf = (/** @type {string} */ name) =>
		lines[[...(name ?? '')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 3];
	const initial = (/** @type {string} */ name) =>
		([...(name ?? '').trim()][0] ?? '?').toUpperCase();

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
		{@const replies = threads.get(c.id)}
		<li id="comment-{c.id}" class="comment" class:has-replies={replies}>
			<span class="avatar" style="--line: var(--line-{lineOf(c.author_name)})" aria-hidden="true">
				{initial(c.author_name)}
			</span>
			<article class="min-w-0 pb-5">
				<header class="flex flex-wrap items-baseline gap-x-3">
					<strong class="font-display text-xl font-bold text-gray-900 dark:text-white"
						>{c.author_name}</strong
					>
					<time class="t-meta" datetime={c.date_created}>{fullDate(c.date_created)}</time>
				</header>
				<p class="mt-2 text-lg leading-relaxed whitespace-pre-line">{c.content}</p>
				<button type="button" class="btn btn-ghost btn-sm mt-2 -ml-3" onclick={() => reply(c)}>
					<i class="fa-solid fa-reply" aria-hidden="true"></i>
					Reply<span class="sr-only"> to {c.author_name}</span>
				</button>
			</article>
			{#if replies}
				<ol class="replies list-none">
					{@render thread(c.id)}
				</ol>
			{/if}
		</li>
	{/each}
{/snippet}

{#if comments === null}
	<div role="status" class="alert alert-soft"><span>Comments aren’t loading right now.</span></div>
{:else if comments.length}
	<ol class="list-none">
		{@render thread(null)}
	</ol>
{:else}
	<div class="flex items-center gap-5">
		<span class="avatar empty" aria-hidden="true"><i class="fa-regular fa-comments"></i></span>
		<p class="text-xl">No comments yet. Be the first to say something.</p>
	</div>
{/if}

<!-- the form is a ticket: the message above the perforation, who it is from below it -->
<form
	bind:this={form}
	method="POST"
	action="?/comment"
	use:enhance={submit}
	class="ticket relative mt-12 max-w-3xl rounded-2xl border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
>
	<div class="p-6 sm:p-8">
		<h3 class="t-group mb-5">
			{replyTo ? `Reply to ${replyTo.author_name}` : 'Leave a comment'}
		</h3>

		{#if replyTo}
			<div role="status" class="alert alert-soft mb-5">
				<span>Your reply goes under {replyTo.author_name}’s comment.</span>
				<button type="button" class="btn btn-sm" onclick={() => (replyTo = null)}>
					Reply to the post instead
				</button>
			</div>
			<input type="hidden" name="parent" value={replyTo.id} />
		{/if}

		{#if sent}
			<div role="status" class="alert alert-success alert-soft mb-5">
				<span>Thanks! Your comment will appear once it has been approved.</span>
			</div>
		{/if}

		<fieldset class="fieldset">
			<label class="label" for="comment-content">Your comment</label>
			<textarea
				bind:this={box}
				id="comment-content"
				name="content"
				required
				rows="5"
				maxlength="5000"
				class="textarea validator h-36 w-full text-base"></textarea>
			<p class="validator-hint hidden">Write something first.</p>
		</fieldset>
	</div>

	<div
		class="relative border-t-2 border-dashed border-gray-300 dark:border-gray-700"
		aria-hidden="true"
	>
		<span class="notch -left-3 border-r-2"></span>
		<span class="notch -right-3 border-l-2"></span>
	</div>

	<div class="p-6 sm:p-8">
		<div class="grid gap-x-4 gap-y-5 sm:grid-cols-2">
			<fieldset class="fieldset">
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
			</fieldset>
			<fieldset class="fieldset">
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
			</fieldset>
		</div>

		<!-- a trap for bots: people never see it -->
		<div class="absolute -left-[9999px]" aria-hidden="true">
			<label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
		</div>

		{#if siteKey}
			<div class="cf-turnstile mt-5" data-sitekey={siteKey}></div>
		{/if}

		{#if failed}
			<div role="alert" class="alert alert-error alert-soft mt-5"><span>{failed}</span></div>
		{/if}
		<button class="btn btn-primary btn-lg mt-6" disabled={sending}>
			{#if sending}<span class="loading loading-spinner loading-sm"></span>{/if}
			{sending ? 'Sending…' : replyTo ? 'Post reply' : 'Post comment'}
			{#if !sending}<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>{/if}
		</button>
	</div>
</form>

<style>
	/* a comment is a stop: its ring on the left, and a branch line running down to its replies */
	.comment {
		--av: 2.25rem;
		--gap: 0.75rem;
		display: grid;
		grid-template-columns: var(--av) minmax(0, 1fr);
		column-gap: var(--gap);
		position: relative;
	}

	@media (min-width: 40rem) {
		.comment {
			--av: 3rem;
			--gap: 1.25rem;
		}
	}

	.avatar {
		display: grid;
		place-items: center;
		z-index: 1;
		width: var(--av, 3rem);
		height: var(--av, 3rem);
		border-radius: 999px;
		border: 0.25rem solid var(--line, var(--line-writing));
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1rem;
		background: var(--color-base-100);
	}

	.avatar.empty {
		flex: none;
		border-color: var(--color-gray-400);
		color: var(--color-gray-700);
		font-weight: 400;
	}

	:global(.dark) .avatar.empty {
		border-color: var(--color-gray-600);
		color: var(--color-gray-300);
	}

	.comment.has-replies::before {
		content: '';
		position: absolute;
		left: calc(var(--av) / 2 - 0.15625rem);
		top: calc(var(--av) * 0.75);
		bottom: 0;
		width: 0.3125rem;
		border-radius: 999px;
		background: var(--color-gray-300);
	}

	:global(.dark) .comment.has-replies::before {
		background: var(--color-gray-700);
	}

	.replies {
		grid-column: 2;
		margin-top: 0.25rem;
	}

	/* the perforation: a notch bitten out of each edge */
	.notch {
		position: absolute;
		top: -0.75rem;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 999px;
		background: var(--color-gray-50);
		border-color: var(--color-gray-300);
	}

	:global(.dark) .notch {
		background: var(--color-gray-950);
		border-color: var(--color-gray-700);
	}
</style>
