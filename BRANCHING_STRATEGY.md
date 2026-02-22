# Git Branching Strategy

## Branch Structure

### `production`
- **Purpose**: Production-ready code deployed to live users
- **Netlify**: Configure to deploy to production site
- **Protection**: Should be protected, requires PR approval
- **Merges from**: `main` branch only (after testing)

### `main`
- **Purpose**: Stable code ready for production
- **Netlify**: Can be used for staging/preview environment
- **Protection**: Should be protected, requires PR approval
- **Merges from**: `development` branch (after feature completion)

### `development`
- **Purpose**: Active development and testing
- **Netlify**: Configure to deploy to development site (wecelebrate.netlify.app)
- **Protection**: Optional
- **Merges from**: Feature branches

### Feature Branches
- **Naming**: `feature/description` or `fix/description`
- **Purpose**: Individual features or bug fixes
- **Merges into**: `development`
- **Lifecycle**: Delete after merge

## Workflow

### 1. Daily Development
```bash
# Work on development branch
git checkout development
git pull origin development

# Make changes, commit
git add .
git commit -m "feat: description"
git push origin development
```

### 2. New Feature
```bash
# Create feature branch from development
git checkout development
git pull origin development
git checkout -b feature/new-feature

# Work on feature
git add .
git commit -m "feat: implement new feature"
git push origin feature/new-feature

# Create PR to development on GitHub
# After approval, merge and delete feature branch
```

### 3. Release to Staging (main)
```bash
# When development is stable
git checkout main
git pull origin main
git merge development
git push origin main

# Test on staging environment
```

### 4. Release to Production
```bash
# When main is tested and ready
git checkout production
git pull origin production
git merge main
git push origin production

# Deploys to production automatically
```

## Netlify Configuration

### Development Site
- **Branch**: `development`
- **URL**: `wecelebrate-dev.netlify.app` (or similar)
- **Purpose**: Testing and development
- **Auto-deploy**: Yes

### Staging Site (Optional)
- **Branch**: `main`
- **URL**: `wecelebrate-staging.netlify.app`
- **Purpose**: Pre-production testing
- **Auto-deploy**: Yes

### Production Site
- **Branch**: `production`
- **URL**: `wecelebrate.netlify.app` (your main domain)
- **Purpose**: Live users
- **Auto-deploy**: Yes (with approval gate recommended)

## Current Status

- ✅ `production` branch created
- ✅ `main` branch exists
- ✅ `development` branch created (active)
- 🔄 Configure Netlify to deploy from appropriate branches
- 🔄 Set up branch protection rules on GitHub

## Next Steps

1. **In Netlify Dashboard**:
   - Go to Site Settings → Build & Deploy → Deploy Contexts
   - Set Production branch to `production`
   - Set Branch deploys to include `development` and `main`
   - Configure environment variables per branch if needed

2. **In GitHub**:
   - Go to Settings → Branches
   - Add branch protection rules for `production` and `main`
   - Require PR reviews before merging
   - Require status checks to pass

3. **For Team**:
   - All development work happens on `development` branch
   - Test thoroughly before merging to `main`
   - Only merge to `production` after stakeholder approval
