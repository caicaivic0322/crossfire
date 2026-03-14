# Repository Guidelines

## Project Structure & Module Organization
`index.html` is the main game entry and currently contains the menu UI, inline styles, and most gameplay logic. `game.js` is a class-based JavaScript variant/prototype; it is not imported by `index.html`, so treat `index.html` as the source of truth unless you intentionally wire `game.js` into the page. `test.html` is a minimal DOM/event smoke page. `README.md` contains setup notes and the gameplay overview. There is no `src/` directory or asset pipeline, so keep related HTML, CSS, and JavaScript changes close to the feature they affect.

## Build, Test, and Development Commands
This project is static and does not use `npm`.

`python3 -m http.server 8080`
Starts a local server from the repository root.

`http://localhost:8080/index.html`
Runs the full game in the browser.

`http://localhost:8080/test.html`
Loads the lightweight page for quick DOM and click-handler checks.

Three.js is loaded from a CDN at runtime, so local testing requires network access unless the dependency is vendored locally.

## Coding Style & Naming Conventions
Use 4-space indentation in HTML, CSS, and JavaScript. Match the style of the file you touch: `index.html` uses semicolons, `var`, and named functions, while `game.js` uses `class`, `const`, and `let`. Avoid mixing styles inside one edit. Prefer camelCase for variables, functions, and DOM IDs, for example `startBtn`, `weaponInfo`, and `playerHealth`. Keep browser-only logic dependency-light and avoid large refactors unless they are part of the task.

## Testing Guidelines
There is no automated test suite or coverage gate. For every gameplay change, run a manual smoke test in the browser: start the game, confirm pointer lock, move with `W/A/S/D`, shoot, reload with `R`, and verify victory/defeat screens still render correctly. Use `test.html` only for quick event-binding validation. When changing controls, UI, or AI behavior, include brief manual test notes in the pull request.

## Commit & Pull Request Guidelines
History around this project favors short, task-focused subjects, often either a Conventional Commit prefix or a concise Chinese summary. Prefer messages like `feat: improve shotgun spread` or `修复开始按钮失效`. Keep each commit scoped to one change. Pull requests should include the purpose of the change, the main files touched, manual verification steps, and screenshots or a short recording for visible gameplay or UI updates.

## Security & Runtime Notes
Do not add secrets, API keys, or private endpoints; everything here runs client-side. If CDN reliability becomes a problem, vendor Three.js locally and update the loading path explicitly.
