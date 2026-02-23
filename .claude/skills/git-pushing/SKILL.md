---
name: git-pushing
description: Stage, commit, and push git changes with conventional commit messages. Use when user wants to commit and push changes, mentions pushing to remote, or asks to save and push their work. Also activates when user says "push changes", "commit and push", "push this", "push to github", or similar git workflow requests.
---

# Git Push Workflow

Stage relevant changes, write a conventional commit message, and push to the remote branch.

## When to Use

Automatically activate when the user:
- Asks to push or commit changes ("push this", "commit and push", "save to github")
- Completes a task and needs to commit the work
- Says "push to development" or "push to main"

## Workflow

### 1. Check what changed
```bash
git status
git diff --staged
```

### 2. Stage only source files
- Stage specific files by name rather than `git add -A`
- Never stage: `.env`, secrets, `node_modules`, `.DS_Store`

### 3. Write a conventional commit message
Choose the right prefix:
- `feat:` — new feature or capability
- `fix:` — bug fix
- `refactor:` — code reorganization, no behavior change
- `chore:` — tooling, deps, config, non-production changes
- `docs:` — documentation only

Keep the subject line under 72 characters. Add a body sentence if the "why" needs more explanation.

### 4. Commit with Co-Authored-By footer
```bash
git commit -m "$(cat <<'EOF'
<type>: <short description>

<optional body sentence explaining why>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

### 5. Push to remote
```bash
git push origin <current-branch>
```

## Notes
- Always push to `development` unless the user explicitly says `main`
- After pushing, confirm with the branch name and commit hash
- If pre-commit hooks fail, fix the issue and create a NEW commit — do NOT amend
