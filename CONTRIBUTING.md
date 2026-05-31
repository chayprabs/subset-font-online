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

## License

By contributing, you agree that your contributions are licensed under the same terms as the project (MIT for web/core, AGPL for worker changes).
