import { test, expect } from '@playwright/test';

// A stand-in for Cloudflare's widget script: it "solves" at once and adds the token to the form.
const TURNSTILE = `window.turnstile = {
	render(el, o) {
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'cf-turnstile-response';
		input.value = 'test-token';
		el.append(input);
		setTimeout(() => o.callback('test-token'));
		return 'widget';
	},
	reset() {},
	remove() {}
};`;

const PIXEL = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
	'base64'
);

/** @type {string[]} */
let errors = [];

test.beforeEach(async ({ page }) => {
	errors = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.route('https://cms.alexwang.net/assets/**', (r) =>
		r.fulfill({ body: PIXEL, contentType: 'image/png' })
	);
	await page.route('https://challenges.cloudflare.com/**', (r) =>
		r.fulfill({ body: TURNSTILE, contentType: 'text/javascript' })
	);
});

test.afterEach(() => {
	expect(errors, 'uncaught errors in the page').toEqual([]);
});

test.describe('home', () => {
	test('renders every section and hydrates', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle('Home | Alex Wang');
		await expect(page.getByRole('heading', { level: 1, name: 'Alex Wang' })).toBeVisible();
		for (const name of ['Work', 'Writing', 'Beyond work', 'Contact'])
			await expect(page.getByRole('region', { name, exact: true })).toBeAttached();
		// the email is assembled by script, so its link proves the page hydrated
		await expect(page.getByRole('link', { name: 'alex@alexwang.net' })).toBeAttached();
		await expect(
			page.getByRole('region', { name: 'Writing' }).getByRole('link', { name: /Post number 1/ })
		).toBeAttached();
	});

	test('the dark mode choice survives a reload', async ({ page }) => {
		await page.goto('/');
		// one switch for phones and one for wider screens; only one is shown
		const toggle = page.getByRole('button', { name: 'Dark mode' }).filter({ visible: true });
		await expect(page.locator('html')).toHaveClass(/dark/);
		await toggle.click();
		await expect(page.locator('html')).not.toHaveClass(/dark/);
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'line');
		await page.reload();
		await expect(page.locator('html')).not.toHaveClass(/dark/);
	});

	test('the phone menu opens and navigates', async ({ page, isMobile }) => {
		test.skip(!isMobile, 'phone only');
		await page.goto('/');
		await page.getByRole('button', { name: 'Menu' }).click();
		await page.locator('#mobile-menu').getByRole('link', { name: 'Projects' }).click();
		await expect(page).toHaveURL('/projects');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
	});
});

