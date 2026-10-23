<script>
	import { darkmode } from '../stores';
	import { page } from '$app/state';
	import { tick } from 'svelte';

	let open = $state(false);
	/** @type {HTMLElement | undefined} */
	let nav = $state();

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/now', label: 'Now' },
		{ href: '/i-like', label: 'What I Like' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/linkedin', label: 'LinkedIn' }
	];

	const current = (/** @type {string} */ href) =>
		(href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href))
			? 'page'
			: undefined;

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

<nav bind:this={nav} aria-label="Main" class="top-0 right-0 z-10 md:absolute">
	<!-- tablet and up: floats over the top right of the page -->
	<div class="navbar hidden min-h-0 gap-2 px-6 py-5 md:flex">
		<ul class="menu menu-horizontal menu-lg gap-1 p-0 font-display">
			{#each links as { href, label }}
				<li><a {href} aria-current={current(href)}>{label}</a></li>
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
			{@render themeToggle('btn-lg')}
		</div>
		<ul
			id="mobile-menu"
			class="mobile-menu menu menu-lg w-full px-4 pb-4 font-display"
			class:hidden={!open}
		>
			{#each links as { href, label }}
				<li>
					<a {href} aria-current={current(href)} onclick={() => (open = false)}>{label}</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>

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
