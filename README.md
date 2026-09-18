# Forge — gym_workout

A complete, local-first strength and bulking tracker built with React, Vite, Tailwind CSS, Recharts, and Zod. The project includes source code, a dependency lockfile, automated tests, and a ready-built GitHub Pages site in `docs/`.

**Your publishing configuration: `Deploy from a branch` → `main` → `/docs`.**

## What is included

- **Workout logger:** record a date, exercises, and individual sets with reps and load in kg. Add/remove exercises and sets, edit sessions, and see progress badges before saving and in history.
- **Progressive overload:** per-exercise load PRs, session-volume PRs, and changes against the previous session. Backdated entries and edited sessions use chronological comparisons.
- **Body composition:** skeletal muscle mass and body fat on a Recharts graph across six calendar months, with independently labeled kg and percentage axes and six editable phase labels.
- **Physical metrics:** daily body weight, skeletal muscle mass, body fat, waist, sleep, steps, and calories. One measurement record per date, with editable history.
- **Supplement consistency:** independent daily protein powder and creatine toggles, a 14-day history, and logged-day counts for the last seven calendar days.
- **Routine manager:** editable heavy upper, heavy lower, and heavy pull templates; create, duplicate, edit, delete, and start workouts from your routines. Session changes do not alter templates.
- **Persistence:** a versioned localStorage database, validation on loading and saving, other-tab notifications, explicit save errors, and JSON export/restore with a pre-restore backup.
- **Routing:** a small hash router with lazy-loaded pages. Links such as `/gym_workout/#/workouts` work on static hosting and can be refreshed.

The app starts with empty workout/measurement history. Template loads start at 0 so you can choose your own working weights. There are no fabricated progress records, accounts, external analytics, or server dependencies.

## 1. Linux prerequisites

