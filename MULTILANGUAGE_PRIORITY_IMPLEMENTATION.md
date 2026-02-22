# Multi-Language Content Management - Priority Implementation

## Overview

Focused implementation plan for translatable content on priority customer-facing pages. This implementation enables site administrators to configure which languages are available on their site and provide translated content for all user-facing text fields.

**Relationship to Existing I18n Work**: This implementation builds on the internationalization-improvements spec (`.kiro/specs/internationalization-improvements/`) which handles formatting (currency, dates, numbers, RTL). This document focuses on content translation management - the two systems work together to provide complete internationalization.

**Scope**: 9 priority customer-facing pages + global footer
**Estimated Effort**: 18-22 hours (2.5-3 days)
**Dependencies**: Existing LanguageContext, Site_Config, draft/publish workflow

---

## Priority Pages & Translatable Content

### 1. Welcome Page (`/welcome`)
**File**: `src/app/pages/Welcome.tsx`

**Translatable Fields:**
- `welcomePageTitle` - Main heading (e.g., "Congratulations on Your Anniversary!")
- `welcomePageMessage` - Body text/letter content
- `welcomePageButtonText` - CTA button (e.g., "Choose Your Gift")

**Current Structure:**
```typescript
currentSite.settings.welcomePageContent = {
  title: string;
  message: string;
  buttonText: string;
  imageUrl?: string;
  videoUrl?: string;
}
```

**New Structure:**
```typescript
translations.welcomePage = {
  title: { en: "...", es: "...", fr: "..." },
  message: { en: "...", es: "...", fr: "..." },
  buttonText: { en: "...", es: "...", fr: "..." }
}
```

---

### 2. Landing Page (`/landing` or `/`)
**File**: `src/app/pages/Landing.tsx`

**Translatable Fields:**
- `landingPageHeroTitle` - Hero section title
- `landingPageHeroSubtitle` - Hero section subtitle
- `landingPageHeroCTA` - Hero CTA button text
- `landingPageFeature1Title` - Feature 1 title
- `landingPageFeature1Description` - Feature 1 description
- `landingPageFeature2Title` - Feature 2 title
- `landingPageFeature2Description` - Feature 2 description
- `landingPageFeature3Title` - Feature 3 title
- `landingPageFeature3Description` - Feature 3 description

**Note**: If using page editor, all text blocks need translation support.

---

### 3. Access Validation Page (`/access-validation`)
**File**: `src/app/pages/AccessValidation.tsx`

**Translatable Fields:**
- `accessPageTitle` - Page title (e.g., "Verify Your Access")
- `accessPageDescription` - Instructions text
- `accessPageButtonText` - Submit button text
- `accessPageErrorMessage` - Custom error message
- `accessPageSuccessMessage` - Success message

---

### 4. Products/Catalog Page (`/products` or `/gift-selection`)
**File**: `src/app/pages/Products.tsx` / `src/app/pages/GiftSelection.tsx`

**Translatable Fields:**
- `catalogPageTitle` - Page heading (e.g., "Choose Your Gift")
- `catalogPageDescription` - Instructions/description
- `catalogEmptyMessage` - Message when no products (e.g., "No products found")
- `catalogFilterAllText` - "All Products" text
- `catalogSearchPlaceholder` - Search box placeholder

---

### 5. Product Detail Page (`/products/:id`)
**File**: `src/app/pages/ProductDetail.tsx`

**Translatable Fields:**
- `productDetailBackButton` - "Back to Products" text
- `productDetailAddToCart` - "Add to Cart" button
- `productDetailBuyNow` - "Buy Now" button
- `productDetailOutOfStock` - "Out of Stock" message
- `productDetailSpecifications` - "Specifications" heading
- `productDetailDescription` - "Description" heading

**Note**: Individual product names/descriptions should come from product data, not site config.

---

### 6. Checkout/Shipping Page (`/checkout`)
**File**: `src/app/pages/Checkout.tsx`

