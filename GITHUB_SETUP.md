# GitHub Setup Guide for JALA 2

This guide will walk you through setting up GitHub version control for the JALA 2 platform.

## Prerequisites

1. **Git installed** on your computer
   - Check: `git --version`
   - Install from: https://git-scm.com/downloads

2. **GitHub account**
   - Sign up at: https://github.com

3. **GitHub CLI (optional but recommended)**
   - Install from: https://cli.github.com/
   - Or use the GitHub web interface

## Step 1: Initialize Local Repository

In your JALA 2 project directory:

```bash
# Initialize git repository
git init

# Add all files (respecting .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: JALA 2 Event Gifting Platform"
```

## Step 2: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

```bash
# Login to GitHub
gh auth login

# Create repository
gh repo create jala2-platform --private --source=. --remote=origin

# Push code
git push -u origin main
```

### Option B: Using GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `jala2-platform`
3. Description: "JALA 2 - Corporate Event Gifting Platform"
4. Choose **Private** (recommended for production code)
5. Do NOT initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

7. Connect your local repo:
```bash
git remote add origin https://github.com/YOUR_USERNAME/jala2-platform.git
git branch -M main
git push -u origin main
```

## Step 3: Set Up Branch Protection (Recommended)

1. Go to your repository on GitHub
2. Settings → Branches → Add rule
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require conversation resolution before merging

## Step 4: Configure GitHub Secrets (for CI/CD)

For automated deployments, add these secrets:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:

**For Netlify Deployment:**
- `NETLIFY_AUTH_TOKEN` - Your Netlify personal access token
- `NETLIFY_SITE_ID` - Your Netlify site ID

**For Supabase (Development):**
- `SUPABASE_ACCESS_TOKEN` - Your Supabase access token
- `DEV_PROJECT_REF` - `wjfcqqrlhwdvjmefxky`
- `VITE_DEV_SUPABASE_URL` - Your dev Supabase URL
- `VITE_DEV_SUPABASE_ANON_KEY` - Your dev anon key

**For Supabase (Production):**
- `PROD_PROJECT_REF` - `lmffeqwhrnbsbhdztwyv`
- `VITE_PROD_SUPABASE_URL` - Your prod Supabase URL
- `VITE_PROD_SUPABASE_ANON_KEY` - Your prod anon key

**For Email (Optional):**
- `RESEND_API_KEY` - Your Resend API key (if using email)

## Step 5: Recommended Workflow

### Daily Development Workflow

```bash
# Start working on a new feature
git checkout -b feature/new-feature-name

# Make changes, then stage them
git add .

# Commit with descriptive message
git commit -m "feat: Add new feature description"

# Push to GitHub
git push origin feature/new-feature-name

# Create Pull Request on GitHub
# After review and approval, merge to main
```

### Commit Message Convention

Use conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```bash
git commit -m "feat: Add employee bulk import functionality"
git commit -m "fix: Resolve backend connection error on Netlify"
git commit -m "docs: Update deployment guide with Supabase steps"
```

## Step 6: Set Up GitHub Actions (Optional)

See `/.github/workflows/deploy.yml` for automated deployment configuration.

## Important Security Notes

⚠️ **NEVER commit these files:**
- `.env` files containing API keys or secrets
- `node_modules/` directory
- Any file with passwords or tokens

✅ **Safe to commit:**
- All source code files
- Configuration templates
- Documentation
- Build scripts (without secrets)

## Recommended Repository Structure

```
jala2-platform/
├── .github/
│   └── workflows/          # GitHub Actions
├── docs/                   # Documentation
├── scripts/                # Deployment scripts
├── src/                    # Source code
├── supabase/              # Backend code
├── .gitignore             # Git ignore rules
├── README.md              # Project overview
└── package.json           # Dependencies
```

## Common Git Commands

```bash
# Check status
git status

# View changes
git diff

# Create new branch
git checkout -b branch-name

# Switch branches
git checkout branch-name

# Pull latest changes
git pull origin main

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename
```

## Collaboration Workflow

1. **Clone the repository** (for team members):
```bash
git clone https://github.com/YOUR_USERNAME/jala2-platform.git
cd jala2-platform
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your local values
```

3. **Create feature branch**:
```bash
git checkout -b feature/your-feature
```

4. **Make changes and commit**:
```bash
git add .
git commit -m "feat: Your feature description"
git push origin feature/your-feature
```

5. **Create Pull Request** on GitHub

6. **Code Review** by team member

7. **Merge** to main after approval

## Troubleshooting

### Large file error
If you accidentally try to commit a large file:
```bash
git rm --cached path/to/large/file
echo "path/to/large/file" >> .gitignore
git commit -m "Remove large file"
```

### Committed .env file by mistake
```bash
git rm --cached .env
git commit -m "Remove .env file"
git push origin main
```

Then rotate all API keys that were in that file!

### Merge conflicts
```bash
# Pull latest changes
git pull origin main

# Fix conflicts in files (look for <<<<<<, =======, >>>>>> markers)

# After fixing:
git add .
git commit -m "Resolve merge conflicts"
git push
```

## Next Steps

1. ✅ Initialize repository
2. ✅ Create GitHub repository
3. ✅ Push initial commit
4. ⬜ Set up branch protection
5. ⬜ Configure GitHub secrets
6. ⬜ Set up GitHub Actions (optional)
7. ⬜ Invite team members (if applicable)

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Questions or issues?** Check the GitHub documentation or ask your team lead.
