<script>
	import { darkmode } from '../stores';
	import { page } from '$app/state';

	let mobilemenu = $state(false);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/now', label: 'Now' },
		{ href: '/i-like', label: 'What I Like' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/linkedin', label: 'LinkedIn' }
	];

	const current = (/** @type {string} */ href) =>
		(href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href)) ? 'page' : undefined;

	const toggleDarkMode = () => ($darkmode = !$darkmode);
	const closeOnEscape = (/** @type {KeyboardEvent} */ e) => {
		if (e.key === 'Escape') mobilemenu = false;
	};
	const toggleMobileMenu = () => (mobilemenu = !mobilemenu);
</script>

<svelte:window onkeydown={closeOnEscape} />

<nav aria-label="Main" class="md:absolute top-0 right-0 z-10">
	<div class="hidden md:flex flex-row-reverse">
		<div class="text-xl font-display my-6 mx-8 space-x-2">
			{#each links as { href, label }}
				<a {href} aria-current={current(href)} class="group no-underline">
					<span
						class="bg-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white group-aria-[current=page]:bg-brand-600 group-aria-[current=page]:text-white dark:group-aria-[current=page]:bg-brand-300 dark:group-aria-[current=page]:text-gray-950 rounded py-2 px-6"
						>{label}</span
					>
				</a>
			{/each}
			<button
				type="button"
				aria-label="Dark mode"
				aria-pressed={$darkmode}
				class="bg-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded py-2 px-4 hover:cursor-pointer"
				onclick={toggleDarkMode}><i class="fa-solid {$darkmode ? 'fa-sun' : 'fa-moon'}"></i></button
			>
		</div>
	</div>
	<div class="block md:hidden w-screen bg-gray-200 dark:bg-slate-700 dark:text-white py-3 px-6">
		<div class="flex justify-between h-full w-full">
			<button
				type="button"
				aria-label="Toggle menu"
				aria-expanded={mobilemenu}
				onclick={toggleMobileMenu}
			>
				<i class="fa-solid {mobilemenu ? 'fa-xmark' : 'fa-bars'} fa-2x"></i>
			</button>
			<button type="button" aria-label="Dark mode" aria-pressed={$darkmode} onclick={toggleDarkMode}>
				<i class="fa-solid {$darkmode ? 'fa-sun' : 'fa-moon'} fa-2x"></i>
			</button>
		</div>
		<div class:hidden={!mobilemenu} class="mobile-menu bg-gray-200 dark:bg-slate-700 dark:text-white pt-2">
			{#each links as { href, label }}
				<a {href} aria-current={current(href)} class="block py-3 aria-[current=page]:font-bold" onclick={toggleMobileMenu}>{label}</a>
			{/each}
		</div>
	</div>
</nav>
