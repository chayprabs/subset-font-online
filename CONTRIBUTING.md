# Contributing to FontOps

Thank you for your interest in contributing.

## Development setup

1. Install Node.js 22+ and pnpm 9+
2. `pnpm install`
3. `pnpm dev` for the web app
4. Optional: `docker compose up` for the QA worker

## Pull requests

- Run `pnpm typecheck` and `pnpm test` before submitting
- Use conventional commit messages
- Keep browser processing local; document any new network calls
- Do not commit fonts or other materials you are not licensed to redistribute

## Contributor license agreement

By submitting a pull request, issue comment, or other contribution to this repository, you represent that:

1. You have the right to submit the contribution;
2. Your contribution is your original work or you have permission to submit it under the licenses below;
3. You grant permission to use your contribution under the same licenses as the project.

**License mapping:**

| Path | License |
|------|---------|
| `packages/core`, `packages/web`, root docs (except worker) | MIT |
| `apps/worker` | GNU AGPL v3 |

You agree to the [Terms](/terms) and [Legal Notice](/legal-notice) when using hosted deployments maintained by the project operator.

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
