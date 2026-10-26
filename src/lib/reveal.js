// Entrances: anything marked `.reveal` rises in once, as it scrolls up into the lower edge of the
// screen. The hidden state only exists under `.js` (set in app.html), so with no script nothing is
// hidden. Everything already above that edge counts as seen, so a jump to an anchor or a fast fling
// never leaves a section waiting, and the page's closing stretch is shown without waiting for its turn.

/**
 * Watch a subtree for `.reveal` elements, now and as they are added (the blog streams in late).
 * @param {HTMLElement} root
 * @returns {() => void} stop watching
 */
export function watchReveals(root) {
	let frame = 0;

	const sweep = () => {
		frame = 0;
		const edge = innerHeight * 0.92;
		const nearEnd = scrollY + innerHeight * 3 >= document.documentElement.scrollHeight;
		for (const el of root.querySelectorAll('.reveal:not(.in)')) {
			if (nearEnd || el.getBoundingClientRect().top < edge) el.classList.add('in');
		}
	};
	const queue = () => (frame ||= requestAnimationFrame(sweep));

	queue();
	const mutations = new MutationObserver(queue);
	mutations.observe(root, { childList: true, subtree: true });
	addEventListener('scroll', queue, { passive: true });
	addEventListener('resize', queue);
	return () => {
		mutations.disconnect();
		removeEventListener('scroll', queue);
		removeEventListener('resize', queue);
		cancelAnimationFrame(frame);
	};
}

/**
 * Give each direct child of a block of CMS prose its own entrance, staggered, without the editor
 * having to mark anything up.
 * @param {HTMLElement} block
 */
export function stagger(block) {
	[...block.children].forEach((el, i) => {
		if (!(el instanceof HTMLElement)) return;
		el.classList.add('reveal');
		el.style.setProperty('--d', `${Math.min(i, 5) * 50}ms`);
	});
	// the watcher only wakes on scroll, resize and added nodes: tell it about the new classes
	requestAnimationFrame(() => dispatchEvent(new Event('resize')));
}
