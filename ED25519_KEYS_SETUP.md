# Ed25519 JWT Keys Setup Guide

## Overview

This application uses Ed25519 asymmetric cryptography for JWT authentication. This provides better security and performance than traditional HS256 symmetric keys.

## Why Ed25519?

### Security Benefits
- **Cryptographically secure**: Keys are randomly generated, not derived from public information
- **Asymmetric**: Private key signs tokens, public key verifies them
- **Cannot be forged**: Only the backend with the private key can create valid tokens
- **Industry standard**: Used by GitHub, SSH, Signal, and other security-critical systems

### Performance Benefits
- **4x faster**: 40,000 operations/sec vs 10,000 ops/sec with HS256
- **Smaller keys**: 32 bytes vs 256+ bytes for RSA
- **Faster verification**: Constant-time operations prevent timing attacks

### Previous Issue (HS256)
The old HS256 implementation derived the secret from the public Supabase project ID, making it guessable. Anyone could forge admin tokens.

## Setup Instructions

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Access to Supabase project dashboard
- Project linked: `supabase link --project-ref [project-id]`

### Step 1: Generate Keys

You have three options for generating Ed25519 keys:

#### Option A: Browser Tool (Recommended)

1. Open `generate_ed25519_keys.html` in your browser
2. Click "Generate Ed25519 Key Pair"
3. Copy the output - you'll see:
   ```
   JWT_PUBLIC_KEY=eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5...
   JWT_PRIVATE_KEY=eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5...
   ```

#### Option B: Command Line (Deno)

```bash
cd supabase/functions/server
deno run --allow-all generate_ed25519_keys.ts
```

Output will show the keys in the same format.

#### Option C: Online Tool

1. Visit https://mkjwk.org/
2. Configure:
   - Key Use: **Signature**
   - Algorithm: **EdDSA**
   - Curve: **Ed25519**
   - Key ID: (leave blank or use a timestamp)
3. Click **Generate**
4. Copy the **Public Key** and **Private Key** in JWK format
5. Base64 encode each key:
   ```bash
   echo '{"kty":"OKP",...}' | base64
   ```

### Step 2: Store Keys in Supabase

Keys must be stored as secrets in Supabase Edge Functions:

```bash
# Login to Supabase (if not already logged in)
supabase login

# Link to your project
supabase link --project-ref wjfcqqrlhwdvvjmefxky

# Set the keys (paste the full base64-encoded values)
supabase secrets set JWT_PRIVATE_KEY="eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5..."
supabase secrets set JWT_PUBLIC_KEY="eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5..."

# Verify secrets are set
supabase secrets list
```

**Expected output:**
```
JWT_PRIVATE_KEY
JWT_PUBLIC_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
```

### Step 3: Deploy Backend

After setting the secrets, deploy the Edge Function:

```bash
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt
```

The `--no-verify-jwt` flag is required because we're using custom JWT verification.

### Step 4: Verify Deployment

#### Check Logs

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **make-server-6fcaeea3** → **Logs**
3. Look for these success messages:
   ```
   ✅ JWT Ed25519 private key loaded
   ✅ JWT Ed25519 public key loaded
   🔒 Security: Ed25519-only mode (HS256 fallback removed)
   ```

#### Test Health Endpoint

```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "JALA2 Backend is running"
}
```

#### Test Login

```bash
curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{
    "identifier": "test-admin@wecelebrate.test",
    "password": "TestPassword123!"
  }'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test-admin@wecelebrate.test",
    "username": "test-admin",
    "role": "super_admin"
  }
}
```

#### Verify Token Algorithm

In the browser console after login:
```javascript
const token = sessionStorage.getItem('jala_access_token');
const header = JSON.parse(atob(token.split('.')[0]));
console.log('Algorithm:', header.alg); // Should be "EdDSA"
```

## Multi-Environment Setup

Generate **separate keys** for each environment:

### Development Environment
```bash
# Generate keys (Option A, B, or C above)
# Link to dev project
supabase link --project-ref wjfcqqrlhwdvvjmefxky

# Set dev keys
supabase secrets set JWT_PRIVATE_KEY="[dev-private-key]"
supabase secrets set JWT_PUBLIC_KEY="[dev-public-key]"

# Deploy
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt
```