**Translatable Fields:**
- `checkoutPageTitle` - Page heading (e.g., "Checkout")
- `checkoutShippingTitle` - "Shipping Information" heading
- `checkoutPaymentTitle` - "Payment Information" heading
- `checkoutOrderSummary` - "Order Summary" heading
- `checkoutPlaceOrderButton` - "Place Order" button text
- `checkoutFreeShippingMessage` - Free shipping message

---

### 7. Review Order Page (`/review-order`)
**File**: `src/app/pages/ReviewOrder.tsx`

**Translatable Fields:**
- `reviewOrderTitle` - Page heading (e.g., "Review Your Order")
- `reviewOrderInstructions` - Instructions text
- `reviewOrderConfirmButton` - "Confirm Order" button
- `reviewOrderEditButton` - "Edit Order" button
- `reviewOrderShippingLabel` - "Shipping Address" label
- `reviewOrderItemsLabel` - "Order Items" label

---

### 8. Order Confirmation Page (`/confirmation`)
**File**: `src/app/pages/Confirmation.tsx`

**Translatable Fields:**
- `confirmationTitle` - Success heading (e.g., "Order Confirmed!")
- `confirmationMessage` - Thank you message
- `confirmationOrderNumberLabel` - "Order Number" label
- `confirmationTrackingLabel` - "Tracking Number" label
- `confirmationNextSteps` - Next steps instructions
- `confirmationContinueButton` - "Continue Shopping" button

---

### 9. Footer (Global)
**Translatable Fields:**
- `footerText` - Footer copyright/text
- `footerPrivacyLink` - "Privacy Policy" link text
- `footerTermsLink` - "Terms of Service" link text
- `footerContactLink` - "Contact Us" link text

---

## Implementation Plan

### Phase 1: Database & Backend (2 hours)

#### 1.1 Database Schema
```sql
-- Add to sites table
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS available_languages TEXT[] DEFAULT ARRAY['en'];

ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Add to draft_settings as well for draft/publish workflow
-- (translations will be stored in both live and draft)

-- Create index
CREATE INDEX IF NOT EXISTS idx_sites_available_languages 
ON sites USING GIN (available_languages);

CREATE INDEX IF NOT EXISTS idx_sites_translations 
ON sites USING GIN (translations);
```

#### 1.2 Migration Script
```sql
-- Migrate existing content to translations structure for ALL priority pages
UPDATE sites
SET translations = jsonb_build_object(
  -- Welcome Page
  'welcomePage', jsonb_build_object(
    'title', jsonb_build_object('en', COALESCE(settings->'welcomePageContent'->>'title', '')),
    'message', jsonb_build_object('en', COALESCE(settings->'welcomePageContent'->>'message', '')),
    'buttonText', jsonb_build_object('en', COALESCE(settings->'welcomePageContent'->>'buttonText', 'Choose Your Gift'))
  ),
  -- Landing Page
  'landingPage', jsonb_build_object(
    'heroTitle', jsonb_build_object('en', COALESCE(settings->'landingPage'->>'heroTitle', '')),
    'heroSubtitle', jsonb_build_object('en', COALESCE(settings->'landingPage'->>'heroSubtitle', '')),
    'heroCTA', jsonb_build_object('en', COALESCE(settings->'landingPage'->>'heroCTA', 'Get Started'))
  ),
  -- Access Validation Page
  'accessPage', jsonb_build_object(
    'title', jsonb_build_object('en', COALESCE(settings->'accessPage'->>'title', 'Verify Your Access')),
    'description', jsonb_build_object('en', COALESCE(settings->'accessPage'->>'description', '')),
    'buttonText', jsonb_build_object('en', COALESCE(settings->'accessPage'->>'buttonText', 'Submit'))
  ),
  -- Catalog Page
  'catalogPage', jsonb_build_object(
    'title', jsonb_build_object('en', COALESCE(settings->'catalogPage'->>'title', 'Choose Your Gift')),
    'description', jsonb_build_object('en', COALESCE(settings->'catalogPage'->>'description', '')),
    'emptyMessage', jsonb_build_object('en', COALESCE(settings->'catalogPage'->>'emptyMessage', 'No products found'))
  ),
  -- Product Detail Page
  'productDetail', jsonb_build_object(
    'backButton', jsonb_build_object('en', 'Back to Products'),
    'addToCart', jsonb_build_object('en', 'Add to Cart'),
    'buyNow', jsonb_build_object('en', 'Buy Now')
  ),
  -- Checkout Page
  'checkoutPage', jsonb_build_object(
    'title', jsonb_build_object('en', 'Checkout'),
    'shippingTitle', jsonb_build_object('en', 'Shipping Information'),
    'paymentTitle', jsonb_build_object('en', 'Payment Information')
  ),
  -- Review Order Page
  'reviewOrder', jsonb_build_object(
    'title', jsonb_build_object('en', 'Review Your Order'),
    'confirmButton', jsonb_build_object('en', 'Confirm Order'),
    'editButton', jsonb_build_object('en', 'Edit Order')
  ),
  -- Confirmation Page
  'confirmation', jsonb_build_object(
    'title', jsonb_build_object('en', 'Order Confirmed!'),
    'message', jsonb_build_object('en', 'Thank you for your order'),
    'orderNumberLabel', jsonb_build_object('en', 'Order Number')
  ),
  -- Footer
  'footer', jsonb_build_object(
    'text', jsonb_build_object('en', COALESCE(settings->>'footerText', '')),
    'privacyLink', jsonb_build_object('en', 'Privacy Policy'),
    'termsLink', jsonb_build_object('en', 'Terms of Service')
  )
)
WHERE translations IS NULL OR translations = '{}'::jsonb;

-- Set default language for all existing sites
UPDATE sites
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{defaultLanguage}',
  '"en"'
)
WHERE settings->>'defaultLanguage' IS NULL;
```

