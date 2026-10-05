/**
 * Pre-commit: lint + format only the staged files, with each package's own ESLint version and
 * config (`npm run … --prefix <pkg>` runs inside that package). Type-checking and tests run in CI
 * and in `npm run verify`, which keeps commits fast.
 */
const inPkg = (pkg, files) =>
  files.map((f) => f.replace(/\\/g, '/').split(`/${pkg}/`).pop()).join(' ');

export default {
  'backend/**/*.ts': (files) => `npm run lint:files --prefix backend -- ${inPkg('backend', files)}`,
  'frontend/**/*.{ts,tsx}': (files) => [
    `npm run lint:files --prefix frontend -- ${inPkg('frontend', files)}`,
    `npm run format:files --prefix frontend -- ${inPkg('frontend', files)}`,
  ],
  '*.{md,yml,yaml}': 'prettier --write --ignore-unknown',
};