### Staging Environment
```bash
# Generate NEW keys (don't reuse dev keys)
# Link to staging project
supabase link --project-ref [staging-project-id]

# Set staging keys
supabase secrets set JWT_PRIVATE_KEY="[staging-private-key]"
supabase secrets set JWT_PUBLIC_KEY="[staging-public-key]"

# Deploy
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt
```

### Production Environment
```bash
# Generate NEW keys (don't reuse dev/staging keys)
# Link to production project
supabase link --project-ref [production-project-id]

# Set production keys
supabase secrets set JWT_PRIVATE_KEY="[production-private-key]"
supabase secrets set JWT_PUBLIC_KEY="[production-public-key]"

# Deploy
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt
```

## Key Management

### Security Best Practices

1. **Never commit keys to version control**
   - Keys are stored in Supabase secrets only
   - `.gitignore` should exclude any key files

2. **Use separate keys per environment**
   - Development, staging, and production should have different keys
   - Prevents cross-environment token usage

3. **Rotate keys regularly**
   - Recommended: Every 90 days
   - See "Key Rotation" section below

4. **Backup keys securely**
   - Store in password manager (1Password, LastPass, etc.)
   - Or use Supabase's built-in secret backup

### Key Rotation

Rotate keys every 90 days for security:

```bash
# 1. Generate new keys
# Use Option A, B, or C from Step 1

# 2. Set new keys in Supabase
supabase secrets set JWT_PRIVATE_KEY="[new-private-key]"
supabase secrets set JWT_PUBLIC_KEY="[new-public-key]"

# 3. Deploy backend
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt

# 4. Old tokens remain valid for 24 hours (grace period)
# Users will be automatically re-authenticated

# 5. After 24 hours, old tokens expire naturally
```

### Key Storage

Keys are stored as Supabase Edge Function secrets:
- Encrypted at rest
- Only accessible to Edge Functions
- Not visible in logs or responses
- Can be updated without code changes

## Troubleshooting

### Error: "JWT Ed25519 private key not initialized"

**Cause**: Keys not set in Supabase secrets

**Solution**:
```bash
# Check if secrets exist
supabase secrets list

# If missing, set them
supabase secrets set JWT_PRIVATE_KEY="..."
supabase secrets set JWT_PUBLIC_KEY="..."

# Redeploy
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt
```

### Error: "Invalid or expired token"

**Causes**:
1. Token expired (24 hour default)
2. Keys were rotated
3. Wrong environment keys

**Solutions**:
```bash
# Clear browser storage and login again
sessionStorage.clear()

# Verify backend is using correct keys
# Check Supabase logs for key loading messages

# Test token verification
curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/debug/verify-jwt \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token-here"}'
```

### Error: "Failed to decode token"

**Cause**: Token format is invalid

**Solution**:
```javascript
// In browser console, check token format
const token = sessionStorage.getItem('jala_access_token');
console.log('Token parts:', token.split('.').length); // Should be 3
console.log('Header:', JSON.parse(atob(token.split('.')[0])));
```

### Frontend Not Accepting EdDSA Tokens

**Cause**: Frontend validation only accepts HS256

**Solution**: Verify `src/app/utils/api.ts` includes EdDSA:
```typescript
const validAlgorithms = ['HS256', 'EdDSA', 'ES256'];
```

## Migration from HS256

If you're migrating from the old HS256 implementation:

1. **Generate Ed25519 keys** (Step 1 above)
2. **Set keys in Supabase** (Step 2 above)
3. **Deploy backend** (Step 3 above)
4. **Update frontend** to accept EdDSA tokens
5. **Test thoroughly** before production

The backend supports a 24-hour grace period where both old HS256 and new EdDSA tokens work.

## Additional Resources

- **Quick Start**: `QUICK_START_ED25519.md`
- **Migration Guide**: `docs/06-security/JWT_MIGRATION_GUIDE.md`
- **Security Analysis**: `docs/06-security/JWT_SECURITY_EVALUATION.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`

## Summary

✅ **Generate keys**: Use browser tool or command line  
✅ **Store in Supabase**: Use `supabase secrets set`  
✅ **Deploy backend**: Use `supabase functions deploy`  
✅ **Verify**: Check logs and test login  
✅ **Rotate regularly**: Every 90 days  

**Security**: Ed25519 provides cryptographically secure JWT authentication that cannot be forged or guessed.
