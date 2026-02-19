# Git Deployment Guide - Step by Step

## Current Status

You have changes staged and ready to commit on the `development` branch.

---

## Quick Reference Commands

```bash
# 1. Commit your changes
git commit -m "Deploy internationalization improvements"

# 2. Push to remote
git push origin development

# 3. (Optional) Merge to main/production
git checkout main
git merge development
git push origin main
```

---

## Detailed Step-by-Step Guide

### Step 1: Review Your Changes

Before committing, review what's staged:

```bash
# See summary of staged files
git status

# See detailed changes (optional)
git diff --staged
```

**What you have staged:**
- ✅ Internationalization improvements (all i18n files)
- ✅ Address input and autocomplete components
- ✅ Phone input component
- ✅ Test files (385 tests)
- ✅ Documentation files
- ✅ Build artifacts (dist/)

### Step 2: Commit Your Changes

Create a commit with a descriptive message:

```bash
git commit -m "feat: Add comprehensive internationalization support

- Add 20 language support with complete translations
- Implement RTL layout for Arabic and Hebrew
- Add currency formatting with locale awareness
- Add date/time formatting with timezone support
- Add number formatting with locale-specific separators
- Add name formatting for Western and Eastern conventions
- Add address validation for 16 countries
- Add address autocomplete with Geoapify/Google Places
- Add unit conversion (metric vs imperial)
- Add phone input component with international support
- Update 385 tests (all passing)
- Update documentation"
```

**Alternative shorter commit message:**
```bash
git commit -m "feat: Deploy internationalization improvements with 20 languages, RTL support, and locale-aware formatting"
```

**If commit fails**, you might need to configure Git:
```bash
# Set your name and email (one-time setup)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Then try commit again
git commit -m "feat: Deploy internationalization improvements"
```

### Step 3: Push to Remote Repository

Push your committed changes to the remote repository:

```bash
# Push to development branch
git push origin development
```

**If push fails with authentication error:**

#### Option A: Using Personal Access Token (Recommended)
```bash
# GitHub will prompt for username and password
# Username: your-github-username
# Password: your-personal-access-token (NOT your GitHub password)
```

To create a Personal Access Token:
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Deployment Token"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token (you won't see it again!)
7. Use this token as your password when pushing

#### Option B: Using SSH (If configured)
```bash
# If you have SSH keys set up
git push origin development
```

#### Option C: Cache Credentials (To avoid repeated prompts)
```bash
# Cache credentials for 1 hour
git config --global credential.helper 'cache --timeout=3600'

# Or store credentials permanently (less secure)
git config --global credential.helper store

# Then push
git push origin development
```

### Step 4: Verify Push Success

Check that your push was successful:

```bash
# Check remote status
git status

# Should show: "Your branch is up to date with 'origin/development'"
```

You can also verify on GitHub:
1. Go to your repository on GitHub
2. Switch to the `development` branch
3. Check that your latest commit appears

### Step 5: Deploy to Production (Optional)

If you want to deploy to production (main branch):

#### Option A: Merge via Command Line

```bash
# 1. Switch to main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Merge development into main
git merge development

# 4. Push to main
git push origin main
```

#### Option B: Create Pull Request (Recommended for teams)

1. Go to your repository on GitHub
2. Click "Pull requests" → "New pull request"
3. Base: `main` ← Compare: `development`
4. Click "Create pull request"
5. Add title: "Deploy Internationalization Improvements"
6. Add description (use the commit message details)
7. Click "Create pull request"
8. Review changes
9. Click "Merge pull request"
10. Click "Confirm merge"

---

## Common Issues and Solutions

### Issue 1: "Permission denied (publickey)"

**Solution**: Set up SSH keys or use HTTPS with Personal Access Token

```bash
# Switch to HTTPS if using SSH
git remote set-url origin https://github.com/username/repo.git

# Then push with Personal Access Token
git push origin development
```

### Issue 2: "Updates were rejected because the remote contains work"

**Solution**: Pull remote changes first

```bash
# Pull and merge remote changes
git pull origin development

# Resolve any conflicts if they appear
# Then push again
git push origin development
```

### Issue 3: "fatal: not a git repository"

**Solution**: You're not in the repository directory

```bash
# Navigate to your repository
cd /path/to/your/repository

# Verify you're in the right place
git status
```

### Issue 4: Merge Conflicts

If you get merge conflicts when pulling or merging:

```bash
# 1. See which files have conflicts
git status

# 2. Open conflicted files and look for:
# <<<<<<< HEAD
# your changes
# =======
# their changes
# >>>>>>> branch-name

# 3. Edit files to resolve conflicts (remove markers, keep desired code)

# 4. Stage resolved files
git add <resolved-file>

# 5. Complete the merge
git commit -m "Resolve merge conflicts"

# 6. Push
git push origin development
```

