# MEDMIND

A compact medication information management system with a patient mobile interface, doctor web interface, shared Node.js API, and persistent SQLite database. All demonstration records and accounts are synthetic.

## Start

On Windows x64, extract the complete package. Double-click `MEDMIND_Patient.exe` to open only the patient app, or `MEDMIND_Doctor.exe` to open only the doctor web interface. Both launchers use the bundled Node.js runtime and the same local service and SQLite database. Normal use does not require installing Node.js or npm. The local service remains in the background when browser tabs close. See `README_FIRST.zh-CN.txt` for the quick start.

To work with the source, install Node.js 24+ and npm.

To work with the source or rebuild the interfaces:

```bash
npm install
npm run build
npm start
```

Open the **Patient App** at `http://localhost:3001/patient/` and **Doctor Web** at `http://localhost:3001/doctor/`. The root URL opens the patient app. The database is created at `data/medmind.sqlite` on first start. Set `MEDMIND_DB=/absolute/path/file.sqlite` to choose another location. Set `PORT` to change the API port.

For development, use `npm run dev`. Patient Vite runs at `http://localhost:5173/patient/`; Doctor Vite runs at `http://localhost:5174/doctor/`. Both proxy `/api` to port 3001.

## Demonstration accounts

| Role | Email | Password |
| --- | --- | --- |
| Patient · Jason Wong | `jason@medmind.demo` | `jason-demo` |
| Patient · Mrs. Chan | `chan@medmind.demo` | `chan-demo` |
| Doctor · Dr. Lee | `lee@medmind.demo` | `lee-demo` |

Jason initially shares full records with Dr. Lee. Mrs. Chan starts without doctor access, so her sharing workflow can be demonstrated. Demo credentials are public fixtures and should be replaced before any real deployment. Do not use this demonstration system with real medical information.

## Architecture

- Separate build entries in `apps/medmind-patient/` and `apps/medmind-doctor/`. Shared React + TypeScript UI and styles live in `src/`; each build has its own HTML title, URL and output folder. Both call the same API. The shared UI module currently includes both role views, guarded by the route and account role.
- Node.js HTTP API in `server/index.js`, one shared backend for both roles.
- SQLite schema in `server/schema.sql`; first-run synthetic data in `server/db.js`.
- Session cookies are HttpOnly and SameSite Lax; password hashes use scrypt. Server routes check roles, patient ownership, doctor consent, and sharing scope. A production deployment must add TLS, operational controls, account recovery, and a clinical/privacy review.
- `events` represent scheduled occurrences. An unreported event has `review_status=PENDING`, `status=UNKNOWN`, no patient source, and no revision. A patient's “Not Sure” creates an explicit `UNKNOWN` revision and `NEEDS_REVIEW` workflow state. Corrections append revisions; the first report is preserved.
- Documentation Rate = patient-reported events / scheduled events through today in the past 14 days. All charts derive from stored event rows.
- `shares` enforce doctor access on every read. Revocation blocks subsequent API reads. Downloaded information cannot be recalled.
- Consultation notes remain separate from patient reports. A summary only appears in the patient app after explicit publication.

## API map

| Surface | Routes |
| --- | --- |
| Authentication | `POST /api/login`, `POST /api/logout`, `GET /api/me` |
| Patient | `GET /api/patient/dashboard`, `GET /api/patient/history`, `POST /api/patient/plans`, `PATCH /api/patient/plans/:id`, `GET/POST /api/patient/events/:id`, `PATCH /api/patient/settings` |
| Sharing | `GET /api/doctors`, `POST /api/patient/sharing`, `DELETE /api/patient/sharing/:doctorId` |
| Doctor | `GET /api/doctor/patients`, `GET /api/doctor/patients/:id`, `GET /api/doctor/patients/:id/insights`, `GET /api/doctor/patients/:id/events/:eventId`, `GET/POST /api/doctor/patients/:id/consultations`, `POST /api/doctor/patients/:id/consultations/:noteId/publish` |

## Verify

```bash
npm test
npx tsc --noEmit
npm run build
```

The integration test exercises medication plan creation, all three statuses, optional reasons, correction history, doctor access denial and grant, scope enforcement, revocation, note saving, explicit publication, patient summary read, database-backed chart counts, and persistence from a second process.

## Design previews

`previews/` contains five images exported from the editable Figma board (Today, History, My Insights, Doctor Overview, Consultation). These are design progress images, not captures of the running application. The implemented CSS uses warm amber, mint `#E9F5EE`, warm white, status-specific colors, and a red diagonal capsule mark.

Editable design board: https://www.figma.com/design/OtM4qt6KcGj4fPRfXSQJx0

## Local verification

The API and both built pages were checked over loopback, the TypeScript checker and both Vite builds passed, and the integration suite passed. The remote browser could not connect to this isolated local server, so no claim is made that the included Figma exports are runtime screenshots.

## Motion and interaction

The real patient and doctor views include a gentle pulse on pending time markers, press feedback on status actions, a saved-state transition, one-time progress fill and sheen, and a one-time logo glint on sign-in. `prefers-reduced-motion: reduce` removes the decorative animations. `previews/motion-preview.html` is an optional component study; it is not connected to the API. Use the Patient App for actual saved reports.

The patient Today, History, and My Insights views use synthetic editorial photographs as contextual headers. Doctor Overview and Consultation use a consultation desk photograph. These images are decorative and do not represent patient evidence. A small plum blossom mark is a visual accent; status always remains legible in text. Compressed JPEG assets live in `public/images`, with original generated images in `design-assets/photos`.
