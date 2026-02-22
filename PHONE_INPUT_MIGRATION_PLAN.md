# Phone Input Migration Plan

## Files to Update

### Frontend Components (Priority Order)

1. **ClientConfiguration.tsx** ✅
   - Field: `clientContactPhone`
   - Location: Account Team tab

2. **ClientModal.tsx** ✅
   - Field: `clientContactPhone`
   - Location: Add/Edit client modal

3. **BrandModal.tsx** ✅
   - Field: `contactPhone`
   - Location: Brand creation/edit modal

4. **StoreLocationModal.tsx** ✅
   - Field: `phone`
   - Location: Store location modal

5. **ShippingConfiguration.tsx** ✅
   - Fields: `companyAddress.phoneNumber`, store phone numbers
   - Location: Shipping configuration page

6. **Checkout.tsx** ✅
   - Field: shipping address phone
   - Location: Checkout form

### Backend Updates

1. **Database Schema** ✅
   - Ensure phone fields can store international format (+XX XXXX XXXX)
   - Fields are already text/varchar, no changes needed

2. **API Validation** ✅
   - Update phone validation in `security.ts`
   - Use new validation utilities

3. **Type Definitions** ✅
   - Update TypeScript interfaces
   - Ensure phone fields are strings

## Migration Steps

### Step 1: Update Frontend Components
- Replace `<input type="tel">` with `<PhoneInput>`
- Update state management
- Add proper validation

### Step 2: Update Backend Validation
- Update phone validation rules
- Accept international format
- Store in E.164 format

### Step 3: Data Migration (if needed)
- Existing phone numbers should work as-is
- New entries will use international format

### Step 4: Testing
- Test all forms with phone inputs
- Test validation
- Test storage and retrieval
- Test different countries

## Implementation Order

1. ClientConfiguration (most important)
2. ClientModal
3. BrandModal
4. StoreLocationModal
5. ShippingConfiguration
6. Checkout
7. Backend validation updates
