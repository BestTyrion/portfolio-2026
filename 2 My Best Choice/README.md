# My Best Choice — purchasing decisions and future plans

Responsive web app with a Worker ESM backend with browser-local demo accounts. Keep the entry → demo login → three-step setup → workspace flow.

Main routes: `/home`, `/needs`, `/proposals`, `/plans`, `/watchlist`, `/decisions`, `/products/new`, `/products/:id`, `/settings`.

## Verification

`npm test` covers original decision snapshots, price comparability, funding conservation, preview cancellation/confirmation, stale previews, manual sorting, and viewpoint changes. The render smoke checks route/drawer rendering and delegated form actions in a DOM stub; it is **not** browser or accessibility certification. `npm run check` checks JavaScript syntax.

Browser QA covers the original entry/setup flow and the Poe review/connection drawers. Responsive breakpoints and reduced-motion styles remain implemented; no device viewport emulation was available in the browser API.

## Demo walkthrough

1. Choose a demo account, finish setup.
2. Open My needs, edit actual task impact. Review a suggested order; confirm before changing it.
3. Open My agent proposals, inspect evidence and role explanations. Add optional user-confirmed basis through the profile form.
4. Open My plans. Confirm a distributable total or explicitly load the funding example.
5. Preview the HK$499 earbud using its HK$600 earmark: earmark becomes101; unallocated remains3400. Cancel changes nothing.
6. Using another source requires explicit release of the original earmark. The preview displays the released sum and changes in other goals before saving.
7. A saved funding allocation is not an order. BUY still requires separate user confirmation of purchase.

## Design and content

Figma: https://www.figma.com/design/IaQeWlPQ22QgeOKLoQH3I5

Native text, semantic variables, reusable buttons and perspective components, vector charts and three separately generated content photos. Images are AI-generated visual illustrations, not actual merchant product photography. Original image files are represented by optimized web assets in `public/assets/`.

Direction suggestions, prices and review themes are explicit examples. Optional live Poe analysis is available after connecting an API Key. No merchant integrations, banking access or scheduled backend delivery. Browser history, social media, chat history and inferred long-term personality remain visible future concepts with no collection implemented.

## Poe connection

- `npm run build` packages static assets into `dist/server/index.js` with the same-origin API proxy. `npm run dev -- --port 4173` runs the Worker locally.
- Website: My agent proposals or product detail → Connect settings → enter an API Key → Analyze → review the exact facts → Confirm and generate. Keys and results are tab-memory only, cleared on reload/logout; no keys in localStorage, exports, Git, or Figma.
- `/api/ai/status` exposes configuration status only. `/api/ai/analyze` validates origin, credentials, size, fact provenance and structured output, proxies to the fixed official Poe endpoint, and maps provider errors without returning upstream secrets. Model defaults to `DeepSeek-V3.2`; override `POE_MODEL` server-side if needed.
- Optional server-side `POE_API_KEY` must be paired with `MBC_ACCESS_CODE` on this public site. No shared mode is available when either is missing. Configure secrets only in runtime environment variables, never in source. The demo account selector is not server authentication.
- Real AI output stays separate from fixed examples. Missing emotional/social evidence is unknown; generated proposals become a draft form and require confirmation. Plans and finance calculations are unchanged.
- No autonomous schedules, market feeds or Figma two-way automatic sync. Existing Figma is linked in the connection drawer; editable connection/consent/result frames and prototype navigation are maintained in the file.
- `tests/ai.test.mjs` uses mocked upstream replies; the hosted shared connection is configured with a server-side secret and protected access code; neither is committed to source. Live generation was validated separately from these mocked tests.

## Evidence and personal statements

The unified basis form separates actual difficulty/equipment/budget/time from priority/emotional expectations/social influence. Optional background stays collapsed. Saving confirms only entered statements, never the helper examples, and does not send an AI request or change funds. Explicit no influence is a statement; blanks remain unknown. Each model request lists exactly the fact IDs available for citation. Relevant confirmed inputs must be cited by the corresponding perspective; unknown or missing citations are rejected rather than silently attaching supporting data. UI distinguishes absent personal evidence, example-only evidence and an uncited model opinion. Previous analysis becomes stale after inputs change and requires manual regeneration.

## Demonstration and existing plans

My agent proposals → One-click earbud demonstration automatically loads an isolated, explicitly labelled script (no API request). The context selector lists saved long-term goals, archived goals and needs. My plans and each goal card link into the same analysis flow. Selected-plan notes remain separate from other contexts; input/funds changes invalidate previous analysis. No plan or funds are changed by viewing or generating analysis.

## Product identification

Check product → complete Taobao/Tmall, JD or Amazon product URL → optional copied description → connect AI → identify → review and confirm. The server normalizes links and removes tracking, uses one bounded public HTML request (no cookies, redirects, login or anti-bot bypass), and extracts JSON-LD/OG fields. Poe extracts only verbatim supported fields; each nonempty field requires valid source IDs. If no public fields can be retrieved, the platform/product identifier remains available and the user can supply copied text. It never treats the model as a web browser or a platform API.

`POST /api/products/identify` uses the same origin/key or project-code protection as analysis. Keys stay server-side or in tab memory. Confirmed imports retain original currency/amount, link, provenance and retrieval time; a CNY/USD quote does not become an HKD budget amount. Only the HKD amount explicitly confirmed in the review form is used in finance calculations. No imported price history, reviews, warranty or inventory is invented.

Official platform catalog/quote/review integrations remain **not connected**: no Taobao/JD app credentials or Amazon Creators API credentials have been provided. Official links in the connection drawer explain the requirements. The current public-page/copied-text AI identification is independently usable and is not labelled as an official integration.

## Interface language

English is the default. The Chinese/English button is available before sign-in, in the workspace header and inside drawers. The choice is stored separately from business records. Static UI copy and built-in example display use local dictionaries; entered records, URLs, identifiers, API keys, input values, financial data and enum values are not rewritten. A language switch restores current form drafts. AI calls send the chosen language through `X-MBC-Language`; previous results become stale after a language change and require manual regeneration. Product extraction continues to preserve verbatim source fields. No external translation service is used at runtime.

## Poe provider

All analysis and identification requests use `https://api.poe.com/v1/chat/completions`. The only provider secret is `POE_API_KEY`; shared access uses the existing project code through `MBC_ACCESS_CODE`. The default model is the Poe bot `DeepSeek-V3.2`, configurable with `POE_MODEL`. Unsupported vendor-specific thinking/JSON parameters were removed; complete JSON fences are normalized before strict field and citation validation. `POST /api/ai/check` is protected by the same origin and credentials and checks model-list access without sending business records. Demo scripts never masquerade as a live provider response.
