import { goto } from '$app/navigation';

/**
 * ← and → ride the line: a keydown handler that goes to the previous or next stop. Typing in a field
 * and keys held with a modifier are left alone.
 * @param {() => string | null | undefined} back where ← goes, read when the key is pressed
 * @param {() => string | null | undefined} on where → goes
 * @returns {(e: KeyboardEvent) => void}
 */
export const rideKeys = (back, on) => (e) => {
	if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
	const t = e.target;
	if (t instanceof HTMLElement && t.closest('input, textarea, select, [contenteditable]')) return;
	const to = e.key === 'ArrowLeft' ? back() : e.key === 'ArrowRight' ? on() : null;
	if (to) goto(to);
};
