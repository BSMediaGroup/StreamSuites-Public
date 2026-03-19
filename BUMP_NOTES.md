# Bump Notes

## CURRENT VER= 0.4.1-alpha / PENDING VER= 0.4.2-alpha

### Technical Notes

- Public-facing version labels are loaded from the authoritative runtime export at `https://admin.streamsuites.app/runtime/exports/version.json` via `js/utils/versioning.js` and `js/utils/version-stamp.js`, so the best grounded current version remains `0.4.1-alpha`.
- `README.md` is already prepared for `v0.4.2-alpha`, which means this repo is in release-prep posture even though the runtime-fed version source has not been bumped in this task.
- Recent repo-visible UI work in `css/public-shell.css`, `css/theme-dark.css`, `js/public-shell.js`, and `js/public-pages-app.js` focused on top-bar alignment, fallback avatar behavior, shell search/footer polish, and profile share-link cleanup.
- Recent local history also added or refreshed sample clip media and clip naming fixes, which supports the current public media/gallery presentation visible in the repo.

### Human-Readable Notes

- The public shell is being tightened around everyday polish details: the user widget aligns correctly, fallback avatars are more consistent, and share-link behavior is cleaner.
- Public-facing media/demo content was refreshed at the same time, which makes this repo useful as a release-note source for both UI polish and sample-content prep.
- The repo is clearly being staged for `0.4.2-alpha`, but its displayed version still comes from the runtime export stream that currently reads `0.4.1-alpha`.

### Files / Areas Touched

- `js/public-shell.js`
- `js/public-pages-app.js`
- `css/public-shell.css`
- `css/theme-dark.css`
- `js/utils/versioning.js`
- `js/utils/version-stamp.js`
- `clips/sampleclip00.mp4`
- `clips/sampleclip01.mp4`
- `clips/sampleclip02.mp4`
- `clips/sampleclip03.mp4`
- `clips/sampleclip04.mp4`
- `README.md`

### Follow-Ups / Risks

- Keep public share-link behavior aligned with the authoritative public-profile payload as the runtime bump and export refresh happen.
- README release-state copy already references `v0.4.2-alpha`, so the actual bump pass should ensure the runtime-fed version stamp and sample-content packaging move together.
