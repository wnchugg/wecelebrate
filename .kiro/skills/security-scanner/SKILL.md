---
name: security-scanner
description: Scan codebase for security vulnerabilities including secrets, insecure dependencies, and unsafe code patterns. Use when performing automated security scans.
---

# Security Scanner Skill

Automated security scanning of codebases to identify vulnerabilities, hardcoded secrets, insecure dependencies, and unsafe coding patterns.

## When to Use

- Starting security assessment of a codebase
- Pre-commit security checks
- CI/CD pipeline security validation
- Dependency vulnerability scanning
- Secret detection in code
- Static security analysis

## Scanning Workflow

### 1. Secret Detection

**Scan for Hardcoded Secrets:**

```bash
# Using grep patterns for common secrets
grep -r -i "password\s*=\s*['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r -i "api_key\s*=\s*['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r -i "secret\s*=\s*['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r -i "token\s*=\s*['\"]" src/ --include="*.ts" --include="*.tsx"

# AWS credentials
grep -r "AKIA[0-9A-Z]{16}" src/
grep -r "aws_secret_access_key" src/

# Private keys
grep -r "BEGIN.*PRIVATE KEY" src/

# Database connection strings
grep -r "postgresql://.*:.*@" src/
grep -r "mysql://.*:.*@" src/
grep -r "mongodb://.*:.*@" src/
```

**Secrets to Look For:**
- API keys (AWS, Google Cloud, Azure, etc.)
- Database passwords
- Authentication tokens
- Private keys (SSH, TLS, etc.)
- OAuth secrets
- Encryption keys
- Service account credentials
- Third-party service keys (Stripe, Twilio, etc.)

**Deliverable:** List of files containing potential secrets with line numbers

---

### 2. Dependency Vulnerability Scanning

**Node.js Dependencies:**

```bash
# NPM audit
npm audit --json > npm-audit-report.json

# Check for outdated packages
npm outdated --json
```

**Dependency Checks:**
- Known CVEs in dependencies
- Outdated packages with security patches
- Unmaintained packages
- License compliance issues
- Transitive dependency vulnerabilities

**Deliverable:** Vulnerability report with CVE IDs, severity scores, and affected packages

---

### 3. Insecure Code Pattern Detection

**SQL Injection Vulnerabilities:**

```bash
# Look for string concatenation in SQL queries
grep -r "execute.*\+.*" src/ --include="*.ts" --include="*.tsx"
grep -r "execute.*\`.*\${" src/ --include="*.ts" --include="*.tsx"

# Look for string formatting in SQL
grep -r "SELECT.*\${" src/ --include="*.ts" --include="*.tsx"
grep -r "INSERT.*\${" src/ --include="*.ts" --include="*.tsx"
```

**Command Injection:**

```bash
# Node.js - child_process exec
grep -r "child_process.*exec" src/ --include="*.ts" --include="*.tsx"
grep -r "\.exec(" src/ --include="*.ts" --include="*.tsx"
```

**Cross-Site Scripting (XSS):**

```bash
# HTML rendering without escaping
grep -r "\.innerHTML" src/ --include="*.ts" --include="*.tsx" --include="*.jsx"
grep -r "dangerouslySetInnerHTML" src/ --include="*.tsx" --include="*.jsx"
```

**Weak Cryptography:**

```bash
# MD5, SHA1 usage
grep -r "crypto.createHash('md5')" src/ --include="*.ts" --include="*.tsx"
grep -r "crypto.createHash('sha1')" src/ --include="*.ts" --include="*.tsx"

# Weak random
grep -r "Math.random(" src/ --include="*.ts" --include="*.tsx"
```

**Deliverable:** List of insecure code patterns with file locations and severity

---

### 4. Authentication & Authorization Issues

**Missing Authentication:**

```bash
# Express/Hono routes without middleware
grep -r "app.get\|app.post" src/ --include="*.ts" -A 1
```

**Hardcoded Credentials:**

```bash
# Default passwords
grep -r "password.*=.*['\"]admin['\"]" src/
grep -r "password.*=.*['\"]password['\"]" src/
grep -r "password.*=.*['\"]123456['\"]" src/
```

**Session Management:**

```bash
# Insecure session configuration
grep -r "SESSION_COOKIE_SECURE.*false" src/ --include="*.ts"
grep -r "SESSION_COOKIE_HTTPONLY.*false" src/ --include="*.ts"
```

**Deliverable:** Authentication and authorization gaps with recommendations

---

### 5. Configuration Security

**Environment Files:**

```bash
# Check for committed .env files
find . -name ".env" -o -name ".env.*" | grep -v ".env.example"

# Check .gitignore
grep -q "\.env" .gitignore || echo "WARNING: .env not in .gitignore"
```

**Security Headers:**

```bash
# Check for security header configuration
grep -r "X-Frame-Options" src/ config/
grep -r "Content-Security-Policy" src/ config/
grep -r "X-Content-Type-Options" src/ config/
grep -r "Strict-Transport-Security" src/ config/
```

**CORS Configuration:**

```bash
# Overly permissive CORS
grep -r "Access-Control-Allow-Origin.*\*" src/ config/
grep -r "cors().*origin:.*\*" src/ --include="*.ts"
```

**Deliverable:** Configuration security issues and recommendations

---

## Scanning Output Format

Create a security scan report:

```markdown
# Security Scan Report

**Date**: [YYYY-MM-DD]
**Scan Scope**: [path/to/code]

## Summary

- **Critical Issues**: [count]
- **High Issues**: [count]
- **Medium Issues**: [count]
- **Low Issues**: [count]

## Critical Issues

### [Issue Title]

**File**: [path/to/file:line]
**Category**: [Secret/Injection/etc.]
**Severity**: Critical

**Description**: [What was found]

**Evidence**:
```
[code snippet]
```

**Recommendation**: [How to fix]

---

## Recommendations

### Immediate Actions (Critical/High)
1. [Action 1]
2. [Action 2]

### Short-term (Medium)
1. [Action 1]

### Long-term (Low)
1. [Action 1]
```

---

## Best Practices

**Secret Scanning:**
- Always scan before committing code
- Check git history for past secrets
- Use pre-commit hooks for automated scanning
- Never commit .env files
- Use secret management tools (Vault, AWS Secrets Manager)

**Dependency Scanning:**
- Scan before adding new dependencies
- Keep dependencies updated
- Monitor for new vulnerabilities
- Use lock files (package-lock.json)

**Code Pattern Detection:**
- Focus on user input handling
- Check all database queries
- Review file operations
- Validate all external inputs
- Sanitize all outputs

## Scan Frequency

- **Pre-commit**: Secret detection
- **Daily**: Dependency scanning
- **Weekly**: Full static analysis
- **Before PR**: Complete security scan
- **Before release**: Comprehensive assessment
