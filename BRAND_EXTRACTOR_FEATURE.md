# Brand Extractor Feature

## Overview
The Brand Extractor allows admins to automatically extract colors from any website and apply them to brand configurations. This streamlines the process of creating brand templates that match existing client websites.

## Features

### 1. Extract Colors from Website
- Enter any website URL
- Backend fetches the HTML and extracts all colors
- Filters out near-white and near-black colors
- Returns up to 12 distinct colors found in the website

### 2. Visual Color Selection
- Displays extracted colors in a grid with previews
- Shows hex color codes
- Click to assign colors to:
  - Primary color
  - Secondary color

### 3. Seamless Workflow
- Extract colors → Assign to slots → Continue to create brand
- Colors persist when transitioning from extract modal to create modal

## User Flow

1. **Navigate to Brands Management**
   - Go to `/admin/brands-management`

2. **Click "Extract from Website"**
   - Opens the extraction modal

3. **Enter Website URL**
   - Type or paste: `https://example.com`
   - Click "Extract Colors"

4. **Review Extracted Colors**
   - See up to 12 colors from the website
   - Each color shows:
     - Color preview swatch
     - Hex code
     - "Primary" and "Secondary" buttons

5. **Assign Colors**
   - Click "Primary" to set as primary color
   - Click "Secondary" to set as secondary color
   - Colors update in real-time

6. **Continue to Create Brand**
   - Click "Continue to Create Brand"
   - Opens the brand creation form
   - Colors are pre-filled
   - Complete other fields (name, description, logo)
   - Save the brand

## Technical Implementation

### Frontend (BrandsManagement.tsx)

#### State Management
```typescript
const [showExtractModal, setShowExtractModal] = useState(false);
const [extractUrl, setExtractUrl] = useState('');
const [isExtracting, setIsExtracting] = useState(false);
const [extractedColors, setExtractedColors] = useState<string[]>([]);
const [primaryColor, setPrimaryColor] = useState('#4F46E5');
const [secondaryColor, setSecondaryColor] = useState('#818CF8');
```

#### Extract Function
```typescript
const handleExtractBranding = async () => {
  const response = await fetch('/make-server-6fcaeea3/v2/brands/extract-colors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: extractUrl }),
  });
  
  const data = await response.json();
  setExtractedColors(data.colors || []);
};
```

#### Apply Color Function
```typescript
const applyExtractedColor = (color: string, target: 'primary' | 'secondary') => {
  if (target === 'primary') {
    setPrimaryColor(color);
  } else {
    setSecondaryColor(color);
  }
};
```

### Backend (endpoints_v2.ts)

#### Endpoint
```
POST /v2/brands/extract-colors
```

#### Request Body
```json
{
  "url": "https://example.com"
}
```

#### Response
```json
{
  "success": true,
  "colors": [
    "#4F46E5",
    "#818CF8",
    "#10B981",
    "#F59E0B",
    ...
  ],
  "url": "https://example.com"
}
```

#### Color Extraction Logic
1. Fetch website HTML
2. Use regex to find all color values:
   - Hex colors: `#RGB` or `#RRGGBB`
   - RGB colors: `rgb(r, g, b)`
   - RGBA colors: `rgba(r, g, b, a)`
3. Convert all to hex format
4. Filter by brightness (exclude near-white and near-black)
5. Deduplicate
6. Return top 12 colors

#### Brightness Filter
```typescript
const brightness = (r * 299 + g * 587 + b * 114) / 1000;
// Only include colors where: 30 < brightness < 240
```

## UI Components

### Extract Button
```tsx
<Button variant="outline" onClick={openExtractModal}>
  <Palette className="w-4 h-4 mr-2" />
  Extract from Website
</Button>
```

### Extract Modal
- URL input field
- Extract button with loading state
- Color grid (4 columns)
- Each color card shows:
  - Color swatch (64px height)
  - Hex code
  - Primary/Secondary buttons
- Footer with Close and Continue buttons

