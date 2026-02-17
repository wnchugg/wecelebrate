# Brand Colors Enhancement

## Summary
Added additional color fields to the brands table to support comprehensive brand styling.

## New Color Fields

1. **Body Text Color (Dark)** - `body_text_color_dark`
   - Default: `#1F2937` (gray-800)
   - For use on light backgrounds
   
2. **Body Text Color (Light)** - `body_text_color_light`
   - Default: `#F9FAFB` (gray-50)
   - For use on dark backgrounds
   
3. **Brand Accent Color 1** - `accent_color_1`
   - Optional accent color
   - No default value
   
4. **Brand Accent Color 2** - `accent_color_2`
   - Optional accent color
   - No default value

## Changes Made

### Database
- **Migration 010**: `supabase/migrations/010_add_brand_colors.sql`
  - Added 4 new color columns to brands table
  - Set default values for body text colors
  - Added column comments for documentation

### TypeScript Types
- **Updated**: `src/app/lib/apiClientPhase5A.ts`
  - Added new color fields to `Brand` interface
  - Added new color fields to `CreateBrandInput` interface
  - All new fields are optional

### UI Components
- **Updated**: `src/app/pages/admin/BrandEdit.tsx`
  - Added state variables for all new colors
  - Updated Colors & Styling tab with new color inputs
  - Each color has:
    - Color picker input
    - Text input for hex code
    - Visual preview
  - Body text colors show sample text on contrasting backgrounds
  - Accent colors only show preview if value is set

## Next Steps

1. **Run Migration**:
   ```sql
   -- Run in Supabase Dashboard SQL Editor
   -- File: supabase/migrations/010_add_brand_colors.sql
   ```

2. **Test the Feature**:
   - Go to Brands Management
   - Edit an existing brand
   - Navigate to "Colors & Styling" tab
   - Test all 6 color inputs
   - Verify colors save correctly

## UI Layout

The Colors & Styling tab now has 3 sections:
1. **Primary & Secondary Colors** (2 columns)
2. **Body Text Colors** (2 columns) - with sample text previews
3. **Accent Colors** (2 columns) - optional fields

All color inputs include:
- Color picker (visual selector)
- Text input (for manual hex entry)
- Live preview swatch

## Notes
- The color extraction feature in BrandsManagement currently only supports Primary and Secondary colors
- Additional color types can be assigned when editing a brand
- All new color fields are optional except body text colors which have defaults
