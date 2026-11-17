# alexwang.net

This is the source code for my personal site. It's built with SvelteKit, Cloudflare Pages, and Directus.

## Tests

Every push and pull request runs all of these in GitHub Actions (`.github/workflows/test.yml`).

| Command                 | What it checks                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm test`              | Unit, component, integration and server-rendering tests (Vitest).                                                                                                                                                  |
| `npm run test:coverage` | The same, failing below 99% of lines, statements, functions and branches. Branches are counted as written in the source: `tests/coverage/branches.js` leaves out the fallbacks the Svelte compiler adds to markup. |
| `npm run test:system`   | The production build in a real browser (Playwright), on desktop and phone, with and without JavaScript. Run `npm run build` first.                                                                                 |
| `npm run test:perf`     | CPU per request on the production build, against Cloudflare's Free-plan limit of 10 ms. Fails when a route's p95 is over budget. Run `npm run build` first. `PERF_BUDGET_MS` and `PERF_RUNS` adjust it.            |

Nothing talks to the real CMS: `tests/helpers/cms.js` is a fake Directus (REST and GraphQL) serving the data in `tests/helpers/fixtures.js`, and it also stands in for Turnstile's server-side check.

- `tests/unit/server`: library code that runs on the server (rendering posts, the CMS cache, dates…).
- `tests/unit/dom`: browser code in jsdom (the WebGL map and tower, reveals, the service worker…). `tests/setup/dom.js` provides observers, animation frames, media queries and WebGL that tests can drive.
- `tests/component`: every Svelte component and page.
- `tests/integration`: every route's load, endpoint and form action through the real Directus SDK, and every page rendered on the server from that data.
- `tests/system`: Playwright against `tests/system/serve.js`, which serves the build in Node with the fake CMS behind it.
- `tests/perf`: the CPU budget check.
