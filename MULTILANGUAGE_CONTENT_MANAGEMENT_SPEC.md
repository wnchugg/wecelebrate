# Multi-Language Content Management Specification

## Overview

Enable site administrators to configure which languages are available on their site and provide translated content for all user-facing text fields in the Site Configuration.

---

## Current State

### Existing Language Support
- ✅ 20 languages supported in the application
- ✅ Language selector available on public sites
- ✅ System translations for UI elements (buttons, labels, etc.)
- ❌ No per-site language configuration
- ❌ No multi-language content management for site-specific text

### Content Areas Requiring Translation

Based on the Site Configuration, these fields need multi-language support:

#### General Settings
1. **Site Name** - `siteName`
2. **Company Name** - `companyName`
3. **Footer Text** - `footerText`

#### Welcome Page
4. **Welcome Message** - `welcomeMessage`
5. **Welcome Page Title** - `welcomePageTitle`
6. **Welcome Page Subtitle** - `welcomePageSubtitle`
7. **Welcome Page Button Text** - `welcomePageButtonText`

#### Landing Page (Page Editor)
8. **Landing Page Content** - All text blocks in page editor
9. **Hero Section** - Title, subtitle, CTA text
10. **Feature Sections** - Titles and descriptions

#### Gift Selection
11. **Custom Messages** - Various user-facing messages
12. **Expired Message** - `expiredMessage`
13. **Instructions** - Gift selection instructions

#### Email Templates
14. **Email Subject Lines** - Per template
15. **Email Body Content** - Per template

---

## Proposed Solution

### 1. Database Schema Changes

#### Add `available_languages` to sites table

```sql
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS available_languages TEXT[] DEFAULT ARRAY['en'];

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_sites_available_languages 
ON sites USING GIN (available_languages);
```

#### Add `translations` JSONB column to sites table

```sql
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Example structure:
-- {
--   "siteName": {
--     "en": "Welcome to Our Store",
--     "es": "Bienvenido a Nuestra Tienda",
--     "fr": "Bienvenue dans Notre Magasin"
--   },
--   "welcomeMessage": {
--     "en": "Choose your perfect gift",
--     "es": "Elige tu regalo perfecto",
--     "fr": "Choisissez votre cadeau parfait"
--   }
-- }
```

### 2. UI Components

#### A. Language Selector Component

Add to Site Configuration General Settings tab:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Available Languages</CardTitle>
    <CardDescription>
      Select which languages are available on this site
    </CardDescription>
  </CardHeader>
  <CardContent>
    <MultiLanguageSelector
      selectedLanguages={availableLanguages}
      onChange={setAvailableLanguages}
      defaultLanguage={defaultLanguage}
      onDefaultChange={setDefaultLanguage}
    />
  </CardContent>
</Card>
```

**Features:**
- Checkbox list of all 20 supported languages
- One language must be marked as "default"
- Default language is required and cannot be unchecked
- Visual indicator for default language
- Search/filter for languages

#### B. Translatable Input Component

Replace single-language inputs with multi-language tabs:

```tsx
<TranslatableInput
  label="Site Name"
  value={translations.siteName}
  onChange={(lang, value) => updateTranslation('siteName', lang, value)}
  availableLanguages={availableLanguages}
  defaultLanguage={defaultLanguage}
  required
  maxLength={100}
/>
```

**Features:**
- Tab interface for each available language
- Default language tab shown first
- Visual indicator for:
  - ✅ Translated (has content)
  - ⚠️ Missing translation (empty)
  - 🌐 Using default (fallback)
- Character count per language
- Copy from default language button
- Validation per language

#### C. Translatable Textarea Component

For longer content:

```tsx
<TranslatableTextarea
  label="Welcome Message"
  value={translations.welcomeMessage}
  onChange={(lang, value) => updateTranslation('welcomeMessage', lang, value)}
  availableLanguages={availableLanguages}
  defaultLanguage={defaultLanguage}
  rows={4}
  maxLength={500}
/>
```

#### D. Translation Progress Indicator

Show overall translation completeness:

```tsx
<TranslationProgress
  translations={translations}
  availableLanguages={availableLanguages}
  requiredFields={['siteName', 'welcomeMessage', 'footerText']}
/>
```

**Displays:**
- Percentage complete per language
- List of missing translations
- Warning if publishing with incomplete translations

### 3. Frontend Implementation

#### A. New Components

**File: `src/app/components/admin/MultiLanguageSelector.tsx`**
```tsx
interface MultiLanguageSelectorProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  defaultLanguage: string;
  onDefaultChange: (language: string) => void;
}

