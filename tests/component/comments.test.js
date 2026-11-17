import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import Comments from '#lib/Comments.svelte';
import { enhanced, page } from '../helpers/app.svelte.js';

const comments = [
	{
		id: 1,
		parent: null,
		author_name: 'Ada',
		content: 'Great post',
		date_created: '2025-12-29T00:00:00'
	},
	{
		id: 2,
		parent: 1,
		author_name: 'Grace',
		content: 'Agreed',
		date_created: '2025-12-30T00:00:00'
	},
	{
		id: 3,
		parent: 99,
		author_name: 'Linus',
		content: 'Orphan',
		date_created: '2025-12-31T00:00:00'
	}
];

/** The Turnstile script tag the component adds, and a fake `turnstile` for its onload. */
function turnstileScript() {
	return /** @type {HTMLScriptElement | null} */ (
		document.head.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/"]')
	);
}

function fakeTurnstile() {
	/** @type {any} */
	const t = {
		/** @type {any} */
		options: null,
		render: vi.fn(
			(/** @type {any} */ _el, /** @type {any} */ options) => ((t.options = options), 'widget-1')
		),
		reset: vi.fn(),
		remove: vi.fn()
	};
	return t;
}

// The script loads once per page, like the real one, so every test shares one widget API.
const t = fakeTurnstile();
beforeEach(() => {
	t.render.mockClear();
	t.reset.mockClear();
	t.remove.mockClear();
	/** @type {any} */ (window).turnstile = t;
});

/** Submit through the enhance stand-in. */
function submit(/** @type {Record<string, string>} */ fields = {}) {
	const { submit: fn } = /** @type {any} */ (enhanced.at(-1));
	const formData = new FormData();
	for (const [k, v] of Object.entries(fields)) formData.set(k, v);
	const cancel = vi.fn();
	const after = fn({ formData, cancel });
	return { cancel, after };
}

describe('the thread', () => {
	test('comments that failed to load', () => {
		render(Comments, { comments: null });
		expect(screen.getByText('Comments aren’t loading right now.')).toBeInTheDocument();
		expect(screen.getByText(/Comments are switched off/)).toBeInTheDocument();
		expect(screen.queryByRole('textbox')).toBeNull();
	});

	test('no comments yet', () => {
		render(Comments, { comments: [] });
		expect(screen.getByText('No comments yet. Be the first to say something.')).toBeInTheDocument();
	});

	test('replies sit under their comment; replies to hidden comments stand alone', () => {
		const { container } = render(Comments, { comments });
		const ada = /** @type {HTMLElement} */ (container.querySelector('#comment-1'));
		expect(ada).toHaveClass('has-replies');
		expect(ada.querySelector('#comment-2')).not.toBeNull();
		expect(ada).toHaveAttribute('style', expect.stringContaining('--line-writing'));
		expect(container.querySelector('#comment-2')).toHaveAttribute(
			'style',
			expect.stringContaining('--line-contact')
		);
		expect(container.querySelector('#comment-3')?.parentElement).toBe(ada.parentElement);
		expect(ada).toHaveTextContent('December 29, 2025');
	});
});

