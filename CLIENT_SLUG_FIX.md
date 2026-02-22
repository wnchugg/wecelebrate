# Client Slug/UUID Resolution Fix

## Issue

When accessing a client by name or slug (e.g., "Harbor Freight"), the application was throwing a UUID validation error from the backend.

### Root Cause

1. **Weak UUID Detection**: The original code used `clientId?.includes('-')` to detect UUIDs, which is unreliable
   - "Harbor Freight" doesn't contain hyphens, so it was treated as a slug
   - But the slug lookup was failing silently and falling back to using the name as an ID
   - PostgreSQL then rejected it because it's not a valid UUID format

2. **Silent Fallback**: When slug resolution failed, the code would try to use the slug as a UUID anyway, causing database errors

3. **Case Sensitivity**: The slug matching was case-sensitive, so "Harbor-Freight" wouldn't match "harbor-freight"

## Solution

### 1. Proper UUID Validation

```typescript
// ❌ Old (unreliable)
const isUUID = clientId?.includes('-');

// ✅ New (proper UUID regex)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = uuidRegex.test(clientId || '');
```

### 2. Better Error Handling

```typescript
// ✅ Show clear error message when client not found
if (!matchingClient) {
  toast.error(`Client not found: "${clientId}". Please check the URL or client code.`);
  setIsLoading(false);
  return;
}
```

### 3. Case-Insensitive Slug Matching

```typescript
// ✅ Case-insensitive comparison
const matchingClient = allClientsRes.data.find(c => 
  c.clientCode?.toLowerCase() === clientId?.toLowerCase()
);
```

## How Client Access Works

### By UUID (Direct)
```
URL: /admin/clients/123e4567-e89b-12d3-a456-426614174000/configuration
Flow: UUID detected → Direct database query → Success
```

### By Slug (Requires Resolution)
```
URL: /admin/clients/harbor-freight/configuration
Flow: 
1. Not a UUID → Fetch all clients
2. Find client where clientCode = "harbor-freight"
3. Use found client's UUID for database query
4. Success
```

### By Name (Not Supported)
```
URL: /admin/clients/Harbor Freight/configuration
Flow:
1. Not a UUID → Fetch all clients
2. No client with clientCode = "Harbor Freight" (spaces not allowed in slugs)
3. Show error: "Client not found"
```

## Client Code (Slug) Requirements

For a client to be accessible by slug, the `clientCode` field must:

1. **Be set**: Not empty or null
2. **Be URL-safe**: Use lowercase letters, numbers, and hyphens only
3. **Be unique**: No two clients can have the same code
4. **No spaces**: Use hyphens instead (e.g., "harbor-freight" not "Harbor Freight")

### Valid Examples
- ✅ `harbor-freight`
- ✅ `acme-corp`
- ✅ `techcorp-2024`
- ✅ `client-001`

### Invalid Examples
- ❌ `Harbor Freight` (contains spaces)
- ❌ `Acme Corp.` (contains spaces and period)
- ❌ `Tech@Corp` (contains special character)
- ❌ `ACME_CORP` (contains underscore - use hyphen instead)

## Fixing "Harbor Freight" Client

To make the "Harbor Freight" client accessible by slug:

1. **Go to Client Configuration**
2. **Set the URL Slug field** to: `harbor-freight`
3. **Save the client**
4. **Access via**: `/admin/clients/harbor-freight/configuration`

### Steps in UI

1. Navigate to: `/admin/clients/[UUID]/configuration`
2. In the "General" tab, find "URL Slug" field
3. Enter: `harbor-freight`
4. Click "Save Changes"
5. Now you can access via: `/admin/clients/harbor-freight/configuration`

## Testing

### Test Case 1: Access by UUID
```
URL: /admin/clients/123e4567-e89b-12d3-a456-426614174000/configuration
Expected: ✅ Loads client directly
```

### Test Case 2: Access by Valid Slug
```
URL: /admin/clients/harbor-freight/configuration
Expected: ✅ Resolves slug to UUID, then loads client
```

### Test Case 3: Access by Invalid Slug
```
URL: /admin/clients/nonexistent-client/configuration
Expected: ✅ Shows error: "Client not found: nonexistent-client"
```

### Test Case 4: Access by Name with Spaces
```
URL: /admin/clients/Harbor Freight/configuration
Expected: ✅ Shows error: "Client not found: Harbor Freight"
```

## Related Files

- `src/app/pages/admin/ClientConfiguration.tsx` - Fixed UUID detection and error handling
- `supabase/functions/make-server-6fcaeea3/database/db.ts` - Database layer (expects UUIDs)
- `supabase/functions/make-server-6fcaeea3/crud_db.ts` - CRUD operations

## Best Practices

1. **Always set clientCode** when creating a new client
2. **Use lowercase with hyphens** for slugs (e.g., "my-client-name")
3. **Keep slugs short and memorable** for easy URL access
4. **Test slug access** after creating a client
5. **Document the slug** in client notes if it's not obvious from the name

## Future Improvements

### 1. Slug Validation on Save
Add validation to prevent invalid slugs:
```typescript
const validateSlug = (slug: string): string | null => {
  if (!slug) return null;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return 'Slug must contain only lowercase letters, numbers, and hyphens';
  }
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return 'Slug cannot start or end with a hyphen';
  }
  if (slug.includes('--')) {
    return 'Slug cannot contain consecutive hyphens';
  }
  return null;
};
```

### 2. Auto-Generate Slug
Automatically generate slug from client name:
```typescript
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
    .replace(/-+/g, '-');          // Replace multiple hyphens with single
};

// "Harbor Freight" → "harbor-freight"
// "Acme Corp." → "acme-corp"
// "Tech@Company 2024" → "tech-company-2024"
```

### 3. Slug Uniqueness Check
Check for duplicate slugs before saving:
```typescript
const checkSlugUniqueness = async (slug: string, currentClientId?: string) => {
  const clients = await apiRequest('/v2/clients');
  const duplicate = clients.data.find(c => 
    c.clientCode?.toLowerCase() === slug.toLowerCase() && 
    c.id !== currentClientId
  );
  return !duplicate;
};
```

### 4. Backend Slug Resolution
Add a backend endpoint for slug resolution:
```typescript
// GET /v2/clients/by-slug/:slug
app.get('/v2/clients/by-slug/:slug', async (c) => {
  const slug = c.req.param('slug');
  const clients = await db.getClients({ search: slug });
  const client = clients.find(c => c.client_code === slug);
  
  if (!client) {
    return c.json({ success: false, error: 'Client not found' }, 404);
  }
  
  return c.json({ success: true, data: client });
});
```

## Summary

The fix improves client access reliability by:
- ✅ Using proper UUID validation
- ✅ Providing clear error messages
- ✅ Supporting case-insensitive slug matching
- ✅ Preventing silent failures

To access "Harbor Freight" client, set its `clientCode` to `harbor-freight` and use that in the URL.
