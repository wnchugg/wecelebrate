# JALA2 Deployment Guide

Quick reference for deploying the JALA2 application.

---

## Backend Deployment

### Deploy to Development

```bash
./deploy-backend.sh dev
```

### Deploy to Production

```bash
./deploy-backend.sh prod
```

**What it does:**
1. Renames `server` folder to `make-server-6fcaeea3`
2. Deploys to Supabase Edge Functions
3. Renames back to `server`
4. Tests the health endpoint
5. Shows deployment status

---

## Environment Setup

### Required Secrets in Supabase

Make sure these are set in **Supabase Dashboard → Project Settings → Edge Functions → Secrets**:

- `JWT_PUBLIC_KEY` - Ed25519 public key (base64 encoded)
- `JWT_PRIVATE_KEY` - Ed25519 private key (base64 encoded)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Generate JWT Keys

If you need to generate new Ed25519 keys:

1. Open `generate_ed25519_keys.html` in your browser
2. Click "Generate Ed25519 Key Pair"
3. Copy the environment variables
4. Add them to Supabase secrets

---

## Project References

- **Development:** `wjfcqqrlhwdvvjmefxky`
- **Production:** `lmffeqwhrnbsbhdztwyv`

---

## URLs

### Development
- Backend: `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3`
- Health: `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health`

### Production
- Backend: `https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3`
- Health: `https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health`

---

## Troubleshooting

### Health Check Fails

```bash
# View logs
supabase functions logs make-server-6fcaeea3

# Check if JWT keys are set
# Go to Supabase Dashboard → Edge Functions → Secrets
```

### Deployment Fails

```bash
# Make sure you're logged in
supabase login

# Link to project
supabase link --project-ref wjfcqqrlhwdvvjmefxky

# Try deploying again
./deploy-backend.sh dev
```

### Function Not Found

The function name is `make-server-6fcaeea3`, not `server`. The deployment script handles the renaming automatically.

---

## Quick Commands

```bash
# Deploy to dev
./deploy-backend.sh dev

# Deploy to prod (with confirmation)
./deploy-backend.sh prod

# View logs
supabase functions logs make-server-6fcaeea3

# Test health endpoint
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

---

## Security Notes

- Ed25519 keys are cryptographically secure
- Never commit JWT private keys to version control
- Rotate keys every 90 days
- Use different keys for dev and prod

---

**Last Updated:** February 15, 2026
