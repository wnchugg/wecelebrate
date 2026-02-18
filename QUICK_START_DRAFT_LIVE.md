# Draft/Live Architecture - Quick Start Guide

## 🚀 What Changed?

**Before**: Clicking "Save" immediately updated the live public site
**After**: Clicking "Save" saves to draft, clicking "Publish" updates the live site

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Run Database Migration
```sql
-- In Supabase Dashboard → SQL Editor
-- Paste and run this:

ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS draft_settings JSONB DEFAULT NULL;
```

### Step 2: Deploy Frontend
The frontend code is already updated. Just deploy it.

### Step 3: Test It
1. Edit a site configuration
2. Click "Save" → live site unchanged ✅
3. Click "Publish Site" → live site updated ✅

---

## 🎯 Key Concepts

### Draft vs Live

| Aspect | Draft | Live |
|--------|-------|------|
| **Storage** | `draft_settings` column | Regular columns |
| **Visibility** | Admin only | Public site |
| **Changes** | Immediate on save | Only on publish |
| **Endpoint** | `/v2/sites/:id/draft` | `/v2/sites/:id/live` |

### The Workflow

```
Edit → Save → Draft Saved → Publish → Live Updated
                    ↓
              (or Discard)
```

---

## 🔧 New Buttons in UI

### "Save Changes" Button
- Saves to draft
- Does NOT affect live site
- Auto-saves every 30 seconds

### "Publish Site" Button
- Shows modal with changes
- Merges draft to live
- Clears draft after publish

### "Discard Draft" Button (NEW)
- Removes all draft changes
- Reverts to live version
- Requires confirmation

---

## 📝 Common Tasks

### Task 1: Make Changes Without Publishing
```
1. Edit site configuration
2. Click "Save Changes"
3. Changes saved to draft
4. Live site unchanged
```

### Task 2: Publish Changes
```
1. Make sure changes are saved
2. Click "Publish Site"
3. Review changes in modal
4. Click "Confirm & Publish"
5. Live site updated
```

### Task 3: Discard Draft Changes
```
1. Click "Discard Draft" button
2. Confirm in dialog
3. Draft cleared
4. Page reloads with live data
```

---

## 🐛 Troubleshooting

### Problem: "Discard Draft" button not showing
**Solution**: Button only appears when there are saved draft changes

### Problem: Changes appear on live site immediately
**Solution**: Check that migration was run and frontend is deployed

### Problem: Publish modal shows no changes
**Solution**: Make sure you saved changes before clicking publish

### Problem: 401 Unauthorized errors
**Solution**: Log out and log back in to refresh your session

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `DRAFT_LIVE_IMPLEMENTATION_SUMMARY.md` | Complete overview |
| `DRAFT_LIVE_TESTING_GUIDE.md` | Detailed testing instructions |
| `DRAFT_LIVE_FRONTEND_COMPLETE.md` | Frontend implementation details |
| `DRAFT_LIVE_BACKEND_COMPLETE.md` | Backend implementation details |
| `DRAFT_LIVE_ARCHITECTURE.md` | Architecture design |

---

## ✅ Verification Checklist

- [ ] Database migration run successfully
- [ ] Frontend deployed
- [ ] Can save changes without affecting live site
- [ ] Can publish changes to live site
- [ ] Can discard draft changes
- [ ] Publish modal shows correct changes
- [ ] Auto-save works (wait 30 seconds after edit)

---

## 🎉 You're Done!

The draft/live architecture is now active. Administrators can safely edit site configurations without affecting the live public site until they're ready to publish.

**Questions?** Check the detailed documentation files listed above.

---

**Last Updated**: 2026-02-17