Use **Node.js 24** and npm. The project's minimum Node version is 22.12; `.nvmrc` selects 24. Vite's current Node requirements are documented in its [getting-started guide](https://vite.dev/guide/).

For Ubuntu/Debian, install basic tools if needed:

```bash
sudo apt update
sudo apt install -y git curl unzip
```

If nvm is already installed:

```bash
nvm install 24
nvm use 24
node --version
npm --version
```

If nvm is not installed, the following uses the tagged official nvm release. Skip the clone if you already have `~/.nvm`:

```bash
git clone --branch v0.40.7 --depth 1 https://github.com/nvm-sh/nvm.git "$HOME/.nvm"
source "$HOME/.nvm/nvm.sh"
nvm install 24
nvm use 24
```

Add the nvm initialization to your shell profile as described in the [official nvm instructions](https://github.com/nvm-sh/nvm#git-install), or source `~/.nvm/nvm.sh` in each new terminal. No Node installation commands need to run with sudo.

## 2. Use the complete downloaded project

Download `gym_workout.zip`, then extract it. Adjust the download path if your browser saves elsewhere:

```bash
mkdir -p "$HOME/forge-source"
unzip "$HOME/Downloads/gym_workout.zip" -d "$HOME/forge-source"
cd "$HOME/forge-source/gym_workout"
npm ci
npm run dev
```

Open the local address printed by Vite, normally [http://localhost:5173/](http://localhost:5173/). Stop the dev server with **Ctrl+C** before running further commands in that terminal.

`npm ci` installs every dependency from the included `package-lock.json`. Do not scaffold another Vite project inside this extracted directory.

### Optional: initialize the stack from scratch

Use this alternative only if you want to create the shell yourself in an empty parent directory. The archive already contains the finished implementation.

```bash
npm create vite@latest gym_workout -- --template react
cd gym_workout
npm install --save-exact react@19.2.8 react-dom@19.2.8 recharts@3.8.0 lucide-react@1.31.0 zod@3.25.76
npm install -D --save-exact vite@8.2.1 @vitejs/plugin-react@6.0.5 tailwindcss@4.2.1 @tailwindcss/postcss@4.2.1 postcss@8.5.26
```

Then replace the generated application/configuration files with the corresponding files from this project. Use the supplied `package.json` and lockfile together and run `npm ci`. Tailwind 4 uses the supplied PostCSS plugin and `@import "tailwindcss"`; no `tailwind.config.js` or Tailwind 3 `init -p` command is required. This follows [Tailwind's PostCSS integration](https://tailwindcss.com/docs/installation/using-postcss).

## 3. Complete project structure

Every source file below is provided in the archive.

| File or directory | Purpose |
| --- | --- |
| `package.json`, `package-lock.json`, `.nvmrc` | Pinned dependencies, scripts, and Node version |
| `vite.config.js` | React plugin, relative asset URLs, `docs/` output |
| `postcss.config.js` | Tailwind 4 integration |
| `index.html` | Vite entry document |
| `.gitignore` | Excludes dependencies and local environment files; keeps `docs/` tracked |
| `public/favicon.svg` | Local app icon |
| `scripts/postbuild.mjs` | Creates `docs/.nojekyll` |
| `src/main.jsx` | React root, provider, and error boundary |
| `src/App.jsx` | Sidebar, app layout, route selection, lazy page imports |
| `src/styles.css` | Tailwind import, design system, responsive layouts |
| `src/hooks/useHashRoute.js` | Hash routing and navigation |
| `src/hooks/useUnsavedChanges.js` | In-app link and unload warning for an edited workout |
| `src/state/AppStore.jsx` | Context provider and `useSyncExternalStore` subscription |
| `src/state/storage.js` | Read/validate/commit persistence; write failure handling |
| `src/lib/reducer.js` | Immutable, validated application actions |
| `src/lib/schema.js` | Zod schemas, IDs, normalized exercise names, validation messages |
| `src/lib/progress.js` | Volume, PRs, and chronological comparisons |
| `src/lib/dates.js` | Local date handling, six-month blocks, display formatting |
| `src/lib/backup.js` | JSON backup parsing and downloads |
| `src/data/templates.js` | Default state and three editable training templates |
| `src/components/UI.jsx` | Shared fields, badges, messages, stats, and empty states |
| `src/components/CompositionChart.jsx` | Six-month Recharts visualization |
| `src/components/SupplementToggles.jsx` | Reusable daily toggles |
| `src/components/Modal.jsx` | Native modal dialog wrapper |
| `src/components/ErrorBoundary.jsx` | Recovery screen for rendering errors |
| `src/pages/Dashboard.jsx` | Overview, weekly volume, chart, stack, recent sessions |
| `src/pages/Workouts.jsx` | Searchable workout history and progress badges |
| `src/pages/WorkoutEditor.jsx` | Create/edit a session and its sets |
| `src/pages/Metrics.jsx` | Measurement form, composition chart, editable history |
| `src/pages/Supplements.jsx` | Daily stack and 14-day history |
| `src/pages/Routines.jsx` | Routine cards and template editor |
| `src/pages/Settings.jsx` | Timeline preferences, export/import |
| `tests/core.test.mjs` | 19 core behavior tests using Node's built-in test runner |
| `docs/` | Generated, deployable static site; included and committed for Pages |

All pages use the same store. A component dispatches an action, the reducer validates it, and storage writes the complete next state before notifying React. Failed persistence leaves the last saved snapshot intact. On another tab's storage event, the app reloads the shared state. Simultaneous conflicting edits are last-write-wins.

### Routes

| URL hash | View |
| --- | --- |
| `#/` | Dashboard |
| `#/workouts` | Workout history |
| `#/workouts/new` | New session |
| `#/workouts/new?routine=upper` | New session copied from a routine |
| `#/workouts/WORKOUT_ID` | Edit a saved session |
| `#/metrics` | Body metrics |
| `#/supplements` | Daily supplement log |
| `#/routines` | Routine manager |
| `#/settings` | Timeline and backups |

Hash routing deliberately avoids server rewrite rules and a separate routing dependency.

## 4. Test and create the production build

From the project directory:

```bash
npm test
npm run build
npm run preview
```

Open [http://localhost:4173/](http://localhost:4173/). Stop the preview with **Ctrl+C**.

Run `npm test` for data and deployment regression checks. The deployment checks cover both branch publishing folders, the source-page redirect, and all production asset imports. These checks do not replace a browser rendering test.

The tests cover baseline-vs-PR behavior, volume increases, backdated edits, same-day ordering, zero-load sets, date boundaries, measurement upserts, validation, reversible supplement toggles, persistence across reloads, quota failures, corrupted data, stale tabs, and backup restoration.

`npm run build` replaces the generated `docs/` directory and writes `.nojekyll`. Keep hand-edited files in `src/`, not `docs/`. The source and production bundle contain no personal workout data: your records are created in the browser.

## 5. Push to your existing gym_workout repository

### Recommended: clone the repository first

This preserves an existing README, initial commit history, or other existing remote history. The archive has no `.git` directory, so copying the files will not replace the cloned Git metadata.

Replace `YOUR_GITHUB_USERNAME` with your username. These commands assume you already extracted the archive into `~/forge-source/gym_workout` in step 2 and that `~/projects/gym_workout` does not already exist. If it is already your local checkout, use that checkout instead of cloning again.

```bash
GYM_GITHUB_USER="YOUR_GITHUB_USERNAME"
mkdir -p "$HOME/projects"
git clone "https://github.com/$GYM_GITHUB_USER/gym_workout.git" "$HOME/projects/gym_workout"
cp -a "$HOME/forge-source/gym_workout/." "$HOME/projects/gym_workout/"
cd "$HOME/projects/gym_workout"
git branch -M main

npm ci
npm test
npm run build

git status
git add .
git commit -m "Build local-first strength and bulking tracker"
git push -u origin main
```

If you ran `npm ci` before copying, `cp -a` also copies `node_modules/` locally; it is excluded by `.gitignore`, and `npm ci` replaces it. For a smaller copy, copy the archive's extracted files before running npm in that directory.

If Git asks for an author identity, configure it for this repository and run the commit again:

```bash
git config user.name "Your Name"
git config user.email "YOUR_GITHUB_EMAIL_OR_NOREPLY_ADDRESS"
git commit -m "Build local-first strength and bulking tracker"
git push -u origin main
```

Use your normal GitHub HTTPS credential manager/token or SSH authentication. GitHub does not accept an account password for HTTPS Git operations. See [GitHub command-line authentication](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github).

### Alternative: initialize Git in the extracted project

Use this alternative **only if the remote repository is empty** and you have not used the clone workflow above:

```bash
cd "$HOME/forge-source/gym_workout"
npm ci
npm test
npm run build

git init -b main
git add .
git commit -m "Build local-first strength and bulking tracker"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/gym_workout.git
git push -u origin main
```

If the remote already has commits, use the clone workflow instead; do not force-push over them. Your repository already exists, so no `gh repo create` command is needed.

## 6. Deploy with your existing branch-based Pages setting

The app uses relative asset URLs so it can load from either supported publishing folder:

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
```

Vite's [relative base option](https://vite.dev/guide/build.html#relative-base) keeps scripts, styles, and lazy-loaded pages relative to the compiled site. If Pages serves the repository root, the source `index.html` automatically opens `docs/` while preserving the selected hash route. When Pages serves `/docs`, the app opens directly. The redirect is disabled by Vite in development and production builds.

After pushing the source and built `docs/` folder:

1. Open your `gym_workout` repository on GitHub.
2. Go to **Settings → Pages**.
3. Keep **Source: Deploy from a branch**.
4. Select **Branch: main**.
5. Select **Folder: /docs**.
6. Click **Save**.
7. Wait for the Pages deployment to finish. Check the repository's **Actions** tab for the deployment status.
8. Open the site address shown in Settings → Pages. Its expected form is `https://YOUR_GITHUB_USERNAME.github.io/gym_workout/`.

GitHub supports either a branch's root or its `/docs` folder as a publishing source. This project uses `/docs` so the editable source can live alongside the compiled app. See [GitHub's branch publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

No custom Actions workflow or `gh-pages` npm package is needed. The Vite build runs on your Linux machine; GitHub Pages publishes the committed generated files. For GitHub Free, use a public repository; availability for private repositories depends on your plan.

### Publish subsequent changes

After editing files in `src/` or project configuration:

```bash
npm test
npm run build
git add .
git commit -m "Update workout tracker"
git push
```

Always rebuild before pushing application changes. Pushing only changed JSX will not update the already-generated website. The `docs/` folder must remain tracked.

## Data rules and calculations

- All lifted loads and mass measurements use **kg**. Waist is cm, sleep is hours, and dietary energy is kcal.
- Use a consistent load convention for an exercise: e.g. total barbell load, and either combined or per-dumbbell load consistently. Changing conventions invalidates comparisons.
- Set volume = `reps × weight`. Exercise volume = sum of its set volumes. Workout volume = sum of exercise volumes.
- A **load PR** strictly exceeds the heaviest prior logged set of the same exercise. It does not claim to be a tested one-rep max.
- A **volume PR** strictly exceeds all earlier session volumes for that exercise. A percentage badge compares with its immediately preceding session.
- The first session for an exercise establishes a baseline. Tied records do not create new PR badges. Previous zero volume yields an absolute increase instead of dividing by zero.
- Exercise names are compared after trimming, collapsing whitespace, and lowercasing. Different exercises should have different names; consistently name equipment variants separately.
- Chronology uses the workout's local calendar date, creation timestamp, and an ID tie-breaker. Editing a session excludes itself; later sessions do not affect historical PR badges.
- Bodyweight/unloaded sets can use 0 kg. Reps and sets remain logged; their external-load volume is 0.
- Measurements allow blank optional fields. Missing values are not converted to zero. Muscle mass is entered from your measurement; the app does not estimate it from body fat.
- Six-month blocks use calendar months with clamped end-of-month dates. Changing the block hides out-of-range points from the chart but does not delete them.
- Supplement toggles record intake as yes/no. They do not infer total dietary protein or recommend dosages.
- localStorage key: `gym_workout:forge:v1`. Backups contain schema version 1. Imports up to 5 MB are validated before you can confirm replacement. Workouts must be saved explicitly; unfinished editor changes are not persistent records.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| App does not open | Confirm the latest Pages deployment succeeded and reload. Both **main /docs** and **main root** are supported; the root entry redirects to the built app. |
| Asset 404s | Keep `base: './'`, run `npm run build`, and commit the complete generated `docs/` folder. |
| Refreshing a route returns 404 | Use the app's hash links, such as `/gym_workout/#/metrics`. |
| Your changes do not appear | Run `npm run build`, commit `docs/`, push, and wait for the Pages deployment. |
| Vite will not start | Use Node 24 and reinstall with `npm ci`. |
| Styling is missing | Keep the Tailwind 4 PostCSS plugin, `postcss.config.js`, and the CSS import together. |
| Empty chart | Add muscle/fat values within the selected block; adjust the block start date in Settings if needed. |
| Data differs between devices or localhost/Pages | Export a JSON backup on the old origin/device and restore it on the new one. |
| A save fails | Storage may be full or blocked. The old saved state is retained. Export a backup and check browser site-storage settings. |
| Saved JSON is unreadable | The app does not overwrite it automatically. Export the stored text in Settings or restore a valid backup. |

The archive includes everything required to edit, build, and host the application. `node_modules/` is intentionally excluded and restored with `npm ci`.