export function MultiLanguageSelector({
  selectedLanguages,
  onChange,
  defaultLanguage,
  onDefaultChange
}: MultiLanguageSelectorProps) {
  // Implementation
}
```

**File: `src/app/components/admin/TranslatableInput.tsx`**
```tsx
interface TranslatableInputProps {
  label: string;
  value: Record<string, string>; // { en: "text", es: "texto" }
  onChange: (language: string, value: string) => void;
  availableLanguages: string[];
  defaultLanguage: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
}

export function TranslatableInput({
  label,
  value,
  onChange,
  availableLanguages,
  defaultLanguage,
  required,
  maxLength,
  placeholder
}: TranslatableInputProps) {
  // Implementation with tabs for each language
}
```

**File: `src/app/components/admin/TranslatableTextarea.tsx`**
```tsx
interface TranslatableTextareaProps {
  label: string;
  value: Record<string, string>;
  onChange: (language: string, value: string) => void;
  availableLanguages: string[];
  defaultLanguage: string;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}

export function TranslatableTextarea({
  label,
  value,
  onChange,
  availableLanguages,
  defaultLanguage,
  rows,
  maxLength,
  placeholder
}: TranslatableTextareaProps) {
  // Implementation
}
```

**File: `src/app/components/admin/TranslationProgress.tsx`**
```tsx
interface TranslationProgressProps {
  translations: Record<string, Record<string, string>>;
  availableLanguages: string[];
  requiredFields: string[];
}

export function TranslationProgress({
  translations,
  availableLanguages,
  requiredFields
}: TranslationProgressProps) {
  // Calculate and display translation completeness
}
```

#### B. Update SiteConfiguration.tsx

Add state for translations:

```tsx
const [availableLanguages, setAvailableLanguages] = useState<string[]>(
  currentSite?.available_languages || ['en']
);
const [defaultLanguage, setDefaultLanguage] = useState<string>(
  currentSite?.settings?.defaultLanguage || 'en'
);
const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(
  currentSite?.translations || {}
);

// Helper function to update translations
const updateTranslation = (field: string, language: string, value: string) => {
  setTranslations(prev => ({
    ...prev,
    [field]: {
      ...prev[field],
      [language]: value
    }
  }));
};
```

Replace single-language inputs:

```tsx
// Before:
<Input
  label="Site Name"
  value={siteName}
  onChange={(e) => setSiteName(e.target.value)}
/>

// After:
<TranslatableInput
  label="Site Name"
  value={translations.siteName || {}}
  onChange={updateTranslation}
  availableLanguages={availableLanguages}
  defaultLanguage={defaultLanguage}
  required
/>
```

### 4. Backend Implementation

#### A. Update Site Type Definition

**File: `src/app/types/api.types.ts`**

```typescript
export interface Site {
  id: string;
  name: string;
  // ... existing fields
  available_languages?: string[];
  translations?: Record<string, Record<string, string>>;
  settings?: {
    // ... existing settings
    defaultLanguage?: string;
  };
}
```

#### B. Update Backend API

**File: `supabase/functions/server/crud_db.ts`**

Add support for `available_languages` and `translations` columns:

```typescript
// When creating/updating sites
const siteData = {
  // ... existing fields
  available_languages: data.available_languages || ['en'],
  translations: data.translations || {}
};
```

### 5. Public Site Integration

#### A. Get Translated Content

**File: `src/app/hooks/useSiteContent.ts`** (new)

```typescript
export function useSiteContent() {
  const { currentSite } = useSite();
  const { language } = useLanguage();
  
  const getTranslatedContent = (field: string): string => {
    const translations = currentSite?.translations?.[field];
    const defaultLang = currentSite?.settings?.defaultLanguage || 'en';
    
    // Try current language
    if (translations?.[language]) {
      return translations[language];
    }
    
    // Fallback to default language
    if (translations?.[defaultLang]) {
      return translations[defaultLang];
    }
    
    // Fallback to English
    if (translations?.['en']) {
      return translations['en'];
    }
    
    // Fallback to first available translation
    const firstTranslation = Object.values(translations || {})[0];
    return firstTranslation || '';
  };
  
  return { getTranslatedContent };
}
```

#### B. Update Public Pages

Replace hardcoded content with translated content:

```tsx
// Before:
<h1>{currentSite?.name}</h1>

