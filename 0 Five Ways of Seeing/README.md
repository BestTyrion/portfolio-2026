# FIVE WAYS OF SEEING — portfolio hub starter

Status: **locally buildable static portfolio hub**. Not deployed. No links to the five working applications have been supplied. The five visuals are intentionally editorial placeholders, NOT real screenshots.

## Quick preview (Windows / Node 24)

From this folder, run `npx serve .` and open the URL printed in your terminal. Or use Python: `python -m http.server 8080`, then open http://localhost:8080.

## Publish the hub to Cloudflare Pages

1. Create a GitHub repository for this folder (or upload this folder to a Cloudflare Pages project using Direct Upload).
2. In Cloudflare Pages, choose the repository, Framework preset = None, Build command = blank, Output directory = `/` (repo root).
3. Publish. Cloudflare assigns a `*.pages.dev` domain. This package does not create the Cloudflare project or claim a live URL.
4. Set the project links in `projects.json` once their deployments are verified. `demoUrl` and `caseStudyUrl` must be full HTTPS URLs.
5. Replace editorial placeholder visuals with genuine project screenshots after source archives are inspected; do not advertise placeholder images as authentic application screenshots.

## Independent project deployment target

| Project | Source audit needed before platform selection |
| --- | --- |
| My Best Choice | API routing, backend/AI proxy, persistence, secrets |
| Stellar Nexus | React build scripts, D1 schema/migrations, auth and asset paths |
| New in Old | React build scripts, D1 schema/migrations, image licenses |
| MEDMIND | Node server runtime, SQLite persistence, server storage constraints, patient privacy |
| LUOSHEN | Next.js rendering mode, API routes, device mock/live integrations, secrets |

The technology names above are preliminary based on provided planning materials; verify `package.json`, lockfile, environment and runtime code before deploying.

## Required security checks

- Never put API keys in frontend JavaScript or `projects.json`; use encrypted environment secrets in the hosting platform.
- Do not deploy a local SQLite DB to an ephemeral filesystem expecting reliable persistence; consider managed database or stateful runtime and migrations.
- Use mock/demo data only for publicly accessible medication or home-sensor demos; do not publish real user profiles.
- Verify AI services and CORS through server-side proxy routes; do not assume an outbound POST will succeed because a GET succeeds.
- Ensure every project gets its own build and smoke test (desktop, mobile, URL routing, requests, data changes, failures).

## Updating projects

Only update `projects.json` and visual assets for future project entries. Design and rendering are centralised in `assets/style.css` and `assets/app.js`.
