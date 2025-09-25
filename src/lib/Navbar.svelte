<script>
	import { onMount } from 'svelte';
	import { darkmode } from '../stores';
	import { browser } from '$app/environment';

	let mobilemenu = false;

	let toggleDarkMode = function () {
		$darkmode = !$darkmode;
	};

	let toggleMobileMenu = function () {
		mobilemenu = !mobilemenu;
	};

	onMount(async () => {
		if (browser) {
			// Enable darkmode automatically if it's saved in localstorage
			if ($darkmode) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	});
</script>

<div class="ct relative">
	<div class="absolute top-0 right-0 z-10">
		<div class="hidden md:flex flex-row-reverse">
			<div class="text-xl font-display font-light my-6 mx-8 space-x-2">
				<a href="/"
					><span
						class="bg-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded py-2 px-6"
						>Home</span
					></a
				>
				<a href="/now"
					><span
						class="bg-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded py-2 px-6"
						>Now</span
					></a
				>
				<a href="/i-like"
					><span
						class="bg-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded py-2 px-6"
						>What I Like</span
					></a
				>
				<a href="/projects"
					><span
						class="bg-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded py-2 px-6"
						>Projects</span
					></a
				>
				<a href="/linkedin"
					><span
						class="bg-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded py-2 px-6"
						>LinkedIn</span
					></a
				>
				<span
					class="bg-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded py-2 px-4 hover:cursor-pointer"
					on:click={toggleDarkMode}><i class="fa-solid fa-sun" /></span
				>
			</div>
		</div>
		<div class="block md:hidden w-screen bg-gray-200 dark:bg-slate-700 dark:text-white py-3 px-6">
			<div class="flex justify-between h-full w-full">
				<div>
					<span on:click={toggleMobileMenu}>
						{#if !mobilemenu}
							<i class="fa-solid fa-bars fa-2x"></i>
						{:else}
							<i class="fa-solid fa-xmark fa-2x"></i>
						{/if}
					</span>
				</div>
				<div>
					<span on:click={toggleDarkMode}> <i class="fa-solid fa-sun fa-2x" /></span>
				</div>
			</div>
			<div class:hidden={!mobilemenu} class="bg-gray-200 dark:bg-slate-700 dark:text-white pt-2">
				<div class="py-3" on:click={toggleMobileMenu}><a href="/">Home</a></div>
				<div class="py-3" on:click={toggleMobileMenu}><a href="/now">Now</a></div>
				<div class="py-3" on:click={toggleMobileMenu}><a href="/i-like">What I Like</a></div>
				<div class="py-3" on:click={toggleMobileMenu}><a href="/projects">Projects</a></div>
				<div class="py-3" on:click={toggleMobileMenu}><a href="/linkedin">LinkedIn</a></div>
			</div>
		</div>
	</div>
</div>
