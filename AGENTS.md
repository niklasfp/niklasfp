# AGENTS.md

GitHub profile README for `niklasfp` (repo `niklasfp/niklasfp`; GitHub shows its README.md on the profile page).

## Layout

- `README.md`: the profile page. Images use `<picture>` with `-dark`/`-light` variants.
- `scripts/profile.ts`: all text shown in the SVGs (terminal lines, stack, project cards).
- `scripts/build.ts`: generates `assets/*.svg` from `profile.ts`.
- `assets/`: generated output. It is committed, because GitHub serves the files from the repo.

## Rules

- Never hand-edit `assets/*.svg`. Edit `scripts/profile.ts` or `scripts/build.ts`, then run `node scripts/build.ts` (Node 22.18+, no dependencies, no install step).
- Adding a project card means adding it to `profile.projects` *and* adding a `<picture>` cell to the README table.
- No third-party image services (stats cards, shields, and so on). Everything is a self-hosted SVG.
- SVGs are rendered through `<img>`, so there's no JavaScript, no external fonts, and no external `href`s. Animate with SMIL or CSS only, and make sure the final frame reads well without motion.