describe('the form', () => {
	test('a Turnstile that fails to load says so, and loads again next time', async () => {
		const { unmount } = render(Comments, { comments: [], siteKey: 'key' });
		const script = /** @type {HTMLScriptElement} */ (turnstileScript());
		expect(script.src).toBe(
			'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
		);
		script.onerror?.(new Event('error'));
		await tick();
		await tick();
		const { cancel } = submit({ name: 'x' });
		await tick();
		expect(cancel).toHaveBeenCalled();
		expect(screen.getByRole('alert')).toHaveTextContent(/Turn off any content blocker/);
		unmount();
		script.remove();
	});

	test('the widget is drawn, tracks its state, and is removed on the way out', async () => {
		const { unmount } = render(Comments, { comments, siteKey: 'key' });
		const script = /** @type {HTMLScriptElement} */ (turnstileScript());
		script.onload?.(new Event('load'));
		await vi.waitFor(() => expect(t.render).toHaveBeenCalled());
		expect(t.options.sitekey).toBe('key');

		// still checking: posting waits
		const first = submit({ name: 'x' });
		await tick();
		expect(first.cancel).toHaveBeenCalled();
		expect(screen.getByRole('alert')).toHaveTextContent('The spam check is still running.');

		t.options.callback();
		t.options['expired-callback']();
		t.options['error-callback']();
		await tick();
		unmount();
		expect(t.remove).toHaveBeenCalledWith('widget-1');
	});

	test('a component gone before the script arrives draws nothing', async () => {
		const { unmount } = render(Comments, { comments: [], siteKey: 'key' });
		unmount();
		await tick();
		await tick();
		expect(t.render).not.toHaveBeenCalled();
		// a second form reuses the script already loaded
		render(Comments, { comments: [], siteKey: 'key' });
		await vi.waitFor(() => expect(t.render).toHaveBeenCalledTimes(1));
		expect(document.head.querySelectorAll('script[src*="turnstile"]')).toHaveLength(1);
	});

	test('replying, and changing your mind', async () => {
		render(Comments, { comments, siteKey: 'key' });
		expect(screen.getByRole('heading', { name: 'Leave a comment' })).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: /Reply\s*to Grace/ }));
		expect(screen.getByRole('heading', { name: 'Write a reply' })).toBeInTheDocument();
		expect(screen.getByText('Grace', { selector: '[role=status] strong' })).toBeInTheDocument();
		expect(
			/** @type {HTMLInputElement} */ (document.querySelector('input[name=parent]')).value
		).toBe('2');
		expect(document.activeElement).toBe(screen.getByLabelText('Your comment'));
		expect(screen.getByRole('button', { name: 'Post reply' })).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: 'Reply to the post instead' }));
		expect(document.querySelector('input[name=parent]')).toBeNull();
	});

	test('a successful post thanks you, clears the form and the draft, and resets the check', async () => {
		localStorage.setItem('comment-draft:post-1', 'draft');
		page.params = { slug: 'post-1' };
		render(Comments, { comments, siteKey: 'key' });
		await vi.waitFor(() => expect(t.render).toHaveBeenCalled());
		await fireEvent.click(screen.getByRole('button', { name: /Reply\s*to Ada/ }));
		const box = /** @type {HTMLTextAreaElement} */ (screen.getByLabelText('Your comment'));
		box.value = 'typed';

		const { after } = submit({ 'cf-turnstile-response': 'tok' });
		await tick();
		const button = screen.getByRole('button', { name: /Sending…/ });
		expect(button).toBeDisabled();
		await after({ result: { type: 'success', data: { sent: true } } });
		await tick();
		expect(screen.getByText(/Thanks! Your comment will appear/)).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Leave a comment' })).toBeInTheDocument();
		expect(box.value).toBe('');
		expect(localStorage.getItem('comment-draft:post-1')).toBeNull();
		expect(t.reset).toHaveBeenCalledWith('widget-1');
	});

	test('a refused post shows why; other failures get a general note', async () => {
		render(Comments, { comments: [], siteKey: 'key' });
		const send = async (/** @type {any} */ result) => {
			const { after } = submit({ 'cf-turnstile-response': 'tok' });
			await after({ result });
			await tick();
			return screen.getByRole('alert').textContent?.trim();
		};
		expect(await send({ type: 'failure', data: { error: 'Too long.' } })).toBe('Too long.');
		expect(await send({ type: 'failure', data: {} })).toBe('That didn’t go through.');
		expect(await send({ type: 'failure' })).toBe('That didn’t go through.');
		expect(await send({ type: 'error' })).toBe(
			'That didn’t go through. Please try again in a moment.'
		);
	});

	test('a successful post works when storage and the widget are unavailable', async () => {
		render(Comments, { comments: [], siteKey: 'key' });
		/** @type {any} */ (window).turnstile = undefined;
		vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
			throw new Error('denied');
		});
		const { after } = submit({ 'cf-turnstile-response': 'tok' });
		await after({ result: { type: 'success' } });
		await tick();
		expect(screen.getByText(/Thanks!/)).toBeInTheDocument();
	});
});

describe('remembering', () => {
	test('your details and a half-written comment come back', async () => {
		page.params = { slug: 'p' };
		localStorage.setItem('commenter', JSON.stringify({ name: 'Ada', email: 'ada@example.com' }));
		localStorage.setItem('comment-draft:p', 'half');
		render(Comments, { comments: [], siteKey: 'key' });
		await tick();
		expect(screen.getByLabelText('Name')).toHaveValue('Ada');
		expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com');
		expect(screen.getByLabelText('Your comment')).toHaveValue('half');

		const content = screen.getByLabelText('Your comment');
		await fireEvent.input(content, { target: { value: 'more' } });
		expect(localStorage.getItem('comment-draft:p')).toBe('more');
		await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Ada L' } });
		expect(JSON.parse(/** @type {string} */ (localStorage.getItem('commenter')))).toEqual({
			name: 'Ada L',
			email: 'ada@example.com'
		});
		await fireEvent.input(content, { target: { value: '' } });
		expect(localStorage.getItem('comment-draft:p')).toBeNull();
	});

	test('fields already filled are not overwritten; nothing stored means nothing filled', async () => {
		page.form = { values: { author_name: 'Server', author_email: '', content: 'kept' } };
		localStorage.setItem('commenter', JSON.stringify({ name: 'Ada' }));
		render(Comments, { comments: [], siteKey: 'key' });
		await tick();
		expect(screen.getByLabelText('Name')).toHaveValue('Server');
		expect(screen.getByLabelText('Your comment')).toHaveValue('kept');
		expect(screen.getByLabelText('Email')).toHaveValue('');
	});

	test('without storage nothing is restored or kept', async () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('denied');
		});
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('denied');
		});
		render(Comments, { comments: [], siteKey: 'key' });
		await fireEvent.input(screen.getByLabelText('Your comment'), { target: { value: 'x' } });
		expect(screen.getByLabelText('Name')).toHaveValue('');
	});
});

describe('answers without JavaScript', () => {
	test('the server’s answer is shown, with what was typed', () => {
		page.form = {
			error: 'Please fill in your name.',
			values: { author_name: 'Ada', author_email: 'a@b.c', content: 'Hi' }
		};
		render(Comments, { comments: [], siteKey: 'key' });
		expect(screen.getByRole('alert')).toHaveTextContent('Please fill in your name.');
		expect(screen.getByLabelText('Email')).toHaveValue('a@b.c');
	});

	test('a sent comment is acknowledged', () => {
		page.form = { sent: true };
		render(Comments, { comments: [], siteKey: 'key' });
		expect(screen.getByText(/Thanks! Your comment will appear/)).toBeInTheDocument();
	});
});
