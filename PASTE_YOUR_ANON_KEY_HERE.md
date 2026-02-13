# 🔑 PASTE YOUR ANON KEY - IMMEDIATE FIX

## 🚨 Current Error

```
Invalid JWT
```

## ⚡ IMMEDIATE FIX (2 minutes)

### Step 1: Get Your Key

**Click here**: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api

1. Look for **"Project API keys"**
2. Find the row labeled `anon` (with `public` badge)
3. Click the **copy icon** 📋 next to it
4. Your clipboard now has the key!

### Step 2: Paste Below and Tell Me

Just paste your anon key in the chat, and I'll update the file for you!

Or, if you want to do it yourself:

### Step 3: Edit the File Yourself

**File**: `/utils/supabase/info.ts`

**Current content (BROKEN)**:
```typescript
export const projectId = "wjfcqqrlhwdvvjmefxky"
export const publicAnonKey = "eyJhbGci...REPLACE_WITH_YOUR_ACTUAL_ANON_KEY"
                              ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                              This fake signature causes the error
```

**Replace with (FIXED)**:
```typescript
export const projectId = "wjfcqqrlhwdvvjmefxky"
export const publicAnonKey = "PASTE_YOUR_COMPLETE_ANON_KEY_HERE"
                              ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                              Delete everything and paste your key
```

**It should look like**:
```typescript
export const projectId = "wjfcqqrlhwdvvjmefxky"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MTI5OTAsImV4cCI6MjA1NDA4ODk5MH0.kG8fE3YxNzQwMDAwMDAwMDAwMDAw"
                              ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                              Real signature - long random string at the end
```

---

## ✅ How to Know You Did It Right

Your key should:
1. Be **~200+ characters** long
2. Have **3 parts** separated by dots: `xxx.yyy.zzz`
3. **NOT** contain the word "REPLACE" anywhere
4. End with a **long random-looking string** (the signature)

---

## 🚀 After Pasting

1. Save the file
2. Redeploy (if using Figma Make)
3. Test - error should be gone!

---

## 🆘 Need Help?

**Option 1**: Paste your anon key in the chat and say "Here's my anon key" - I'll update the file for you!

**Option 2**: Tell me "I can't find my anon key" and I'll walk you through it step-by-step

**Option 3**: Share a screenshot of your Supabase dashboard and I'll help you locate it

---

**Dashboard Direct Link**:  
https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api

**Time to fix**: ~2 minutes  
**Difficulty**: Easy ✅

---

## ℹ️ Is it Safe to Share?

**YES!** The `anon` key is designed to be public. It's safe to:
- ✅ Share in chat with me
- ✅ Commit to public repos
- ✅ Use in frontend code
- ✅ Put in documentation

**BUT NEVER share the `service_role` key - that one is secret!**
