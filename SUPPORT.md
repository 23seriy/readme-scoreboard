# Getting Help

Thanks for using **readme-scoreboard**! Here's where to get help depending on what you need.

## Ask a question

For general questions, "how do I…", and feature ideas, please use
**[GitHub Discussions](https://github.com/23seriy/readme-scoreboard/discussions)**.
Discussions are not issues — they're the right place for open-ended questions.

## Report a bug

If something isn't working, first work through the checklist below. If the
problem persists, open a [bug report](https://github.com/23seriy/readme-scoreboard/issues/new?template=bug_report.md).

### Before you open a bug

1. Confirm you're on a supported league/team/player. See the
   [Supported Sports](https://github.com/23seriy/readme-scoreboard#supported-sports)
   section and the [team directory](TEAM_DIRECTORY.md) (or the
   [player directory](PLAYER_DIRECTORY.md) for individual sports).
2. Run the local diagnostics to rule out a config problem:
   ```bash
   npm ci --ignore-scripts
   npm run doctor -- --demo
   ```
3. Check the live badges at the top of the
   [README](https://github.com/23seriy/readme-scoreboard#project-health):
   - **API health** — if this is red, one of the public sports APIs may be down.
   - **Dependency health** — if this is red, an upstream dependency may be affected.
4. Try a `dry_run: true` run (or the demo) to confirm the action renders without touching a README.

If the checks above look fine, open the bug report with:
- The league `sport` key and `team` abbreviation you used.
- Your workflow step (`with:` block).
- Whether it fails in `dry_run`, `demo`, or a live update.
- The full error output (`npm run doctor` and the action job log).

## Security issues

Do **not** open a public issue for security problems. Follow the process in
[SECURITY.md](SECURITY.md) instead.

## Contributing

Want to add a sport or improve the project? See
[CONTRIBUTING.md](CONTRIBUTING.md) — adding a new sport is a single adapter
file and a great first contribution.