// After:
const { getTranslatedContent } = useSiteContent();
<h1>{getTranslatedContent('siteName')}</h1>
```

### 6. Migration Strategy

#### Phase 1: Database Setup
1. Add new columns to sites table
2. Migrate existing content to translations structure
3. Set default language to 'en' for all existing sites

#### Phase 2: Admin UI
1. Add language selector to Site Configuration
2. Add translatable input components
3. Update all text fields to use translatable components
4. Add translation progress indicator

#### Phase 3: Public Site
1. Create useSiteContent hook
2. Update public pages to use translated content
3. Ensure fallback logic works correctly

#### Phase 4: Testing & Rollout
1. Test with multiple languages
2. Test fallback scenarios
3. Test migration of existing sites
4. Deploy to production

---

## User Experience

### Admin Flow

1. **Configure Languages**
   - Admin goes to Site Configuration → General Settings
   - Selects which languages to enable (e.g., English, Spanish, French)
   - Sets default language (e.g., English)

2. **Enter Translations**
   - For each text field, admin sees tabs for each enabled language
   - Default language tab is shown first
   - Admin enters content for each language
   - Visual indicators show which languages have translations

3. **Review Completeness**
   - Translation progress indicator shows % complete per language
   - Warning if trying to publish with incomplete translations
   - Option to copy from default language for quick setup

4. **Publish**
   - Save draft with all translations
   - Publish to make translations live

### Public Site Flow

1. **Language Detection**
   - User visits site
   - Language selector shows only enabled languages
   - Default language is pre-selected

2. **Content Display**
   - All site-specific content shows in selected language
   - If translation missing, falls back to default language
   - System UI (buttons, labels) uses existing i18n system

3. **Language Switching**
   - User switches language
   - All translated content updates immediately
   - Language preference saved in localStorage

---

## Technical Considerations

### Performance
- Translations stored in JSONB for efficient querying
- Index on available_languages for filtering
- Translations loaded with site data (no extra queries)
- Frontend caching of translations

### Validation
- At least one language must be enabled
- Default language must be in available languages
- Default language translations are required
- Other language translations are optional (with warnings)

### Backward Compatibility
- Existing sites default to English only
- Existing content migrated to English translations
- Old code continues to work with fallbacks

### Scalability
- JSONB column can handle all 20 languages
- No schema changes needed to add more languages
- Efficient storage (only stores provided translations)

---

## Implementation Checklist

### Database
- [ ] Add `available_languages` column to sites table
- [ ] Add `translations` column to sites table
- [ ] Create migration script for existing sites
- [ ] Add indexes for performance

### Backend
- [ ] Update Site type definition
- [ ] Update CRUD operations to handle new fields
- [ ] Add validation for translations
- [ ] Test API endpoints

### Frontend - Components
- [ ] Create MultiLanguageSelector component
- [ ] Create TranslatableInput component
- [ ] Create TranslatableTextarea component
- [ ] Create TranslationProgress component
- [ ] Create useSiteContent hook

### Frontend - Integration
- [ ] Update SiteConfiguration with language selector
- [ ] Replace text inputs with translatable components
- [ ] Add translation progress indicator
- [ ] Update public pages to use translated content
- [ ] Test language switching

### Testing
- [ ] Unit tests for translation components
- [ ] Integration tests for Site Configuration
- [ ] E2E tests for public site language switching
- [ ] Test fallback scenarios
- [ ] Test migration of existing sites

### Documentation
- [ ] Admin user guide for translations
- [ ] Developer documentation
- [ ] API documentation
- [ ] Migration guide

---

## Future Enhancements

### Phase 2 Features
1. **Translation Memory**
   - Suggest translations based on similar content
   - Reuse translations across sites

2. **Machine Translation Integration**
   - Auto-translate button using Google Translate API
   - Review and edit machine translations

3. **Translation Workflow**
   - Mark translations as "needs review"
   - Translation approval process
   - Translation history/versioning

4. **Bulk Translation**
   - Export all content for translation
   - Import translated content
   - CSV/Excel format support

5. **Translation Analytics**
   - Track which languages are most used
   - Identify missing translations
   - Translation quality metrics

---

## Estimated Effort

- **Database Changes**: 2 hours
- **Backend API Updates**: 4 hours
- **Translation Components**: 8 hours
- **Site Configuration Integration**: 6 hours
- **Public Site Integration**: 4 hours
- **Testing**: 6 hours
- **Documentation**: 2 hours

**Total**: ~32 hours (4 days)

---

## Questions for Clarification

1. **Priority**: Which content areas are most critical to translate first?
2. **Languages**: Should all 20 languages be available, or a subset?
3. **Required vs Optional**: Which translations are required vs optional?
4. **Fallback Behavior**: What should happen if a translation is missing?
5. **Migration**: How should existing site content be migrated?
6. **Page Editor**: Should the page editor content also be translatable?
7. **Email Templates**: Should email templates be translatable per site?

---

*Specification Created: February 19, 2026*
*Feature: Multi-Language Content Management*
*Status: Awaiting Approval*
