# Five-minute client demonstration

## One-time setup still required

Neither GitHub CLI nor Git push was authenticated during local preparation.
The official remote `gh aw add` attempt failed because `aw.yml` is not published.
No package installation, Actions run, or AI findings are claimed. Execute the
following after local preparation, stopping if a command fails.

Authenticate interactively, and manually add **`OPENAI_API_KEY`** to
`gh-aw-demo-app` → Settings → Secrets and variables → Actions. Never put its value
in a command, document, or chat.

```sh
export PATH="/opt/homebrew/bin:$PATH"
gh auth login
gh auth status

cd /Users/aakash/Documents/GitHub/gh-aw-demo-workflows
git push origin main

cd /Users/aakash/Documents/GitHub/gh-aw-demo-app
git switch main
gh aw add AakashPandya/gh-aw-demo-workflows@main
gh aw compile
gh aw validate
gh aw validate --strict
git diff
git add .github .gitattributes
git commit -m "Install central agentic PR reviewer"
git push origin main

cd /Users/aakash/.codex/worktrees/2a4c/gh-aw-demo-app
git switch demo/agentic-review
git merge --no-edit main
git push -u origin demo/agentic-review
gh pr create --base main --head demo/agentic-review \
  --title "Add order management enhancements" \
  --body "Extend order management with cancellation and streamline API responses. Existing tests and the TypeScript build pass. Please review behavior and API contracts."
```

The merge brings the installed workflow into the demo branch; it does **not**
merge the defects into `main`. Preserve generated source tracking. On another
machine, use your checkout paths and switch branches there. Check for an existing
PR before rerunning `gh pr create`.

## Before the meeting

From the demo branch, after one-time setup:

```sh
export PATH="/opt/homebrew/bin:$PATH"
npm ci
npm test
npm run build
gh aw validate --strict
gh pr checks demo/agentic-review
gh aw status pr-reviewer
gh aw logs pr-reviewer --count 1
```

Rehearse first. Open the completed CI run, reviewer run, and actual PR feedback in
separate tabs. Agent execution can exceed five minutes; use a completed rehearsal
run if the live run is pending. Never present expected findings as observed results.

## Architecture

```text
                   Platform Team
                        |
                        v
             gh-aw-demo-workflows
                        |
                     gh aw add
                        |
                        v
                 gh-aw-demo-app
                        |
                   Pull Request
                  /            \
                 v              v
          Traditional CI   Agentic Review
                 |              |
              npm test        Codex
              npm build         |
                 |              v
               PASS       Semantic Review
                                |
                                v
                         Safe PR Feedback
```

## Step 1 — Show Repo 1 (0:00–0:25)

“This repository represents the central workflow catalog maintained by our
Platform or AI Engineering team.” Show `aw.yml` and
`payload/workflows/pr-reviewer.md`. The source stays inert here.

## Step 2 — Show agent instructions (0:25–1:00)

Point out the PR trigger, `engine: codex`, permissions, safe outputs, and review
instructions. “Unlike traditional automation, we're describing the engineering
outcome rather than every implementation step.” The reviewer reads the diff and
surrounding implementation/tests to assess concrete behavioral risks.

## Step 3 — Show Repo 2 (1:00–1:20)

“This is a normal application repository consuming the centrally governed
workflow.” Show four endpoints and the installed Markdown/compiled lockfile.
Execution uses this repository's context and Actions secret.

## Step 4 — Show ci.yml (1:20–1:45)

“Traditional GitHub Actions knows exactly what commands to execute.” Show
`npm ci`, `npm test`, and `npm run build`. These deterministic checks remain
essential; the AI reviewer complements them.

## Step 5 — Show the pull request (1:45–2:10)

Open `demo/agentic-review → main`, titled “Add order management enhancements”.
Walk through the small code diff: cancellation, input validation, and profile
handling. Keep this demonstration PR unmerged.

## Step 6 — Show CI (2:10–2:35)

Show the actual passing build and tests. “From a deterministic CI perspective,
this change looks healthy.” Existing assertions cover happy paths; passing does
not establish every behavioral contract.

## Step 7 — Show the agentic run (2:35–3:00)

“The same PR is also given to an AI agent with an engineering review goal.” Show
the review run and the separation between reasoning and the safe-output job.

## Step 8 — Show findings (3:00–3:50)

Show actual feedback. Expected areas are negative quantities, missing-user
handling, unrestricted cancellation, and absent failure-path tests. “The agent
is reasoning about behavior that isn't encoded in our current test suite.”
Highlight Problem, Impact, Recommended Fix, and risk summary. Finding count,
wording, and completeness vary; engineers verify the feedback.

## Step 9 — Explain security (3:50–4:25)

“The agent does not simply receive unrestricted repository write access. GitHub
permissions limit repository access and safe outputs constrain what actions can
be written back.” Show read permissions and the one-comment maximum. There is
no approval, merge, or push output, and no shell. A separate handler owns writeback.

## Step 10 — Explain centralization (4:25–4:50)

“The platform team can maintain this workflow once and application teams can
consume the governed version through gh-aw.” Consumers fetch, review, and commit
updates. This reduces repeated setup and helps apply consistent review expectations
across teams while surfacing risks that current tests miss.

## Finish (4:50–5:00)

“GitHub Actions handles deterministic execution. The coding agent handles
reasoning. Permissions and safe outputs provide governance.”

## Presenter-only scenario notes

Clean `main` rejects negative quantities and returns 404 for unknown users. It
exposes no administrative mutation. Exactly four issues are introduced on the demo branch:

1. Quantity validation loses the positive-value constraint; zero/negative integers pass.
2. The user handler uses a non-null assertion and reads an absent user's properties,
   returning 500 instead of 404.
3. `DELETE /api/orders/:id` removes in-memory orders without authenticating an
   administrator, violating the documented admin-operation policy.
4. Cancellation adds only a success test; unauthorized callers and nonexistent
   orders are untested. No existing tests are removed or weakened.

These expectations are not guaranteed model output. Keep this checklist out of
the PR description and source comments. The reviewer is instructed to substantiate
findings from code rather than presentation notes.

## Recovery commands

Run in the application after package installation:

```sh
gh aw compile
gh aw validate
gh aw validate --strict
gh aw run pr-reviewer --ref main --raw-field pr_number=PR_NUMBER
gh aw status pr-reviewer
gh aw logs pr-reviewer --count 1 --artifacts all
gh aw update pr-reviewer
```

Replace `PR_NUMBER` with the real open PR number. `run` uses trusted `main` and
reads the selected PR head through GitHub tools. Inspect/commit updated Markdown,
lockfiles, and metadata before pushing. The agent checks for a changed head SHA
before publishing to avoid knowingly posting stale feedback.

## Verification record

Prepared with gh 2.102.0, gh-aw 0.89.21, Node 24.20.0, and npm 11.19.0.
The clean baseline's seven tests and TypeScript build pass. Ad hoc HTTP probes
also confirmed invalid quantity rejection and missing-user 404 responses; those
probes are intentionally not added to CI. The demo adds one cancellation test.

The central source/manifest pass compile, validate, and strict validation with
`--dir payload/workflows`. App workflow validation awaits real remote installation.
Docker-based scanners/container checks were unavailable and are not claimed passed.
