# Agentic review demo API

A small Node.js 24, TypeScript, Express API with in-memory data and Vitest tests.
There is no database, frontend, or deployment. Restarting clears all orders.
The server binds to `127.0.0.1`; all records and actions are local demo data.

## Application

| Endpoint | Behavior |
| --- | --- |
| `GET /health` | `{ "status": "ok" }` |
| `GET /api/users/:id` | Public profile of seeded user `1` or `2`; unknown IDs return 404 |
| `POST /api/orders` | Nonblank product and positive safe-integer quantity; returns 201 |
| `GET /api/orders/:id` | Order or 404 |

Public profiles and order creation/read endpoints intentionally have no login.
Administrative mutations require a trusted, authenticated administrator identity;
a client-supplied role header is not authorization. The baseline exposes no admin
operation and integrates no identity provider.

## Setup

```sh
npm install
npm test
npm run build
npm start
```

Use `npm run dev` for development. `src/app.ts` creates an isolated store per app;
`src/server.ts` starts the listener. Keep port 3000 free, or set `PORT`.

## Normal CI

`.github/workflows/ci.yml` runs on pushes to `main` and PRs targeting `main`:

```sh
npm ci
npm test
npm run build
```

This deterministic job is separate from the agentic reviewer. Tests deliberately
cover a small set of paths. Green CI proves only the assertions it runs.

## Agentic workflow

The shared reviewer comes from
[`AakashPandya/gh-aw-demo-workflows`](https://github.com/AakashPandya/gh-aw-demo-workflows).
The catalog owns its source; this application executes an installed copy.

**Preparation status:** the package/source are locally validated. Publication and
package installation await GitHub authentication. No installed workflow is
fabricated here. Follow [DEMO.md](DEMO.md) before presenting. After installation,
keep `pr-reviewer.md`, `pr-reviewer.lock.yml`, `.gitattributes`, and all CLI-generated
tracking/action-pin files.

After publishing the catalog, run in this repository:

```sh
gh aw add AakashPandya/gh-aw-demo-workflows@main
gh aw compile
gh aw validate
gh aw validate --strict
```

Review initial safe-update warnings about the expected Codex secret references
and official action pins. Commit the generated files and publish `main` before
opening the demo PR. Never put a secret value into source.

## Required secret

Manually configure **`OPENAI_API_KEY`** in this repository's GitHub Actions secrets.
`CODEX_API_KEY` is an alternative; configure just one. Local tests/build need no key.

## Triggering and security

Same-repository PRs run on `opened`, `reopened`, and `synchronize` after installation.
Use a repository writer's PR; fork PRs are blocked and do not receive the secret.
Manual execution accepts an actual open PR number:

```sh
gh aw run pr-reviewer --ref main --raw-field pr_number=PR_NUMBER
```

Replace `PR_NUMBER`; the workflow must already be on GitHub's default branch. The
reviewer uses `engine: codex`, no model override, read-only tools, no shell, and
one bounded feedback comment. It does not approve or merge. Findings include
Problem, Impact, Recommended Fix, and a summary. Engineers make the final decision.

## Validation and troubleshooting

```sh
gh aw compile
gh aw validate
gh aw validate --strict
gh aw status pr-reviewer
gh aw logs pr-reviewer --count 1
gh aw logs pr-reviewer --count 1 --artifacts all
gh aw update pr-reviewer
```

- Missing `gh` in this Mac shell: `export PATH="/opt/homebrew/bin:$PATH"`.
- Authenticate with `gh auth login`; never paste credentials into chat or files.
- Manifest not found: push the catalog's `aw.yml` on `main`, then retry `add`.
- Workflow not found: install, commit the generated lockfile, and push `main`.
- Missing secret: configure the named Actions secret manually, then dispatch again.
- Missing feedback: inspect activation, agent, detection, safe-output, and conclusion
  logs. Check the PR is open, same-repository, and passes approved-content filtering.
  An incomplete or blocked run does not mean the code is correct.
- Local HTTP tests need loopback binding permission in restricted sandboxes.
- v0.89.21 `validate` skips external linters on its no-emit path. Container-image
  checks require Docker. Local validation does not verify the Actions runtime.

The demonstration branch is `demo/agentic-review`; never merge it into `main`.
See [DEMO.md](DEMO.md) for one-time setup, presentation, and recovery commands.
