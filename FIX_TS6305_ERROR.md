# Fix TypeScript TS6305 Error - vite.config.d.ts

## 🐛 The Error

```
error TS6305: Output file '/Users/nicholuschugg/Downloads/Redesign JALA 2 App/vite.config.d.ts' 
has not been built from source file '/Users/nicholuschugg/Downloads/Redesign JALA 2 App/vite.config.ts'.
```

## 🎯 Root Cause

This error occurs when:
1. A **stale declaration file** (`vite.config.d.ts`) exists on your local machine
2. TypeScript thinks it was generated from `vite.config.ts` but it wasn't
3. The file is a leftover build artifact from a previous compilation

## ✅ Solution: Delete the Stale File

### **Option 1: Use npm script (Recommended)**

```bash
npm run clean
```

Then run type-check again:
```bash
npm run type-check
```

If you still have issues, use the deep clean:
```bash
npm run clean:all
npm run type-check
```

---

### **Option 2: Manual Deletion**

**On Mac/Linux:**
```bash
rm vite.config.d.ts
```

**On Windows (Command Prompt):**
```cmd
del vite.config.d.ts
```

**On Windows (PowerShell):**
```powershell
Remove-Item vite.config.d.ts
```

Then verify:
```bash
npm run type-check
```

---

### **Option 3: Use Cleanup Script**

**On Mac/Linux:**
```bash
chmod +x clean-ts-artifacts.sh
./clean-ts-artifacts.sh
npm run type-check
```

**On Windows:**
```cmd
clean-ts-artifacts.bat
npm run type-check
```

---

## 🧹 What Gets Cleaned

### npm run clean
Removes:
- `vite.config.d.ts`
- `vite.config.minimal.d.ts`
- `vitest.config.d.ts`
- `playwright.config.d.ts`
- Any other `*.d.ts` files in root

### npm run clean:all
Removes everything above PLUS:
- `node_modules/.vite/` (Vite cache)
- `node_modules/.tmp/*.tsbuildinfo` (TypeScript cache)

---

## 🔍 Why This Happens

1. **Previous build:** A build process may have generated declaration files
2. **Config change:** You updated tsconfig.json or build settings
3. **Cache issue:** TypeScript's incremental cache is out of sync
4. **Git issue:** The file was accidentally committed

---

## 🛡️ Prevention

### 1. Add to .gitignore
```gitignore
# TypeScript build artifacts
*.d.ts
!src/**/*.d.ts
*.tsbuildinfo

# Vite cache
node_modules/.vite
```

### 2. Configure tsconfig.json
The tsconfig already excludes these (line 66):
```json
"exclude": [
  "node_modules",
  "dist",
  "build",
  "supabase",
  "**/*.d.ts"
]
```

### 3. Use noEmit in tsconfig
Already configured (line 27):
```json
"noEmit": true
```

This prevents TypeScript from generating declaration files.

---

## 📋 New NPM Scripts Added

```json
{
  "clean": "rm -f vite.config.d.ts vite.config.minimal.d.ts vitest.config.d.ts playwright.config.d.ts *.d.ts 2>/dev/null || true",
  "clean:all": "npm run clean && rm -rf node_modules/.vite node_modules/.tmp/*.tsbuildinfo 2>/dev/null || true"
}
```

---

## 🚀 Quick Fix Steps

1. **Run the clean command:**
   ```bash
   npm run clean
   ```

2. **Verify the file is gone:**
   ```bash
   ls -la vite.config.d.ts
   # Should output: No such file or directory
   ```

3. **Run type-check:**
   ```bash
   npm run type-check
   ```

4. **Should see:**
   ```
   ✅ No errors found
   ```

---

## ❓ Still Having Issues?

### Check if file exists:
```bash
find . -name "*.d.ts" -type f | grep -v node_modules | grep -v src
```

This will list all `.d.ts` files outside of `node_modules` and `src`.

### Nuclear option - Delete all build artifacts:
```bash
npm run clean:all
rm -rf node_modules
npm install
npm run type-check
```

---

## ✅ Expected Result

After running the cleanup:
```bash
$ npm run type-check

> wecelebrate-app@2.0.0 type-check
> tsc --noEmit

# No errors!
```

---

## 📝 Summary

**The error occurs because:** A stale `vite.config.d.ts` file exists on your local machine.

**The fix is simple:** Delete the file using `npm run clean` or manually with `rm vite.config.d.ts`

**Why it works:** TypeScript no longer sees the conflicting declaration file.

**Prevention:** The file is now in `.gitignore` and excluded from tsconfig, so it shouldn't happen again.
