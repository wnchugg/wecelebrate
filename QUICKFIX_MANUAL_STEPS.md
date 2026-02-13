# 🚀 Quick Manual Fix for Remaining Files

## ✅ Already Fixed (3 files)
- Layout.tsx
- ProductCard.tsx  
- Header.tsx

## 📋 Quick Fix Method

Since there are ~47 more files to fix, here's the **FASTEST** way:

### **Use Figma Make's Global Find & Replace**

Press **Ctrl+Shift+H** (or Cmd+Shift+H on Mac) to open Find & Replace across all files.

Then run these replacements **IN ORDER**:

---

### **Round 1: UI Components**
**Find:** `from "@/app/components/ui/`  
**Replace:** `from "./ui/`  
**Replace All** ✅

**Find:** `from '@/app/components/ui/`  
**Replace:** `from './ui/`  
**Replace All** ✅

---

### **Round 2: Components (from components directory)**
**Find:** `from "@/app/components/`  
**Replace:** `from "./`  
**Replace All** ✅

**Find:** `from '@/app/components/`  
**Replace:** `from './`  
**Replace All** ✅

**Then manually check `/components/admin/` files and change `./ui/` to `../ui/` if needed**

---

### **Round 3: Context**
**Find:** `from "@/app/context/`  
**Replace:** `from "../context/`  
**Replace All** ✅

**Find:** `from '@/app/context/`  
**Replace:** `from '../context/`  
**Replace All** ✅

---

### **Round 4: Utils**
**Find:** `from "@/app/utils/`  
**Replace:** `from "../utils/`  
**Replace All** ✅

**Find:** `from '@/app/utils/`  
**Replace:** `from '../utils/`  
**Replace All** ✅

---

### **Round 5: Types**
**Find:** `from "@/app/types/`  
**Replace:** `from "../types/`  
**Replace All** ✅

**Find:** `from '@/app/types/`  
**Replace:** `from '../types/`  
**Replace All** ✅

---

### **Round 6: Lib**
**Find:** `from "@/app/lib/`  
**Replace:** `from "../lib/`  
**Replace All** ✅

**Find:** `from '@/app/lib/`  
**Replace:** `from '../lib/`  
**Replace All** ✅

---

### **Round 7: Hooks**
**Find:** `from "@/app/hooks/`  
**Replace:** `from "../hooks/`  
**Replace All** ✅

**Find:** `from '@/app/hooks/`  
**Replace:** `from '../hooks/`  
**Replace All** ✅

---

### **Round 8: Config**
**Find:** `from "@/app/config/`  
**Replace:** `from "../config/`  
**Replace All** ✅

**Find:** `from '@/app/config/`  
**Replace:** `from '../config/`  
**Replace All** ✅

---

### **Round 9: Data**
**Find:** `from "@/app/data/`  
**Replace:** `from "../data/`  
**Replace All** ✅

**Find:** `from '@/app/data/`  
**Replace:** `from '../data/`  
**Replace All** ✅

---

### **Round 10: I18n**
**Find:** `from "@/app/i18n/`  
**Replace:** `from "../i18n/`  
**Replace All** ✅

**Find:** `from '@/app/i18n/`  
**Replace:** `from '../i18n/`  
**Replace All** ✅

---

### **Round 11: Schemas**
**Find:** `from "@/app/schemas/`  
**Replace:** `from "../schemas/`  
**Replace All** ✅

**Find:** `from '@/app/schemas/`  
**Replace:** `from '../schemas/`  
**Replace All** ✅

---

### **Round 12: Pages**
**Find:** `from "@/app/pages/`  
**Replace:** `from "../pages/`  
**Replace All** ✅

**Find:** `from '@/app/pages/`  
**Replace:** `from '../pages/`  
**Replace All** ✅

---

### **Round 13: Dynamic imports (double quotes)**
**Find:** `import("@/app/components/`  
**Replace:** `import("./`  
**Replace All** ✅

**Find:** `import("@/app/`  
**Replace:** `import("../`  
**Replace All** ✅

---

### **Round 14: Dynamic imports (single quotes)**
**Find:** `import('@/app/components/`  
**Replace:** `import('./`  
**Replace All** ✅

**Find:** `import('@/app/`  
**Replace:** `import('../`  
**Replace All** ✅

---

## ⚠️ **Special Cases to Fix Manually**

After running all replacements, check these files:

### **Files in `/components/admin/`:**
These need **two levels up** (`../../`) for most imports:

1. Open each file in `/src/app/components/admin/`
2. Change:
   - `../context/` → `../../context/`
   - `../utils/` → `../../utils/`
   - `../data/` → `../../data/`
   - `../config/` → `../../config/`
   - `../hooks/` → `../../hooks/`
   - `../types/` → `../../types/`
   - `../lib/` → `../../lib/`
3. Keep `../ui/` as is (UI components are one level up)

### **Files in `/tests/`:**
Change `../` to `../../app/` for imports from app directory

---

## ✅ **Verification**

After all replacements, verify:

```bash
# In Figma Make terminal (if available):
grep -r "@/app/" src/app/
```

**Should return: NOTHING** (empty result)

---

## 🚀 **Then Publish!**

1. Save all files (Ctrl+S or Cmd+S)
2. Click **Publish** button
3. Wait ~1-2 minutes for build
4. Get your live URL!

---

## ⏱️ **Estimated Time**

Using Global Find & Replace: **2-3 minutes** total
- 14 replacements × ~10 seconds each = ~2.5 min
- Manual fixes for admin files: ~30 seconds
- **Total: ~3 minutes**

Much faster than fixing 47 files individually! 🎉
