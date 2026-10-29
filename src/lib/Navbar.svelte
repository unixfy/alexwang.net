<script>
	import { darkmode } from '../stores';
	import { page } from '$app/state';
	import { tick } from 'svelte';

	let open = $state(false);
	/** @type {HTMLElement | undefined} */
	let nav = $state();

	// On the home page the name is the page, so a Home link there would only be one more choice
	const links = $derived([
		...(page.url.pathname === '/' ? [] : [{ href: '/', label: 'Home' }]),
		{ href: '/blog', label: 'Blog' },
		{ href: '/now', label: 'Now' },
		{ href: '/i-like', label: 'What I Like' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/linkedin', label: 'LinkedIn', external: true }
	]);

	const current = (/** @type {string} */ href) =>
		(href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href))
			? 'page'
			: undefined;

	const home = $derived(page.url.pathname === '/');

	const toggleDarkMode = () => {
		const flip = () => ($darkmode = !$darkmode);
		if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return flip();
		}
		document.startViewTransition(async () => {
			flip();
			await tick();
		});
	};

	// the phone menu closes on Escape, on a tap outside it, and when a link is chosen
	const onKey = (/** @type {KeyboardEvent} */ e) => {
		if (e.key === 'Escape') open = false;
	};
	const onPointer = (/** @type {PointerEvent} */ e) => {
		if (open && nav && !nav.contains(/** @type {Node} */ (e.target))) open = false;
	};
</script>

<svelte:window onkeydown={onKey} onpointerdown={onPointer} />

<nav
	bind:this={nav}
	aria-label="Main"
	class="top-0 right-0 z-10 md:pointer-events-none md:absolute md:inset-x-0 md:flex md:items-start md:justify-between"
>
	<!-- tablet and up: the lockup floats over the top left of the page, the links over the top right -->
	<div class="hidden md:block">
		{#if !home}
			<div class="pointer-events-auto pt-5 pl-[calc(2.5rem-1.125rem)]">
				{@render lockup('d')}
			</div>
		{/if}
	</div>
	<div class="navbar pointer-events-auto hidden min-h-0 w-auto gap-2 px-6 py-5 md:flex">
		<ul class="menu menu-horizontal menu-lg gap-1 p-0 font-display">
			{#each links as { href, label, external }}
				<li><a {href} aria-current={current(href)}>{@render linkLabel(label, external)}</a></li>
			{/each}
		</ul>
		{@render themeToggle()}
	</div>

	<!-- phone: a bar with the menu button and the theme switch -->
	<div class="bg-base-200 md:hidden">
		<div class="navbar min-h-0 justify-between px-3 py-2">
			<button
				type="button"
				class="btn btn-ghost btn-square btn-lg swap swap-rotate"
				class:swap-active={open}
				aria-label="Menu"
				aria-expanded={open}
				aria-controls="mobile-menu"
				onclick={() => (open = !open)}
			>
				<i class="swap-off fa-solid fa-bars fa-lg" aria-hidden="true"></i>
				<i class="swap-on fa-solid fa-xmark fa-lg" aria-hidden="true"></i>
			</button>
			{#if !home}
				{@render lockup('m')}
			{/if}
			{@render themeToggle('btn-lg')}
		</div>
		<ul
			id="mobile-menu"
			class="mobile-menu menu menu-lg w-full px-4 pb-4 font-display"
			class:hidden={!open}
		>
			{#each links as { href, label, external }}
				<li>
					<a {href} aria-current={current(href)} onclick={() => (open = false)}
						>{@render linkLabel(label, external)}</a
					>
				</li>
			{/each}
		</ul>
	</div>
</nav>

<!-- The mark and the name, on every page but the home page (where the name is the page). The W is
     the line itself and its three stops are the three doors, in the same tokens as the rest of the site. -->
{#snippet lockup(/** @type {string} */ id)}
	<a
		href="/"
		aria-label="Alex Wang, home"
		class="group inline-flex items-center gap-2.5 text-brand-600 no-underline hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-300"
	>
		<svg viewBox="0 0 64 64" class="size-9 shrink-0" aria-hidden="true">
			<defs>
				<mask id="mark-{id}" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
					<rect width="64" height="64" fill="#fff" />
					<circle cx="18" cy="52" r="7.2" />
					<circle cx="32" cy="22" r="7.2" />
					<circle cx="46" cy="52" r="7.2" />
				</mask>
			</defs>
			<path
				d="M5 12 18 52 32 22 46 52 59 12"
				fill="none"
				stroke="currentColor"
				stroke-width="8"
				stroke-linecap="round"
				stroke-linejoin="round"
				mask="url(#mark-{id})"
			/>
			<g fill="none" stroke-width="4.4">
				<circle cx="18" cy="52" r="7.2" stroke="var(--line-work)" />
				<circle cx="32" cy="22" r="7.2" stroke="var(--line-writing)" />
				<circle cx="46" cy="52" r="7.2" stroke="var(--line-contact)" />
			</g>
		</svg>
		<span
			class="font-display text-xl leading-none font-extrabold tracking-tight [font-stretch:118%] decoration-[var(--line-work)] decoration-2 underline-offset-4 group-hover:underline"
			>Alex Wang</span
		>
	</a>
{/snippet}

{#snippet linkLabel(/** @type {string} */ label, external = false)}
	{label}
	{#if external}
		<i class="fa-solid fa-arrow-up-right-from-square text-[0.7em]" aria-hidden="true"></i>
		<span class="sr-only">(opens LinkedIn)</span>
	{/if}
{/snippet}

{#snippet themeToggle(/** @type {string} */ size = '')}
	<button
		type="button"
		class="btn btn-ghost btn-circle swap swap-rotate {size}"
		class:swap-active={$darkmode}
		aria-label="Dark mode"
		aria-pressed={$darkmode}
		onclick={toggleDarkMode}
	>
		<i class="swap-off fa-solid fa-moon fa-lg" aria-hidden="true"></i>
		<i class="swap-on fa-solid fa-sun fa-lg" aria-hidden="true"></i>
	</button>
{/snippet}
