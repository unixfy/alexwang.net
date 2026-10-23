<script>
	import { darkmode } from '../stores';

	let mobilemenu = $state(false);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/now', label: 'Now' },
		{ href: '/i-like', label: 'What I Like' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/linkedin', label: 'LinkedIn' }
	];

	const toggleDarkMode = () => ($darkmode = !$darkmode);
	const toggleMobileMenu = () => (mobilemenu = !mobilemenu);
</script>

<div class="md:absolute top-0 right-0 z-10">
	<div class="hidden md:flex flex-row-reverse">
		<div class="text-xl font-display font-light my-6 mx-8 space-x-2">
			{#each links as { href, label }}
				<a {href}>
					<span
						class="bg-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded py-2 px-6"
						>{label}</span
					>
				</a>
			{/each}
			<button
				type="button"
				aria-label="Toggle dark mode"
				class="bg-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded py-2 px-4 hover:cursor-pointer"
				onclick={toggleDarkMode}><i class="fa-solid fa-sun"></i></button
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
			<button type="button" aria-label="Toggle dark mode" onclick={toggleDarkMode}>
				<i class="fa-solid fa-sun fa-2x"></i>
			</button>
		</div>
		<div class:hidden={!mobilemenu} class="bg-gray-200 dark:bg-slate-700 dark:text-white pt-2">
			{#each links as { href, label }}
				<a {href} class="block py-3" onclick={toggleMobileMenu}>{label}</a>
			{/each}
		</div>
	</div>
</div>
