# Deployment Checklist

Quick reference for deploying to different environments.

## Initial Setup (One Time)

### Backend Setup
- [ ] Generate Ed25519 keys for each environment
- [ ] Store keys in Supabase secrets
- [ ] Deploy Edge Function to each environment
- [ ] Verify backend health endpoints

### Netlify Setup
- [ ] Configure production branch to `production`
- [ ] Add branch deploys for `development` and `main`
- [ ] Set environment variables per branch
- [ ] Enable deploy previews for PRs

### GitHub Setup
- [ ] Add branch protection for `production` (2 approvals)
- [ ] Add branch protection for `main` (1 approval)
- [ ] Configure required status checks

## Development Deployment

- [ ] Switch to development branch: `git checkout development`
- [ ] Make changes and commit
- [ ] Push to GitHub: `git push origin development`
- [ ] Wait for Netlify build (2-5 minutes)
- [ ] Verify deployment at dev URL
- [ ] Test admin login
- [ ] Check browser console for errors

## Staging Deployment

- [ ] Ensure development is tested and stable
- [ ] Switch to main: `git checkout main`
- [ ] Merge development: `git merge development`
- [ ] Push to GitHub: `git push origin main`
- [ ] Wait for Netlify build
- [ ] Verify deployment at staging URL
- [ ] Run full QA testing
- [ ] Get stakeholder approval

## Production Deployment

- [ ] Ensure staging is fully tested
- [ ] Switch to production: `git checkout production`
- [ ] Merge main: `git merge main`
- [ ] Tag release: `git tag -a v1.0.0 -m "Release v1.0.0"`
- [ ] Push to GitHub: `git push origin production --tags`
- [ ] Wait for Netlify build
- [ ] Verify deployment at production URL
- [ ] Test critical user flows
- [ ] Monitor for 30 minutes

## Post-Deployment Verification

### Frontend Checks
- [ ] Site loads without errors
- [ ] Admin login works
- [ ] Dashboard displays data
- [ ] No console errors
- [ ] All routes accessible

### Backend Checks
- [ ] Health endpoint responds: `/health`
- [ ] Admin login returns token
- [ ] Token algorithm is EdDSA
- [ ] API endpoints return data
- [ ] No 401/403 errors

### Performance Checks
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] No memory leaks
- [ ] No excessive re-renders

## Rollback Procedure

If issues are found:

### Quick Rollback (Netlify)
1. Go to Netlify Dashboard → Deploys
2. Find last working deployment
3. Click "Publish deploy"

### Git Rollback
```bash
git checkout production
git revert [bad-commit-hash]
git push origin production
```

## Emergency Contacts

- **DevOps**: [contact]
- **Backend**: [contact]
- **Frontend**: [contact]
- **QA**: [contact]

## Common Issues

### Build Fails
- Check Netlify build log
- Verify Node version is 20
- Check environment variables
- Test locally: `npm run build`

### Token Errors
- Verify Ed25519 keys are set
- Check token algorithm in console
- Clear browser sessionStorage
- Redeploy backend if needed

### API Errors
- Check Supabase Edge Function logs
- Verify environment variables
- Test health endpoint
- Check CORS configuration

## Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Branching Strategy](./BRANCHING_STRATEGY.md)
- [Ed25519 Setup](./ED25519_KEYS_SETUP.md)
- [Backend Deployment](./BACKEND_DEPLOYMENT_SOLUTION.md)
