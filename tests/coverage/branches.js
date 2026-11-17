// Branch coverage of the source as written. Svelte compiles every `{expression}` in markup to
// `expression ?? ''` (and similar fallbacks), and v8 reports each as a branch mapped back onto the
// template, though nothing in the source branches there; `new Date().getFullYear()` in the footer is
// one. This reads coverage/coverage-final.json, keeps the branches whose source text holds a real
// conditional (an `if`, a ternary, `&&`, `||`, `??`, `?.`, a `case` or an `{#if}`/`{:else}`),
// and fails when fewer than BRANCH_MIN percent of those were taken.
//
//   npm run test:coverage   (runs this after Vitest)
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';

const MIN = Number(process.env.BRANCH_MIN ?? 99);
const coverage = JSON.parse(readFileSync('coverage/coverage-final.json', 'utf8'));

const CONDITIONAL = /\?\?|\|\||&&|\?\.|\s\?\s|\bif\b|\{:else|\bcase\b/;

/**
 * The source text a branch location covers; empty when it maps to no span of source (the compiler's
 * own code is mapped to a single point, with no end).
 */
function text(/** @type {string[]} */ lines, /** @type {any} */ loc) {
	const start = loc?.start;
	const end = loc?.end;
	if (start?.line == null || start.column == null || end?.line == null || end.column == null)
		return '';
	if (start.line === end.line) return (lines[start.line - 1] ?? '').slice(start.column, end.column);
	return [
		(lines[start.line - 1] ?? '').slice(start.column),
		...lines.slice(start.line, end.line - 1),
		(lines[end.line - 1] ?? '').slice(0, end.column)
	].join('\n');
}

let total = 0;
let taken = 0;
let generated = 0;
/** @type {string[]} */
const missed = [];

for (const [file, data] of Object.entries(coverage)) {
	const lines = readFileSync(file, 'utf8').split('\n');
	const svelte = file.endsWith('.svelte');
	for (const [id, counts] of Object.entries(/** @type {Record<string, number[]>} */ (data.b))) {
		const branch = data.branchMap[id];
		// a plain module's branches are all its own; a component's are its own only where its source
		// has a conditional at that spot
		const real = !svelte || CONDITIONAL.test(text(lines, branch.loc));
		if (!real) {
			generated += counts.length;
			continue;
		}
		counts.forEach((n, i) => {
			total++;
			if (n > 0) taken++;
			else {
				const at = branch.locations?.[i]?.start ?? branch.loc.start;
				missed.push(
					`${relative(process.cwd(), file)}:${at.line}:${at.column + 1} (${branch.type})`
				);
			}
		});
	}
}

const pct = (100 * taken) / total;
console.log(
	`Source branches: ${pct.toFixed(2)}% (${taken}/${total}); ${generated} compiler-generated branches left out`
);
if (missed.length) console.log(`Not taken:\n  ${missed.join('\n  ')}`);
if (pct < MIN) {
	console.error(`Branch coverage ${pct.toFixed(2)}% is below ${MIN}%`);
	process.exit(1);
}
