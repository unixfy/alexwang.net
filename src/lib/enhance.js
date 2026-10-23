// Progressive enhancements for CMS-authored HTML. Each works from semantics alone (lists, headings),
// so an editor can rewrite a page freely, and each leaves the content intact if scripts never run.

/**
 * Fold very long lists: keep the first few items and put the rest behind a toggle.
 * @param {HTMLElement} root
 * @param {{ keep?: number, over?: number }} [options] keep = items left visible, over = list length that triggers folding
 */
export function foldLists(root, { keep = 8, over = 12 } = {}) {
	for (const list of root.querySelectorAll('ul, ol')) {
		const items = [...list.children].filter((el) => el.tagName === 'LI');
		if (items.length <= over) continue;

		const extra = /** @type {HTMLElement[]} */ (items.slice(keep));
		extra.forEach((li) => (li.hidden = true));

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'fold-toggle';
		button.setAttribute('aria-expanded', 'false');
		const label = (/** @type {boolean} */ open) =>
			open ? 'Show fewer' : `Show ${extra.length} more`;
		button.textContent = label(false);
		button.addEventListener('click', () => {
			const open = button.getAttribute('aria-expanded') !== 'true';
			extra.forEach((li) => (li.hidden = !open));
			button.setAttribute('aria-expanded', String(open));
			button.textContent = label(open);
		});
		list.after(button);
	}
}