### Issue 5: Accidentally Committed to Wrong Branch

**Solution**: Move commit to correct branch

```bash
# If you committed to main instead of development:

# 1. Note the commit hash
git log -1

# 2. Switch to correct branch
git checkout development

# 3. Cherry-pick the commit
git cherry-pick <commit-hash>

# 4. Switch back to main
git checkout main

# 5. Reset main to before the commit
git reset --hard HEAD~1

# 6. Push both branches
git push origin development
git push origin main --force  # Use --force carefully!
```

---

## Deployment Workflow Diagram

```
Local Changes (Staged)
         ↓
    git commit
         ↓
Local Repository (development branch)
         ↓
    git push origin development
         ↓
Remote Repository (GitHub - development branch)
         ↓
    Create Pull Request OR git merge
         ↓
Remote Repository (GitHub - main branch)
         ↓
    Automatic Deployment (if configured)
         ↓
Production Environment
```

---

## Best Practices

### 1. Commit Messages

Use conventional commit format:

```bash
# Format: <type>: <description>
# Types: feat, fix, docs, style, refactor, test, chore

git commit -m "feat: add internationalization support"
git commit -m "fix: resolve date formatting issue"
git commit -m "docs: update deployment guide"
git commit -m "test: add 385 i18n tests"
```

### 2. Commit Frequency

- ✅ Commit logical units of work
- ✅ Commit working code (tests passing)
- ❌ Don't commit broken code
- ❌ Don't commit sensitive data (API keys, passwords)

### 3. Branch Strategy

```bash
# Feature branches
git checkout -b feature/internationalization
# Work on feature
git commit -m "feat: add i18n support"
git push origin feature/internationalization

# Development branch (testing)
git checkout development
git merge feature/internationalization
git push origin development

# Main branch (production)
git checkout main
git merge development
git push origin main
```

### 4. Before Pushing

Always run these checks:

```bash
# 1. Run tests
npm run test:safe

# 2. Build successfully
npm run build

# 3. Check for TypeScript errors
npm run type-check

# 4. Lint code
npm run lint

# 5. Review changes
git diff --staged
```

---

## Quick Troubleshooting

### Check Git Configuration

```bash
# View all config
git config --list

# View specific settings
git config user.name
git config user.email
git config remote.origin.url
```

### View Commit History

```bash
# View recent commits
git log --oneline -10

# View detailed commit
git show <commit-hash>

# View branch history
git log --graph --oneline --all
```

### Undo Changes

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Unstage file
git restore --staged <file>

# Discard local changes
git restore <file>
```

---

## Automated Deployment (Optional)

If you're using a hosting platform with automatic deployments:

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Link project (first time)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Link project (first time)
netlify link

# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### GitHub Actions (CI/CD)

If you have GitHub Actions configured, pushing to certain branches will trigger automatic deployment:

```bash
# Push to development → deploys to staging
git push origin development

# Push to main → deploys to production
git push origin main
```

---

## Your Current Deployment Steps

Based on your current status, here's exactly what you need to do:

### 1. Commit Your Staged Changes

```bash
git commit -m "feat: Deploy internationalization improvements

- Add 20 language support with complete translations
- Implement RTL layout for Arabic and Hebrew
- Add currency, date, number, and name formatting
- Add address validation and autocomplete
- Add phone input component
- Add 385 passing tests
- Update documentation"
```

### 2. Push to Development Branch

```bash
git push origin development
```

### 3. Verify on GitHub

1. Go to your repository on GitHub
2. Check the `development` branch
3. Verify your commit appears

### 4. Deploy to Production (When Ready)

```bash
# Option A: Direct merge
git checkout main
git merge development
git push origin main

# Option B: Pull Request (recommended)
# Create PR on GitHub from development to main
```

---

## Getting Help

If you encounter issues:

1. **Check Git status**: `git status`
2. **Check Git log**: `git log --oneline -5`
3. **Check remote**: `git remote -v`
4. **Check branch**: `git branch -a`

For more help:
- Git documentation: https://git-scm.com/doc
- GitHub guides: https://guides.github.com/
- Stack Overflow: https://stackoverflow.com/questions/tagged/git

---

## Summary

**To deploy your internationalization improvements:**

```bash
# 1. Commit
git commit -m "feat: Deploy internationalization improvements"

# 2. Push
git push origin development

# 3. (Optional) Deploy to production
git checkout main
git merge development
git push origin main
```

That's it! Your changes are now deployed. 🚀

---

*Last Updated: February 19, 2026*
*For: Internationalization Deployment*
