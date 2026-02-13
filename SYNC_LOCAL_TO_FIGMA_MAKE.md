# 🔄 Sync Local Changes to Figma Make

## ❗ The Problem

You fixed the imports locally (on your computer), but Figma Make still has the old code with `@/app/` imports.

---

## ✅ Solution Options

### **Option 1: Copy-Paste Fixed Files** (Most Reliable)

Since you have the fixed files locally, copy them one by one into Figma Make:

1. **Open the local file** (e.g., `src/app/components/Navigation.tsx`)
2. **Select all** (Ctrl+A / Cmd+A)
3. **Copy** (Ctrl+C / Cmd+C)
4. **Open the same file in Figma Make**
5. **Select all in Figma Make** (Ctrl+A / Cmd+A)
6. **Paste** (Ctrl+V / Cmd+V)
7. **Save** (Ctrl+S / Cmd+S)

Repeat for all changed files.

---

### **Option 2: Run Fix Commands INSIDE Figma Make** (Easier!)

Instead of fixing locally, run the fix commands directly in Figma Make's terminal:

1. **Open Figma Make**
2. **Look for a Terminal/Console panel** (usually at the bottom)
3. **Run the fix command directly:**

```bash
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's|from ["'\''"]@/app/components/ui/|from "./ui/|g' \
  -e 's|from ["'\''"]@/app/components/|from "./|g' \
  -e 's|from ["'\''"]@/app/context/|from "../context/|g' \
  -e 's|from ["'\''"]@/app/utils/|from "../utils/|g' \
  -e 's|from ["'\''"]@/app/data/|from "../data/|g' \
  -e 's|from ["'\''"]@/app/config/|from "../config/|g' \
  -e 's|from ["'\''"]@/app/pages/|from "../pages/|g' \
  -e 's|from ["'\''"]@/app/hooks/|from "../hooks/|g' \
  -e 's|from ["'\''"]@/app/types/|from "../types/|g' \
  -e 's|from ["'\''"]@/app/i18n/|from "../i18n/|g' \
  -e 's|from ["'\''"]@/app/lib/|from "../lib/|g' \
  -e 's|import(["'\''"]@/app/components/|import("./|g' \
  -e 's|import(["'\''"]@/app/|import("../|g' \
  {} \;
```

4. **Verify it worked:**

```bash
grep -r "@/app/" src/app/
```

5. **Save all files** (Figma Make should auto-save)

---

### **Option 3: Use Figma Make's Find & Replace** (If Available)

Some versions of Figma Make have a "Find in Files" feature:

1. **Open Find & Replace** (Ctrl+Shift+F / Cmd+Shift+F)
2. **Search for:** `from "@/app/components/ui/`
3. **Replace with:** `from "./ui/`
4. **Replace All**
5. **Repeat for each pattern:**

| Find                         | Replace             |
| ---------------------------- | ------------------- |
| `from "@/app/components/ui/` | `from "./ui/`       |
| `from "@/app/components/`    | `from "./`          |
| `from "@/app/context/`       | `from "../context/` |
| `from "@/app/utils/`         | `from "../utils/`   |
| `from "@/app/data/`          | `from "../data/`    |
| `from "@/app/config/`        | `from "../config/`  |
| `from "@/app/pages/`         | `from "../pages/`   |
| `from "@/app/hooks/`         | `from "../hooks/`   |
| `from "@/app/types/`         | `from "../types/`   |
| `from "@/app/i18n/`          | `from "../i18n/`    |
| `from "@/app/lib/`           | `from "../lib/`     |

Also search for single quotes:
| Find | Replace |
|------|---------|
| `from '@/app/components/ui/` | `from './ui/` |
| `from '@/app/components/` | `from './` |
| etc... | etc... |

---

### **Option 4: Upload/Import Project** (If Supported)

If Figma Make supports importing:

1. **Zip your local fixed files**
2. **Look for Import/Upload in Figma Make**
3. **Upload the zip**
4. **Overwrite existing files**

(This feature may or may not be available)

---

## 🎯 **RECOMMENDED: Option 2**

