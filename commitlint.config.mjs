/** Conventional Commits: https://www.conventionalcommits.org */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['backend', 'frontend', 'docs', 'ci', 'deps', 'specs', 'repo']],
    'scope-empty': [0],
  },
};
