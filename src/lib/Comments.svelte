<script module>
	/** @type {Promise<any> | undefined} */
	let loading;

	// Cloudflare's script is loaded once and the widget is drawn by hand: the script only draws widgets
	// that are on the page when it arrives, so a form reached by client-side navigation would stay empty.
	const loadTurnstile = () =>
		(loading ??= new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.onload = () => resolve(/** @type {any} */ (window).turnstile);
			script.onerror = () => {
				loading = undefined;
				reject(new Error('Turnstile did not load'));
			};
			document.head.append(script);
		}));
</script>

<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fullDate } from '#lib/date.js';

	// the three line colours take turns down a thread, as they do down the page
	const lines = ['writing', 'contact', 'work'];

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

	// the form as the server last answered it: without JavaScript this is the only way the visitor
	// hears back, and it keeps what they typed
	const answer = $derived(page.form);
	const kept = $derived(answer?.values ?? {});

	/** @type {HTMLElement | undefined} */
	let holder = $state();
	/** @type {string | undefined} */
	let widget;
	// the spam check has not produced a token: still running, or blocked from loading
	let checking = $state(false);
	let blocked = $state(false);

	$effect(() => {
		if (!siteKey || !holder) return;
		const el = holder;
		let gone = false;
		checking = true;
		loadTurnstile()
			.then((turnstile) => {
				if (gone) return;
				widget = turnstile.render(el, {
					sitekey: siteKey,
					callback: () => (checking = false),
					'expired-callback': () => (checking = true),
					'error-callback': () => {
						checking = false;
						blocked = true;
					}
				});
			})
			.catch(() => {
				checking = false;
				blocked = true;
			});
		return () => {
			gone = true;
			if (widget !== undefined) /** @type {any} */ (window).turnstile?.remove(widget);
			widget = undefined;
		};
	});

	// A half-written comment survives a refresh, and who you are is remembered for the next one
	const draftKey = $derived(`comment-draft:${page.params.slug}`);
	onMount(() => {
		try {
			const me = JSON.parse(localStorage.getItem('commenter') ?? '{}');
			const fill = (/** @type {string} */ id, /** @type {string | undefined} */ v) => {
				const el = /** @type {HTMLInputElement | null} */ (document.getElementById(id));
				if (el && !el.value && v) el.value = v;
			};
			fill('comment-name', me.name);
			fill('comment-email', me.email);
			fill('comment-content', localStorage.getItem(draftKey) ?? '');
		} catch {
			// storage unavailable: nothing to restore
		}
	});

	function remember() {
		try {
			const value = (/** @type {string} */ id) =>
				/** @type {HTMLInputElement | null} */ (document.getElementById(id))?.value ?? '';
			localStorage.setItem(
				'commenter',
				JSON.stringify({ name: value('comment-name'), email: value('comment-email') })
			);
			const text = value('comment-content');
			if (text) localStorage.setItem(draftKey, text);
			else localStorage.removeItem(draftKey);
		} catch {
			// storage unavailable: the draft just isn't kept
		}
	}

	/** @type {import('$app/forms').SubmitFunction} */
	const submit = ({ formData, cancel }) => {
		failed = '';
		if (siteKey && !formData.get('cf-turnstile-response')) {
			failed = blocked
				? 'The spam check couldn’t load. Turn off any content blocker for this page and reload it.'
				: 'The spam check is still running. Give it a moment, then post again.';
			cancel();
			return;
		}
		sending = true;
		return async ({ result }) => {
			sending = false;
			if (result.type === 'success') {
				sent = true;
				replyTo = null;
				form?.reset();
				try {
					localStorage.removeItem(draftKey);
				} catch {
					// storage unavailable
				}
			} else if (result.type === 'failure') {
				failed = String(result.data?.error ?? 'That didn’t go through.');
			} else {
				failed = 'That didn’t go through. Please try again in a moment.';
			}
			// a token works once, so the next post needs a fresh one
			if (siteKey) {
				checking = true;
				/** @type {any} */ (window).turnstile?.reset(widget);
			}
		};
	};

	function reply(/** @type {any} */ c) {
		replyTo = { id: c.id, author_name: c.author_name };
		sent = false;
		box?.focus();
		box?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}
</script>

