// Colour helpers shared by the WebGL pieces: read a site token (oklch) as sRGB 0..1.

/**
 * oklch(L C H) from a computed CSS value to sRGB 0..1
 * @param {string} value
 * @returns {number[] | null}
 */
export function parseOklch(value) {
	const m = /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/.exec(value);
	if (!m) return null;
	const L = parseFloat(m[1]) / (m[2] ? 100 : 1);
	const C = parseFloat(m[3]);
	const H = (parseFloat(m[4]) * Math.PI) / 180;
	const a = C * Math.cos(H);
	const b = C * Math.sin(H);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const lin = [
		4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s
	];
	return lin.map((v) => {
		v = Math.min(1, Math.max(0, v));
		return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
	});
}

/**
 * @param {CSSStyleDeclaration} style
 * @param {string} name
 * @param {number[]} fallback
 */
export function cssColor(style, name, fallback) {
	return parseOklch(style.getPropertyValue(name)) ?? fallback;
}