### Color Card
```tsx
<div className="border rounded-lg p-3">
  <div 
    className="w-full h-16 rounded mb-2"
    style={{ backgroundColor: color }}
  />
  <div className="text-xs font-mono">{color}</div>
  <div className="flex gap-1">
    <Button onClick={() => applyExtractedColor(color, 'primary')}>
      Primary
    </Button>
    <Button onClick={() => applyExtractedColor(color, 'secondary')}>
      Secondary
    </Button>
  </div>
</div>
```

## Benefits

### 1. Time Savings
- No manual color picking from screenshots
- Instant extraction of all colors
- Quick assignment to brand slots

### 2. Accuracy
- Extracts exact hex values from website
- No guessing or approximation
- Maintains brand consistency

### 3. Ease of Use
- Simple 3-step process
- Visual color selection
- No technical knowledge required

### 4. Flexibility
- Works with any public website
- Extracts multiple color options
- Admin chooses which colors to use

## Example Use Cases

### Use Case 1: New Client Onboarding
```
Client: "Acme Corp"
Website: https://acmecorp.com

1. Extract colors from acmecorp.com
2. Find: #0066CC (blue), #FF6600 (orange), #333333 (dark gray)
3. Assign: Primary = #0066CC, Secondary = #FF6600
4. Create brand: "Acme Corporate"
5. Apply to all Acme sites
```

### Use Case 2: Multi-Brand Client
```
Client: "MegaCorp"
Divisions: Corporate, Retail, Tech

1. Extract from corporate.megacorp.com → Create "MegaCorp Corporate" brand
2. Extract from retail.megacorp.com → Create "MegaCorp Retail" brand
3. Extract from tech.megacorp.com → Create "MegaCorp Tech" brand
4. Assign different brands to different sites
```

### Use Case 3: Brand Refresh
```
Client: "OldBrand Inc"
Scenario: Client updated their website with new colors

1. Extract colors from updated website
2. Update existing "OldBrand" template
3. All sites using this brand automatically get new colors
```

## Limitations & Considerations

### Current Limitations
1. Only extracts colors from HTML/inline styles
2. Doesn't parse external CSS files
3. Limited to 12 colors
4. Requires public website (no authentication)

### Future Enhancements
1. Parse external CSS files
2. Extract logo images
3. Detect font families
4. AI-powered color palette generation
5. Suggest primary/secondary based on usage frequency
6. Extract from uploaded screenshots

## Testing

### Test Scenarios

#### Test 1: Extract from Popular Website
```
URL: https://stripe.com
Expected: Blue (#635BFF), white, black, gray tones
Result: Should extract Stripe's brand colors
```

#### Test 2: Extract from Colorful Website
```
URL: https://www.google.com
Expected: Blue, red, yellow, green (Google colors)
Result: Should extract primary Google brand colors
```

#### Test 3: Invalid URL
```
URL: not-a-valid-url
Expected: Error message
Result: Should show "Failed to fetch website" error
```

#### Test 4: Website with Few Colors
```
URL: https://example.com
Expected: Limited color palette
Result: Should extract available colors, may be < 12
```

## Security Considerations

1. **CORS**: Backend fetches website (not browser)
2. **Rate Limiting**: Consider adding rate limits to prevent abuse
3. **URL Validation**: Validates URL format before fetching
4. **Error Handling**: Graceful handling of fetch failures
5. **Admin Only**: Endpoint requires admin authentication

## Deployment Status

- ✅ Frontend implemented
- ✅ Backend endpoint created
- ✅ Endpoint registered
- ✅ Deployed to production
- ✅ Ready to use

## Usage Instructions

1. Navigate to `/admin/brands-management`
2. Click "Extract from Website" button
3. Enter website URL (e.g., `https://example.com`)
4. Click "Extract Colors"
5. Wait for extraction (usually 1-3 seconds)
6. Review extracted colors
7. Click "Primary" or "Secondary" on desired colors
8. Click "Continue to Create Brand"
9. Fill in brand name and other details
10. Save the brand

---

**Feature Status**: ✅ Complete and Deployed
**Last Updated**: February 16, 2026