test.describe('blog', () => {
	test('the archive loads older posts as you scroll', async ({ page }) => {
		await page.goto('/blog');
		await expect(page.getByRole('region', { name: 'Latest' })).toBeVisible();
		const cards = page.locator('main a[href^="/blog/post-"]');
		const before = await cards.count();
		await page.getByRole('link', { name: /Older posts/ }).scrollIntoViewIfNeeded();
		await expect(page.getByRole('status').filter({ hasText: 'more posts loaded' })).toBeAttached();
		expect(await cards.count()).toBeGreaterThan(before);
	});

	test('a search finds posts and is not indexed', async ({ page }) => {
		await page.goto('/blog');
		await page.getByRole('searchbox').fill('post-12');
		await page.getByRole('button', { name: 'Search' }).click();
		await expect(page).toHaveURL('/blog?q=post-12');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Search: post-12');
		await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, follow');
		await expect(
			page
				.getByRole('region', { name: /Results for/ })
				.getByRole('link', { name: /Post number 12/ })
		).toBeVisible();
	});

	test('category and tag pages', async ({ page }) => {
		await page.goto('/blog/category/technology');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Technology');
		await page.goto('/blog/tag/rail');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rail');
		const missing = await page.goto('/blog/tag/nope');
		expect(missing?.status()).toBe(404);
	});

	test('a post: body, ride, and arrow keys to its neighbours', async ({ page, isMobile }) => {
		await page.goto('/blog/post-2');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Post number 2 & friends');
		await expect(page.locator('h2#getting-started')).toBeVisible();
		await expect(page.locator('.post-body table')).toBeVisible();
		await expect(page.locator('script[type="application/ld+json"]')).toBeAttached();
		if (!isMobile) {
			await page.keyboard.press('ArrowRight');
			await expect(page).toHaveURL('/blog/post-3');
			await page.keyboard.press('ArrowLeft');
			await expect(page).toHaveURL('/blog/post-2');
		}
	});

	test('a comment is checked, posted as a draft and acknowledged', async ({ page, request }) => {
		await page.goto('/blog/post-1');
		const comments = page.getByRole('region', { name: /Comments/ });
		await expect(comments.getByText('Great post')).toBeVisible();
		await comments.getByRole('button', { name: /Reply\s*to Ada/ }).click();
		await page.getByLabel('Your comment').fill('A system test was here');
		await page.getByLabel('Name').fill('Tess Ting');
		await page.getByLabel('Email').fill('tess@example.com');
		await page.getByRole('button', { name: 'Post reply' }).click();
		await expect(page.getByText(/Thanks! Your comment will appear/)).toBeVisible();
		const created = await (await request.get('/__test/created')).json();
		expect(created).toContainEqual({
			collection: 'comments',
			item: expect.objectContaining({
				content: 'A system test was here',
				parent: 1,
				status: 'draft'
			})
		});
	});

	test('a stub post sends readers to where it lives', async ({ request }) => {
		const res = await request.get('/blog/post-6', { maxRedirects: 0 });
		expect(res.status()).toBe(307);
		expect(res.headers().location).toBe('https://elsewhere.example/post');
	});
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('pages are complete, and a comment without the spam check is refused politely', async ({
		page
	}) => {
		await page.goto('/');
		await expect(page.getByText('alex [at] alexwang.net')).toBeVisible();
		await page.goto('/blog/post-1');
		await page.getByLabel('Your comment').fill('No script');
		await page.getByLabel('Name').fill('Nojs');
		await page.getByLabel('Email').fill('no@js.example');
		await page.getByRole('button', { name: 'Post comment' }).click();
		await expect(page.getByRole('alert')).toHaveText(/spam check didn’t run/);
		await expect(page.getByLabel('Your comment')).toHaveValue('No script');
	});
});

test.describe('other pages', () => {
	test('projects ride from one to the next', async ({ page, isMobile }) => {
		await page.goto('/projects');
		await page
			.getByRole('link', { name: /Home lab/ })
			.first()
			.click();
		await expect(page).toHaveURL('/project/home-lab');
		await expect(page.getByText('Stop 2 of 3')).toBeVisible();
		if (!isMobile) {
			await page.keyboard.press('ArrowRight');
			await expect(page).toHaveURL('/project/old-site');
		}
	});

	test('a CMS page folds its long list', async ({ page }) => {
		await page.goto('/now');
		const more = page.getByRole('button', { name: 'Show 6 more' });
		await more.click();
		await expect(page.getByRole('button', { name: 'Show fewer' })).toBeVisible();
	});

	test('links, SSH key and redirects', async ({ page, request }) => {
		await page.goto('/links');
		await expect(page.getByRole('link', { name: 'Website' })).toBeVisible();
		await page.goto('/sshkey');
		await expect(page.getByText('ssh-ed25519 AAAATEST')).toBeVisible();
		const linkedin = await request.get('/linkedin', { maxRedirects: 0 });
		expect(linkedin.headers().location).toBe('https://linkedin.com/in/alex-y-wang');
		const portfolio = await request.get('/portfolio', { maxRedirects: 0 });
		expect(portfolio.headers().location).toBe('/projects');
	});

	test('an unknown page is a friendly 404', async ({ page }) => {
		const res = await page.goto('/no-such-page');
		expect(res?.status()).toBe(404);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'This stop isn’t on the line.'
		);
	});

	test('the feed and sitemap are well-formed XML', async ({ request }) => {
		const feed = await request.get('/blog/feed');
		expect(feed.headers()['content-type']).toContain('application/rss+xml');
		const sitemap = await request.get('/sitemap.xml');
		expect(sitemap.headers()['content-type']).toContain('application/xml');
		for (const xml of [await feed.text(), await sitemap.text()]) {
			expect(xml.startsWith('<?xml')).toBe(true);
			// outside CDATA sections every ampersand starts an entity
			const markup = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
			expect(markup).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);
		}
	});
});
