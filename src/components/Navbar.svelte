<script>
	import { onMount } from 'svelte';
	import { darkmode } from '../stores';
	import { browser } from '$app/env';

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

<div class="text-xl font-display font-light my-6 mx-8">
	<a href="/"><span class="bg-gray-200 hover:bg-gray-100 rounded py-2 px-6 mx-2">Home</span></a>
	<a href="/portfolio"
		><span class="bg-gray-200 hover:bg-gray-100 rounded py-2 px-6 mx=2">Projects</span></a
	>
	<a href="/linkedin"
		><span class="bg-gray-200 hover:bg-gray-100 rounded py-2 px-6 mx-2">LinkedIn</span></a
	>
	<span class="bg-gray-200 hover:bg-gray-100 rounded py-2 px-4 ml-2 hover:cursor-pointer" on:click={toggleDarkMode}
		><i class="fa-solid fa-sun" /></span
	>
</div>