#### 1.3 Backend API Updates
**File**: `supabase/functions/server/crud_db.ts`

Add support for new fields in site CRUD operations.

---

### Phase 2: Core Components (4 hours)

#### 2.1 MultiLanguageSelector Component
**File**: `src/app/components/admin/MultiLanguageSelector.tsx`

```tsx
import { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n/translations';

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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = Object.entries(SUPPORTED_LANGUAGES).filter(
    ([code, name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLanguage = (code: string) => {
    if (code === defaultLanguage) return; // Can't uncheck default
    
    if (selectedLanguages.includes(code)) {
      onChange(selectedLanguages.filter(l => l !== code));
    } else {
      onChange([...selectedLanguages, code]);
    }
  };

  const setAsDefault = (code: string) => {
    if (!selectedLanguages.includes(code)) {
      onChange([...selectedLanguages, code]);
    }
    onDefaultChange(code);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search languages..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />

      {/* Language List */}
      <div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
        {filteredLanguages.map(([code, name]) => {
          const isSelected = selectedLanguages.includes(code);
          const isDefault = code === defaultLanguage;

          return (
            <div
              key={code}
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleLanguage(code)}
                  disabled={isDefault}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-gray-500">{code}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isDefault && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    Default
                  </span>
                )}
                {isSelected && !isDefault && (
                  <button
                    onClick={() => setAsDefault(code)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Set as default
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
}
```

#### 2.2 TranslatableInput Component
**File**: `src/app/components/admin/TranslatableInput.tsx`