{#snippet thread(/** @type {string | null} */ parent, /** @type {number} */ depth)}
	{#each threads.get(parent) ?? [] as c (c.id)}
		{@const replies = threads.get(c.id)}
		<li
			id="comment-{c.id}"
			class="comment"
			class:has-replies={replies}
			style="--line: var(--line-{lines[depth % 3]})"
		>
			<span class="stop" aria-hidden="true"></span>
			<article class="min-w-0 pb-5">
				<header class="flex flex-wrap items-baseline gap-x-3">
					<strong
						class="min-w-0 break-words font-display text-xl font-bold text-gray-900 dark:text-white"
						>{c.author_name}</strong
					>
					<time class="t-meta" datetime={c.date_created}>{fullDate(c.date_created)}</time>
				</header>
				<p class="mt-2 break-words text-lg leading-relaxed whitespace-pre-line">{c.content}</p>
				<button type="button" class="btn btn-ghost btn-sm mt-2 -ml-3" onclick={() => reply(c)}>
					<i class="fa-solid fa-reply" aria-hidden="true"></i>
					Reply<span class="sr-only"> to {c.author_name}</span>
				</button>
			</article>
			{#if replies}
				<ol class="replies list-none">
					{@render thread(c.id, depth + 1)}
				</ol>
			{/if}
		</li>
	{/each}
{/snippet}

{#if comments === null}
	<div role="status" class="alert alert-soft"><span>Comments aren’t loading right now.</span></div>
{:else if comments.length}
	<ol class="list-none">
		{@render thread(null, 0)}
	</ol>
{:else}
	<p class="text-xl">No comments yet. Be the first to say something.</p>
{/if}

{#if !siteKey}
	<div role="status" class="alert alert-soft mt-12 max-w-3xl">
		<span>Comments are switched off for now. Please check back later.</span>
	</div>
{:else}
	<!-- the form is a ticket: the message above the perforation, who it is from below it -->
	<form
		bind:this={form}
		method="POST"
		action="?/comment"
		use:enhance={submit}
		oninput={remember}
		class="ticket relative mt-12 max-w-3xl rounded-2xl border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
	>
		<div class="p-6 sm:p-8">
			<h3 class="t-group mb-5 w-full">{replyTo ? 'Write a reply' : 'Leave a comment'}</h3>

			{#if replyTo}
				<div
					role="status"
					class="alert alert-soft mb-5 flex w-full flex-wrap items-center gap-x-4 gap-y-3"
				>
					<span class="min-w-0 flex-1 basis-60 break-words">
						Replying to <strong>{replyTo.author_name}</strong>
					</span>
					<button type="button" class="btn btn-sm shrink-0" onclick={() => (replyTo = null)}>
						Reply to the post instead
					</button>
				</div>
				<input type="hidden" name="parent" value={replyTo.id} />
			{/if}

			{#if sent || answer?.sent}
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
					value={kept.content ?? ''}
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
						value={kept.author_name ?? ''}
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
						value={kept.author_email ?? ''}
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
				<div bind:this={holder} class="mt-5"></div>
			{/if}

			{#if failed || answer?.error}
				<div role="alert" class="alert alert-error alert-soft mt-5">
					<span>{failed || answer?.error}</span>
				</div>
			{/if}
			<button class="btn btn-primary btn-lg mt-6" disabled={sending}>
				{#if sending}<span class="loading loading-spinner loading-sm"></span>{/if}
				{sending ? 'Sending…' : replyTo ? 'Post reply' : 'Post comment'}
				{#if !sending}<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>{/if}
			</button>
		</div>
	</form>
{/if}

<style>
	/* a comment is a stop: a station ring on the left, and a branch line running down to its replies */
	.comment {
		--ring: 1.25rem;
		--gap: 0.75rem;
		display: grid;
		grid-template-columns: var(--ring) minmax(0, 1fr);
		column-gap: var(--gap);
		position: relative;
	}

	@media (min-width: 40rem) {
		.comment {
			--ring: 1.5rem;
			--gap: 1.25rem;
		}
	}

	.stop {
		z-index: 1;
		width: var(--ring);
		height: var(--ring);
		margin-top: 0.2rem;
		border-radius: 999px;
		border: 0.3125rem solid var(--line, var(--line-writing));
		background: var(--color-base-100);
	}

	.comment.has-replies::before {
		content: '';
		position: absolute;
		left: calc(var(--ring) / 2 - 0.15625rem);
		top: 1.5rem;
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