**Run the fix command inside Figma Make's terminal.**

This is the easiest because:

- ✅ Changes happen directly in Figma Make
- ✅ No manual copying needed
- ✅ Fixes all files at once
- ✅ Ready to publish immediately

---

## 📋 **Step-by-Step for Option 2**

### **1. Open Figma Make Terminal**

Look for:

- **Terminal** tab (bottom panel)
- **Console** tab
- **Shell** icon
- **>\_** icon

If you can't find it:

- Try keyboard shortcut: **Ctrl+`** or **Cmd+`**
- Check View menu → Terminal
- Check menu → Tools → Terminal

---

### **2. Copy This Complete Command**

```bash
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's|from ["'\''"]@/app/components/ui/|from "./ui/|g' \
  -e 's|from ["'\''"]@/app/components/|from "./|g' \
  -e 's|from ["'\''"]@/app/context/|from "../context/|g' \
  -e 's|from ["'\''"]@/app/utils/|from "../utils/|g' \
  -e 's|from ["'\''"]@/app/data/|from "../data/|g' \
  -e 's|from ["'\''"]@/app/config/|from "../config/|g' \
  -e 's|from ["'\''"]@/app/pages/|from "../pages/|g' \
  -e 's|from ["'\''"]@/app/hooks/|from "../hooks/|g' \
  -e 's|from ["'\''"]@/app/types/|from "../types/|g' \
  -e 's|from ["'\''"]@/app/i18n/|from "../i18n/|g' \
  -e 's|from ["'\''"]@/app/lib/|from "../lib/|g' \
  -e 's|import(["'\''"]@/app/components/|import("./|g' \
  -e 's|import(["'\''"]@/app/|import("../|g' \
  {} \;
```

---

### **3. Paste & Run in Figma Make Terminal**

1. Click in the terminal
2. Paste the command
3. Press Enter
4. Wait a few seconds

---

### **4. Verify**

```bash
grep -r "@/app/" src/app/
```

Should return **nothing** (empty)

---

### **5. Save & Publish**

- Files should auto-save in Figma Make
- Now click **Publish**!

---

## 🚫 **If Figma Make Has No Terminal**

If there's no terminal access in Figma Make, you'll need to:

### **Manual Fix in Figma Make UI:**

For each file with `@/app/` imports:

1. Open file in Figma Make
2. Use Find & Replace (Ctrl+H / Cmd+H)
3. Replace imports one pattern at a time
4. Save file

**Priority files to fix first:**

```
/src/app/App.tsx
/src/app/components/Navigation.tsx
/src/app/components/EventCard.tsx
/src/app/components/Layout.tsx
/src/app/components/ProductCard.tsx
/src/app/components/Header.tsx
/src/app/components/ProtectedRoute.tsx
/src/app/components/LanguageSelector.tsx
```

---

## 💡 **Quick Manual Fix Template**

Open file in Figma Make, press Ctrl+H (Find & Replace):

**Round 1:**

- Find: `@/app/components/ui/`
- Replace: `./ui/`
- Replace All

**Round 2:**

- Find: `@/app/components/`
- Replace: `./`
- Replace All

**Round 3:**

- Find: `@/app/context/`
- Replace: `../context/`
- Replace All

**Round 4:**

- Find: `@/app/utils/`
- Replace: `../utils/`
- Replace All

**Round 5:**

- Find: `@/app/types/`
- Replace: `../types/`
- Replace All

**Round 6:**

- Find: `@/app/lib/`
- Replace: `../lib/`
- Replace All

Repeat for each file.

---

## ✅ **Summary**

Your local fixes are good, but you need to:

1. **Either:** Run the fix command in Figma Make's terminal
2. **Or:** Copy-paste fixed files into Figma Make
3. **Or:** Use Find & Replace in Figma Make manually

**Then:** Publish!

---

## 🎯 **Next Steps**

1. ✅ Open Figma Make
2. ✅ Find the terminal/console
3. ✅ Run the fix command
4. ✅ Verify with grep
5. ✅ Click Publish
6. ✅ Your app is live! 🚀

---

**Let me know which option works for you!**