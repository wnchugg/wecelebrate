---
name: security-review
description: Security audit for vulnerabilities, compliance issues, and sensitive data exposure. Use before production deployments or when reviewing security-sensitive code.
---

# Security Review

Comprehensive security audit for the codebase focusing on vulnerabilities, compliance, and data protection.

## Security Checklist

### Authentication & Authorization
- [ ] No hardcoded credentials
- [ ] API keys only in environment variables
- [ ] Proper token handling
- [ ] RLS policies on Supabase tables
- [ ] JWT validation implemented correctly
- [ ] Session management secure

### Data Protection
- [ ] No sensitive data in logs
- [ ] PII properly handled
- [ ] Encryption for sensitive fields
- [ ] Input sanitization
- [ ] Output encoding
- [ ] HTTPS enforced

### API Security
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection
- [ ] CSRF tokens where needed
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Proper error handling (no stack traces exposed)

### Dependencies
- [ ] Run `npm audit`
- [ ] Check for known vulnerabilities
- [ ] Verify dependency integrity
- [ ] No outdated critical packages
- [ ] License compliance checked

### Infrastructure
- [ ] Environment variables not exposed to frontend
- [ ] Edge functions use proper auth
- [ ] Webhook endpoints validated
- [ ] CORS configured correctly
- [ ] Security headers set

### Code Quality
- [ ] No eval() or similar dangerous functions
- [ ] File uploads validated and sanitized
- [ ] Path traversal prevented
- [ ] Command injection prevented
- [ ] Deserialization safe

## Scan Commands

```bash
# Check for hardcoded secrets
grep -r "sk_" --include="*.ts" --include="*.tsx" src/
grep -r "password.*=" --include="*.ts" --include="*.tsx" src/
grep -r "api_key.*=" --include="*.ts" --include="*.tsx" src/

# Check npm vulnerabilities
npm audit

# Check for console.log with sensitive data
grep -r "console.log.*token\|password\|secret" --include="*.ts" src/

# Check for dangerous patterns
grep -r "eval(" --include="*.ts" --include="*.tsx" src/
grep -r "dangerouslySetInnerHTML" --include="*.tsx" src/
grep -r "innerHTML" --include="*.ts" --include="*.tsx" src/
```

## Report Format

| Severity | File | Issue | Remediation |
|----------|------|-------|-------------|
| Critical | path | desc  | fix         |
| High     | path | desc  | fix         |
| Medium   | path | desc  | fix         |
| Low      | path | desc  | fix         |

## Severity Levels

**Critical**: Immediate security risk, exploitable vulnerability
- Hardcoded credentials
- SQL injection vulnerabilities
- Authentication bypass
- Exposed secrets

**High**: Significant security concern
- Missing input validation
- Insecure dependencies with known CVEs
- Missing authentication on sensitive endpoints
- XSS vulnerabilities

**Medium**: Security improvement needed
- Missing rate limiting
- Weak session configuration
- Missing security headers
- Outdated dependencies (no known CVEs)

**Low**: Best practice recommendation
- Code quality issues
- Missing logging
- Documentation gaps

## Trigger Phrases

- "security review"
- "security audit"
- "check for vulnerabilities"
- "/security-review"
- "pre-deployment security check"

## Integration with CI/CD

- Run security scans before deployment
- Block deployment on critical/high severity issues
- Generate security reports for each release
- Track security metrics over time
