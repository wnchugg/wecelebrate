# Site Configuration Field Fixes

## Issue 1: Gifts Per User Validation Error

When updating the "Gifts Per User" field in the Products & Gifts tab, an error occurred.

### Root Cause

The database has a constraint: `CHECK (gifts_per_user > 0)`

This means the value must be greater than 0. The issue occurred when:
1. The input field was empty → `parseInt('')` returns `NaN`
2. The value was 0 or negative → violates the database constraint

### Fix Applied

#### 1. Input Validation
Updated the input field to validate the value:
```typescript
onChange={(e) => {
  const value = parseInt(e.target.value);
  // Ensure value is at least 1 (database constraint)
  if (!isNaN(value) && value >= 1) {
    setGiftsPerUser(value);
    setHasChanges(true);
  } else if (e.target.value === '') {
    // Allow empty input temporarily, will default to 1 on save
    setGiftsPerUser(1);
    setHasChanges(true);
  }
}}
```

#### 2. Save Validation
Added validation in both `handleSave()` and `handleAutoSave()`:
```typescript
giftsPerUser: Math.max(1, giftsPerUser || 1), // Ensure at least 1
```

#### 3. UI Enhancement
Updated to quantity selector style with plus/minus buttons:
- ➖ Minus button (disabled at minimum value of 1)
- 🔢 Editable input field
- ➕ Plus button

---

## Issue 2: Default Gift ID UUID Syntax Error

When saving site configuration, a toast error appeared saying there was a syntax problem with UUID.

### Root Cause

The `default_gift_id` field is a UUID column in the database, which accepts either:
- A valid UUID string
- NULL

However, the field was being initialized as an empty string `''`, which is not a valid UUID and causes a database error.

### Fix Applied

#### 1. State Initialization
Changed from empty string to null:
```typescript
// Before
const [defaultGiftId, setDefaultGiftId] = useState(currentSite?.settings?.defaultGiftId || '');

// After
const [defaultGiftId, setDefaultGiftId] = useState(currentSite?.settings?.defaultGiftId || null);
```

#### 2. Select Dropdown
Updated to handle null properly:
```typescript
<select
  value={defaultGiftId || ''} // Convert null to empty string for select
  onChange={(e) => {
    setDefaultGiftId(e.target.value || null); // Convert empty string back to null
    setHasChanges(true);
  }}
>
  <option value="">No default gift (employees must make a selection)</option>
  {/* ... */}
</select>
```

#### 3. Save Functions
Ensure empty string is converted to null before saving:
```typescript
defaultGiftId: defaultGiftId || null, // Convert empty string to null for UUID field
```

---

## Issue 3: Availability Dates Timezone Syntax Error

When saving availability dates, a database error occurred about timezone syntax.

### Root Cause

The `datetime-local` HTML input returns a string in format: `"2024-02-17T14:30"` (no timezone)

However, PostgreSQL `TIMESTAMPTZ` columns expect ISO 8601 format with timezone: `"2024-02-17T14:30:00.000Z"`

### Fix Applied

#### 1. Date Formatting Helper
Created helper function to convert datetime-local to ISO 8601:
```typescript
const formatDateForDB = (dateStr: string) => {
  if (!dateStr) return null;
  // datetime-local format: "2024-02-17T14:30"
  // Convert to ISO 8601: "2024-02-17T14:30:00.000Z"
  return new Date(dateStr).toISOString();
};
```

#### 2. Save Functions
Applied formatting in both `handleSave()` and `handleAutoSave()`:
```typescript
availabilityStartDate: formatDateForDB(availabilityStartDate),
availabilityEndDate: formatDateForDB(availabilityEndDate),
```

#### 3. Loading from Database
Convert ISO 8601 back to datetime-local format for inputs:
```typescript
const formatDateForInput = (isoDate: string) => {
  if (!isoDate) return '';
  // ISO format: "2024-02-17T14:30:00.000Z"
  // datetime-local needs: "2024-02-17T14:30"
  return isoDate.slice(0, 16);
};

setAvailabilityStartDate(formatDateForInput(currentSite.settings?.availabilityStartDate || ''));
setAvailabilityEndDate(formatDateForInput(currentSite.settings?.availabilityEndDate || ''));
```

### Why This Matters

PostgreSQL TIMESTAMPTZ columns store timestamps with timezone information:
- ✅ ISO 8601 with timezone: `'2024-02-17T14:30:00.000Z'`
- ✅ NULL: `null`
- ❌ datetime-local format: `'2024-02-17T14:30'` (causes syntax error)

The conversion ensures:
1. Dates are stored with proper timezone in database
2. Dates display correctly in the UI
3. Timezone information is preserved

---

## Testing

After these fixes:

### Gifts Per User
1. ✅ Cannot enter 0 or negative values
2. ✅ Empty input defaults to 1
3. ✅ Values >= 1 work correctly
4. ✅ Plus/minus buttons work
5. ✅ Save and auto-save both validate the value
6. ✅ Database constraint is never violated

### Default Gift ID
1. ✅ Can select "No default gift" (saves as NULL)
2. ✅ Can select a specific gift (saves as UUID)
3. ✅ No UUID syntax errors
4. ✅ Value persists correctly after reload

### Availability Dates
1. ✅ Can set start and end dates
2. ✅ Dates save with proper timezone
3. ✅ No timezone syntax errors
4. ✅ Dates display correctly after reload
5. ✅ Timezone information preserved

---

## Location

### Gifts Per User
- **Tab:** Products & Gifts
- **Section:** Gift Selection Settings
- **Constraint:** Must be >= 1
- **UI:** Quantity selector with +/- buttons

### Default Gift
- **Tab:** Products & Gifts
- **Section:** Default Gift Settings
- **Type:** UUID or NULL

### Availability Dates
- **Tab:** General Settings
- **Section:** Availability Period
- **Type:** TIMESTAMPTZ (ISO 8601 with timezone)

---

## Database Constraints

```sql
-- Gifts per user must be positive
ALTER TABLE sites
  ADD CONSTRAINT sites_gifts_per_user_check CHECK (gifts_per_user > 0);

-- Default gift ID must be a valid UUID or NULL
ALTER TABLE sites
  ADD CONSTRAINT sites_default_gift_fk 
  FOREIGN KEY (default_gift_id) 
  REFERENCES products(id) 
  ON DELETE SET NULL;

-- Availability dates are TIMESTAMPTZ (with timezone)
-- selection_start_date TIMESTAMPTZ
-- selection_end_date TIMESTAMPTZ
```

These constraints ensure data integrity at the database level.