```tsx
import { useState } from 'react';
import { Check, AlertCircle, Copy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { SUPPORTED_LANGUAGES } from '../../i18n/translations';

interface TranslatableInputProps {
  label: string;
  value: Record<string, string>;
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
  const [activeTab, setActiveTab] = useState(defaultLanguage);

  const getStatus = (lang: string) => {
    const text = value[lang] || '';
    if (text.trim()) return 'translated';
    if (lang === defaultLanguage && required) return 'required';
    return 'empty';
  };

  const copyFromDefault = (targetLang: string) => {
    const defaultText = value[defaultLanguage] || '';
    onChange(targetLang, defaultText);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {availableLanguages.map(lang => {
            const status = getStatus(lang);
            const isDefault = lang === defaultLanguage;

            return (
              <TabsTrigger
                key={lang}
                value={lang}
                className="relative"
              >
                <span>{SUPPORTED_LANGUAGES[lang]}</span>
                {isDefault && (
                  <span className="ml-1 text-xs text-blue-600">★</span>
                )}
                {status === 'translated' && (
                  <Check className="w-3 h-3 ml-1 text-green-600" />
                )}
                {status === 'required' && (
                  <AlertCircle className="w-3 h-3 ml-1 text-red-600" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {availableLanguages.map(lang => (
          <TabsContent key={lang} value={lang} className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={value[lang] || ''}
                onChange={(e) => onChange(lang, e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                required={lang === defaultLanguage && required}
              />
              {lang !== defaultLanguage && (
                <button
                  onClick={() => copyFromDefault(lang)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                  title="Copy from default language"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
            {maxLength && (
              <div className="text-xs text-gray-500 text-right">
                {(value[lang] || '').length} / {maxLength}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
```

#### 2.3 TranslatableTextarea Component
**File**: `src/app/components/admin/TranslatableTextarea.tsx`

Similar to TranslatableInput but with `<textarea>` instead of `<input>`.

