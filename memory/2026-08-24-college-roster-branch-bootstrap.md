# Debug Report: College roster workflow branch bootstrap

- Symptom: The scheduled college roster workflow failed when it tried to publish a PR from a fresh run.
- Root cause: The workflow always ran `git fetch origin automation/college-rosters` before checking whether that remote branch existed. On the first run, the branch was absent, so Git exited with code 128 and the workflow stopped before the fallback push.
- Fix: Gate the fetch behind `git ls-remote --exit-code --heads origin "$branch"` in `.github/workflows/update-college-rosters.yml`, so first-time runs push a new branch and later runs still fetch the existing remote branch for `--force-with-lease`.
- Regression test: `tests/scripts/season-status.test.js` now checks that the workflow uses `git ls-remote` before the fetch and that the fetch uses the branch variable path.
- Evidence: `npm test` passed with 39 suites and 773 tests, `npm run lint` passed, and `git diff --check` passed.
- Status: DONE
