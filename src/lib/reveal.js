// Entrances: anything marked `.reveal` rises in once as it scrolls into view. Motion's `inView`
// (an IntersectionObserver underneath) says when; Motion's `animate` does the rise. Nothing here
// listens to scroll. The hidden state exists only under `.js` (set in app.html), so without script,
// or under reduced motion, nothing is ever hidden.
import { animate, inView } from 'motion';

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** @type {(() => void) | null} */
let rescan = null;

/**
 * Watch a subtree for `.reveal` elements, now and as they are added (the blog streams in late).
 * @param {HTMLElement} root
 * @returns {() => void} stop watching
 */
export function watchReveals(root) {
	/** @type {Set<Element>} */
	const seen = new Set();
	/** @type {(() => void)[]} */
	const stops = [];

	const scan = () => {
		for (const el of root.querySelectorAll('.reveal:not(.in)')) {
			if (seen.has(el)) continue;
			seen.add(el);
			if (calm()) {
				el.classList.add('in');
				continue;
			}
			const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) / 1000 || 0;
			stops.push(
				inView(
					el,
					() => {
						animate(
							el,
							{ opacity: [0, 1], transform: ['translateY(26px)', 'translateY(0px)'] },
							{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }
						).finished.then(() => el.classList.add('in'));
					},
					{ margin: '0px 0px -8% 0px' }
				)
			);
		}
	};

	rescan = scan;
	scan();
	const mutations = new MutationObserver(scan);
	mutations.observe(root, { childList: true, subtree: true });
	return () => {
		mutations.disconnect();
		stops.forEach((stop) => stop());
		if (rescan === scan) rescan = null;
	};
}

/**
 * Give each direct child of a block of CMS prose its own entrance, staggered, without the editor
 * having to mark anything up.
 * @param {HTMLElement} block
 * @param {string} [except] children matching this selector are left alone; a transformed element
 *   becomes its own stacking context, which would trap anything positioned inside it (a heading's ring)
 */
export function stagger(block, except = '') {
	[...block.children].forEach((el, i) => {
		if (!(el instanceof HTMLElement) || (except && el.matches(except))) return;
		el.classList.add('reveal');
		el.style.setProperty('--d', `${Math.min(i, 5) * 50}ms`);
	});
	rescan?.();
}