#### 2.4 TranslationProgress Component
**File**: `src/app/components/admin/TranslationProgress.tsx`

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
  const calculateProgress = (lang: string) => {
    const total = requiredFields.length;
    const completed = requiredFields.filter(field => {
      const text = translations[field]?.[lang] || '';
      return text.trim().length > 0;
    }).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-3">
      {availableLanguages.map(lang => {
        const progress = calculateProgress(lang);
        const isComplete = progress === 100;

        return (
          <div key={lang} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{SUPPORTED_LANGUAGES[lang]}</span>
              <span className={isComplete ? 'text-green-600' : 'text-gray-600'}>
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isComplete ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

### Phase 3: Site Configuration Integration (3 hours)

#### 3.1 Add Language Configuration Section

Add to Site Configuration General Settings tab:

```tsx
{/* Language Configuration */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Globe className="w-5 h-5" />
      Available Languages
    </CardTitle>
    <CardDescription>
      Configure which languages are available on this site
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

#### 3.2 Replace Text Inputs with Translatable Components

Example for Welcome Page section:

```tsx
{/* Before */}
<Input
  label="Welcome Page Title"
  value={welcomePageTitle}
  onChange={(e) => setWelcomePageTitle(e.target.value)}
/>

{/* After */}
<TranslatableInput
  label="Welcome Page Title"
  value={translations.welcomePage?.title || {}}
  onChange={(lang, val) => updateTranslation('welcomePage.title', lang, val)}
  availableLanguages={availableLanguages}
  defaultLanguage={defaultLanguage}
  required
  maxLength={100}
/>
```

#### 3.3 Add Translation Progress Indicator

```tsx
<Card>
  <CardHeader>
    <CardTitle>Translation Progress</CardTitle>
  </CardHeader>
  <CardContent>
    <TranslationProgress
      translations={translations}
      availableLanguages={availableLanguages}
      requiredFields={[
        'welcomePage.title',
        'welcomePage.message',
        'welcomePage.buttonText',
        'footer.text'
      ]}
    />
  </CardContent>
</Card>
```

---

### Phase 4: Public Site Integration (3 hours)

#### 4.1 Create useSiteContent Hook
**File**: `src/app/hooks/useSiteContent.ts`

```typescript
import { useSite } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';

export function useSiteContent() {
  const { currentSite } = useSite();
  const { language } = useLanguage();

  const getTranslatedContent = (path: string, fallback: string = ''): string => {
    if (!currentSite?.translations) return fallback;

    const keys = path.split('.');
    let current: any = currentSite.translations;

    // Navigate to the field with error handling
    try {
      for (const key of keys) {
        if (!current || typeof current !== 'object') return fallback;
        if (!(key in current)) return fallback;
        current = current[key];
      }

      // Ensure we have a translations object
      if (!current || typeof current !== 'object') return fallback;

      // Get translation for current language
      const defaultLang = currentSite.settings?.defaultLanguage || 'en';

      // Try current language
      if (current[language] && typeof current[language] === 'string') {
        return current[language];
      }

      // Fallback to default language
      if (current[defaultLang] && typeof current[defaultLang] === 'string') {
        return current[defaultLang];
      }

      // Fallback to English
      if (current['en'] && typeof current['en'] === 'string') {
        return current['en'];
      }

      // Fallback to first available translation
      const translations = Object.values(current).filter(v => typeof v === 'string');
      return translations.length > 0 ? translations[0] : fallback;
    } catch (error) {
      console.warn(`Error retrieving translation for path "${path}":`, error);
      return fallback;
    }
  };

  return { getTranslatedContent };
}
```

#### 4.2 Update Public Pages

**Welcome.tsx:**
```tsx
const { getTranslatedContent } = useSiteContent();

// Replace:
const title = welcomeContent?.title || defaultTitle;
// With:
const title = getTranslatedContent('welcomePage.title', defaultTitle);

const message = getTranslatedContent('welcomePage.message', defaultMessage);
const buttonText = getTranslatedContent('welcomePage.buttonText', defaultCtaText);
```

**Products.tsx:**
```tsx
const { getTranslatedContent } = useSiteContent();

<h1>{getTranslatedContent('catalogPage.title', 'Choose Your Gift')}</h1>
<p>{getTranslatedContent('catalogPage.description', '')}</p>
```

**Checkout.tsx, Confirmation.tsx, etc.:**
Similar pattern for all priority pages.

#### 4.3 Create Translation Validation Utilities
**File**: `src/app/utils/translationValidation.ts`

```typescript
export interface TranslationValidationResult {
  isComplete: boolean;
  missingTranslations: Array<{ field: string; language: string }>;
  completionPercentage: number;
}

export function validateTranslations(
  translations: Record<string, Record<string, string>>,
  requiredFields: string[],
  availableLanguages: string[]
): TranslationValidationResult {
  const missingTranslations: Array<{ field: string; language: string }> = [];
  let totalRequired = requiredFields.length * availableLanguages.length;
  let completed = 0;

  for (const field of requiredFields) {
    for (const language of availableLanguages) {
      const value = translations[field]?.[language];
      if (value && value.trim().length > 0) {
        completed++;
      } else {
        missingTranslations.push({ field, language });
      }
    }
  }

  return {
    isComplete: missingTranslations.length === 0,
    missingTranslations,
    completionPercentage: totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 0,
  };
}

export function canPublishTranslations(
  translations: Record<string, Record<string, string>>,
  requiredFields: string[],
  defaultLanguage: string
): { canPublish: boolean; reason?: string } {
  // Check that all required fields have default language translation
  for (const field of requiredFields) {
    const value = translations[field]?.[defaultLanguage];
    if (!value || value.trim().length === 0) {
      return {
        canPublish: false,
        reason: `Missing required translation for "${field}" in default language (${defaultLanguage})`,
      };
    }
  }

  return { canPublish: true };
}
```

---

## Testing Strategy

### Unit Tests

**File**: `src/app/hooks/__tests__/useSiteContent.test.ts`

Test cases:
- Translation retrieval with valid path
- Fallback to default language when current language missing
- Fallback to English when default language missing
- Fallback to first available translation
- Fallback to provided fallback string when no translations exist
- Error handling for invalid paths
- Error handling for malformed translation objects

**File**: `src/app/utils/__tests__/translationValidation.test.ts`

Test cases:
- Validation with complete translations
- Validation with partial translations
- Validation with missing default language translations
- Completion percentage calculation
- canPublish with all required fields present
- canPublish with missing required fields

**File**: `src/app/components/admin/__tests__/TranslatableInput.test.tsx`

Test cases:
- Renders tabs for all available languages
- Shows default language first
- Displays translation status indicators
- Copy from default language functionality
- Character count display
- Validation for required fields

### Property-Based Tests

**File**: `src/app/hooks/__tests__/useSiteContent.property.test.ts`

```typescript
import fc from 'fast-check';
import { renderHook } from '@testing-library/react';

/**
 * Feature: multi-language-content
 * Property 1: Translation retrieval always returns a string
 */
it('Property 1: Translation retrieval always returns a string', () => {
  fc.assert(
    fc.property(
      fc.string(), // path
      fc.string(), // fallback
      (path, fallback) => {
        const { result } = renderHook(() => useSiteContent());
        const translated = result.current.getTranslatedContent(path, fallback);
        expect(typeof translated).toBe('string');
      }
    ),
    { numRuns: 100 }
  );
});

/**
 * Feature: multi-language-content
 * Property 2: Fallback chain always terminates with a value
 */
it('Property 2: Fallback chain always terminates with a value', () => {
  fc.assert(
    fc.property(
      fc.string(), // path
      fc.string({ minLength: 1 }), // non-empty fallback
      (path, fallback) => {
        const { result } = renderHook(() => useSiteContent());
        const translated = result.current.getTranslatedContent(path, fallback);
        expect(translated).toBeTruthy();
        expect(translated.length).toBeGreaterThan(0);
      }
    ),
    { numRuns: 100 }
  );
});
```

**File**: `src/app/utils/__tests__/translationValidation.property.test.ts`

```typescript
/**
 * Feature: multi-language-content
 * Property 3: Completion percentage is always between 0 and 100
 */
it('Property 3: Completion percentage is always between 0 and 100', () => {
  fc.assert(
    fc.property(
      fc.dictionary(fc.string(), fc.dictionary(fc.string(), fc.string())),
      fc.array(fc.string()),
      fc.array(fc.string({ minLength: 2, maxLength: 2 })),
      (translations, requiredFields, languages) => {
        const result = validateTranslations(translations, requiredFields, languages);
        expect(result.completionPercentage).toBeGreaterThanOrEqual(0);
        expect(result.completionPercentage).toBeLessThanOrEqual(100);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Tests

**File**: `src/app/pages/__tests__/Welcome.integration.test.tsx`

Test cases:
- Language switching updates all translated content
- Missing translations fall back correctly
- RTL layout works with translated content
- Translation changes reflect immediately

---

## Draft/Publish Workflow Integration

### How Translations Work with Draft/Publish

1. **Draft State**: 
   - Translations are stored in `draft_settings` JSONB column
   - Admins can edit translations without affecting live site
   - Translation progress indicator shows draft completeness

2. **Validation Before Publish**:
   - System validates that all required fields have default language translations
   - Warning shown if non-default languages are incomplete
   - Publish blocked if default language translations are missing

3. **Publishing**:
   - On publish, translations are copied from `draft_settings` to `settings`
   - Both `available_languages` and `translations` are published together
   - Live site immediately reflects new translations

4. **Partial Translations**:
   - Non-default language translations can be incomplete
   - Missing translations fall back to default language
   - Users see best available translation

### Database Schema for Draft Support

```sql
-- Ensure draft_settings also has translations support
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS draft_available_languages TEXT[] DEFAULT NULL;

-- When draft exists, use draft_available_languages
-- When published, copy to available_languages
```

---

## Implementation Timeline

### Day 1 (4 hours)
- ✅ Database schema changes
- ✅ Migration script (all 9 pages)
- ✅ Backend API updates
- ✅ MultiLanguageSelector component

### Day 2 (5 hours)
- ✅ TranslatableInput component
- ✅ TranslatableTextarea component
- ✅ TranslationProgress component
- ✅ useSiteContent hook with error handling
- ✅ Translation validation utilities

### Day 3 (5 hours)
- ✅ Site Configuration integration
- ✅ Add language selector
- ✅ Replace all priority page inputs with translatable components
- ✅ Add translation progress and validation
- ✅ Integrate with draft/publish workflow

### Day 4 (4 hours)
- ✅ Update all 9 public pages to use useSiteContent
- ✅ Update footer component
- ✅ Test language switching
- ✅ Test fallback behavior

### Day 5 (4 hours)
- ✅ Unit tests for all components and utilities
- ✅ Property-based tests
- ✅ Integration tests
- ✅ Manual E2E testing
- ✅ Bug fixes
- ✅ Documentation

**Total: 22 hours (3 days)**

---

## Testing Checklist

### Admin UI Testing
- [ ] Can select multiple languages in Site Configuration
- [ ] Can set default language
- [ ] Default language cannot be unchecked
- [ ] Can enter translations for each language
- [ ] Translation progress shows correctly for each language
- [ ] Copy from default language button works
- [ ] Character count displays correctly
- [ ] Required field validation works
- [ ] Can save draft with translations
- [ ] Validation prevents publishing without default language translations
- [ ] Warning shown for incomplete non-default language translations
- [ ] Can publish complete translations

### Public Site Testing
- [ ] Public site shows correct language content for all 9 pages
- [ ] Language switching works on public site
- [ ] All translated content updates when language changes
- [ ] Fallback to default language works when translation missing
- [ ] Fallback to English works when default language missing
- [ ] Fallback to first available translation works
- [ ] RTL layout works with translated content (Arabic, Hebrew)
- [ ] Language preference persists in localStorage

### Page-Specific Testing
- [ ] Welcome page: title, message, button text
- [ ] Landing page: hero title, subtitle, CTA
- [ ] Access validation: title, description, button, messages
- [ ] Catalog page: title, description, empty message, filters
- [ ] Product detail: back button, add to cart, buy now, labels
- [ ] Checkout: page title, section headings, button text
- [ ] Review order: title, instructions, buttons, labels
- [ ] Confirmation: title, message, labels
- [ ] Footer: text, link labels

### Integration with I18n Formatting
- [ ] Currency formatting works with translated content
- [ ] Date formatting works with translated content
- [ ] Number formatting works with translated content
- [ ] RTL layout works with formatting hooks

### Error Handling
- [ ] Invalid translation paths return fallback
- [ ] Malformed translation objects handled gracefully
- [ ] Missing translations don't break UI
- [ ] Console warnings for missing translations

---

## Next Steps After Priority Implementation

1. **Email Templates** - Add translation support
2. **Page Editor** - Make all text blocks translatable
3. **Product Descriptions** - Add per-product translations
4. **Error Messages** - Translate custom error messages
5. **Admin UI** - Translate admin-facing content

---

*Implementation Plan Created: February 19, 2026*
*Priority: High*
*Estimated Effort: 18 hours*


---

## Summary of Refinements

This refined implementation plan addresses the gaps identified in the initial review:

1. **Complete Migration**: Migration script now covers all 9 priority pages, not just welcome page and footer
2. **Robust Error Handling**: useSiteContent hook includes comprehensive error handling and type checking
3. **Validation System**: Added translationValidation utilities for completeness checking and publish validation
4. **Testing Strategy**: Comprehensive unit tests, property-based tests, and integration tests defined
5. **Draft/Publish Integration**: Clear documentation of how translations work with the existing draft/publish workflow
6. **Expanded Timeline**: Realistic 22-hour estimate (3 days) accounting for validation, testing, and error handling
7. **Detailed Testing Checklist**: Comprehensive checklist covering admin UI, public site, page-specific, integration, and error handling scenarios
8. **Integration with I18n**: Explicit connection to existing internationalization-improvements spec for formatting

## Relationship to Existing Specs

This implementation complements the existing `.kiro/specs/internationalization-improvements/` spec:

- **This spec (Multi-Language Content)**: Manages site-specific translatable content (page titles, messages, labels)
- **I18n Improvements spec**: Handles formatting (currency, dates, numbers, RTL layout, name formatting)
- **Together**: Provide complete internationalization - translated content displayed with locale-appropriate formatting

## Next Steps

1. ✅ Review this refined implementation plan
2. If approved, begin implementation following the 5-day timeline
3. Start with Phase 1 (Database & Backend) on Day 1
4. Follow the testing strategy throughout implementation
5. Use the testing checklist for final validation

---

*Implementation Plan Created: February 19, 2026*
*Last Updated: February 19, 2026*
*Priority: High*
*Estimated Effort: 22 hours (3 days)*
*Status: Ready for Implementation*
