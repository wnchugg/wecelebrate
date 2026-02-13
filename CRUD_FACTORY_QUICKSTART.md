# CRUD Factory Quick Start Guide

**Get started with the CRUD factory in 5 minutes! 🚀**

---

## 📦 **What You Get**

**1 function call = 5 complete API routes:**
- `GET /resources` - List all (paginated)
- `GET /resources/:id` - Get by ID
- `POST /resources` - Create
- `PUT /resources/:id` - Update
- `DELETE /resources/:id` - Delete

---

## 🏃 **Quick Start**

### **Step 1: Import the Factory**

```typescript
import { createCrudRoutes, validateRequired } from './crud_factory.ts';
```

### **Step 2: Define Your Resource Type**

```typescript
interface Product {
  name: string;
  price: number;
  category: string;
}
```

### **Step 3: Create Routes**

```typescript
createCrudRoutes<Product>(app, {
  resourceName: 'products',  // Plural name for URL
  keyPrefix: 'product',      // Singular for KV keys
  
  validate: (data) => {
    if (!data.name) return 'Name required';
    if (data.price <= 0) return 'Price must be positive';
    return null; // Valid!
  },
});
```

### **Step 4: Done! 🎉**

Your API is ready:
- `POST /make-server-6fcaeea3/products` - Create product
- `GET /make-server-6fcaeea3/products` - List products
- `GET /make-server-6fcaeea3/products/:id` - Get product
- `PUT /make-server-6fcaeea3/products/:id` - Update product
- `DELETE /make-server-6fcaeea3/products/:id` - Delete product

---

## 💡 **Common Patterns**

### **Pattern 1: Basic Validation**

```typescript
createCrudRoutes<Client>(app, {
  resourceName: 'clients',
  keyPrefix: 'client',
  
  validate: (data) => {
    // Use built-in helpers
    const required = validateRequired(data, ['name', 'email']);
    if (required) return required;
    
    const emailError = validateEmail(data.email);
    if (emailError) return emailError;
    
    return null;
  },
});
```

### **Pattern 2: Transform Data**

```typescript
createCrudRoutes<Product>(app, {
  resourceName: 'products',
  keyPrefix: 'product',
  
  // Clean up data before saving
  transform: (data) => ({
    ...data,
    name: sanitizeString(data.name),
    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    price: parseFloat(data.price.toFixed(2)),
  }),
});
```

### **Pattern 3: Add Computed Fields**

```typescript
createCrudRoutes<Product>(app, {
  resourceName: 'products',
  keyPrefix: 'product',
  
  // Add fields when returning data
  postProcess: (data) => ({
    ...data,
    formattedPrice: `$${data.price.toFixed(2)}`,
    inStock: data.quantity > 0,
  }),
});
```

### **Pattern 4: Enable Soft Delete**

```typescript
createCrudRoutes<Product>(app, {
  resourceName: 'products',
  keyPrefix: 'product',
  
  softDelete: true,  // Don't actually delete, just mark as deleted
});
```

### **Pattern 5: Custom Access Control**

```typescript
createCrudRoutes<Post>(app, {
  resourceName: 'posts',
  keyPrefix: 'post',
  
  // Only owners can access their posts
  accessControl: async (c, resourceId) => {
    const userId = c.get('userId');
    const role = c.get('userRole');
    
    // Admins have full access
    if (role === 'admin') return true;
    
    // For specific post, check ownership
    if (resourceId) {
      const post = await getPost(resourceId);
      return post.ownerId === userId;
    }
    
    return !!userId;
  },
});
```

### **Pattern 6: Custom ID Generator**

```typescript
let orderCounter = 1000;

createCrudRoutes<Order>(app, {
  resourceName: 'orders',
  keyPrefix: 'order',
  
  // Generate sequential order IDs
  generateId: () => {
    orderCounter++;
    return `ORD-${String(orderCounter).padStart(6, '0')}`;
  },
});
```

---

## 🔧 **Configuration Cheat Sheet**

### **Required**
```typescript
resourceName: 'products'    // Plural for URL
keyPrefix: 'product'        // Singular for storage
```

### **Validation**
```typescript
validate: (data) => string | null
```

### **Transformation**
```typescript
transform: (data) => transformedData    // Before save
postProcess: (data) => processedData    // After retrieve
```

### **Security**
```typescript
accessControl: (c, id?) => Promise<boolean>
```

### **Features**
```typescript
auditLogging: true         // Default: true
softDelete: false          // Default: false
enablePagination: true     // Default: true
defaultPageSize: 50        // Default: 50
maxPageSize: 100          // Default: 100
```

### **Advanced**
```typescript
generateId: () => string                // Default: crypto.randomUUID()
additionalFilters: ['category', 'status'] // Query params
```

---

## 🎯 **Built-in Helpers**

### **Validation**
```typescript
validateRequired(data, ['name', 'email'])
validateStringLength(data.name, 'name', 3, 100)
validateEmail(data.email)
validateUrl(data.website)
```

### **Transformation**
```typescript
sanitizeString(input)       // Remove HTML/scripts
normalizeWhitespace(input)  // Clean whitespace
```

---

## 📝 **Example: Complete Product API**

```typescript
import { Hono } from 'npm:hono';
import {
  createCrudRoutes,
  validateRequired,
  sanitizeString,
} from './crud_factory.ts';

const app = new Hono();

interface Product {
  name: string;
  description: string;
  price: number;
  category: string;
}

createCrudRoutes<Product>(app, {
  resourceName: 'products',
  keyPrefix: 'product',
  
  validate: (data) => {
    const required = validateRequired(data, ['name', 'price', 'category']);
    if (required) return required;
    
    if (data.price <= 0) return 'Price must be positive';
    if (data.name.length < 3) return 'Name too short';
    
    return null;
  },
  
  transform: (data) => ({
    ...data,
    name: sanitizeString(data.name),
    description: sanitizeString(data.description),
    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    price: parseFloat(data.price.toFixed(2)),
  }),
  
  postProcess: (data) => ({
    ...data,
    formattedPrice: `$${data.price.toFixed(2)}`,
  }),
  
  softDelete: true,
  enablePagination: true,
  defaultPageSize: 20,
  additionalFilters: ['category'],
});

Deno.serve(app.fetch);
```

**That's it! You now have a complete, production-ready Product API! 🎉**

---

## 🧪 **Test Your API**

### **Create Product**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 29.99,
    "category": "electronics"
  }'
```

### **List Products**
```bash
curl -X GET "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/products?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Get Product**
```bash
curl -X GET https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Update Product**
```bash
curl -X PUT https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product",
    "price": 39.99
  }'
```

### **Delete Product**
```bash
curl -X DELETE https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎁 **What You Get Automatically**

Every resource gets:

✅ **Environment Isolation** - Dev/prod data separated  
✅ **Access Control** - Authentication required  
✅ **Input Validation** - Your custom rules enforced  
✅ **Audit Logging** - All changes tracked  
✅ **Error Handling** - Comprehensive error responses  
✅ **Pagination** - Built-in page support  
✅ **Metadata** - createdAt, updatedAt, etc.  
✅ **Performance Logging** - Request duration tracked  

---

## 📚 **Learn More**

- **Full Documentation:** `/PHASE_3_1_CRUD_FACTORY.md`
- **Testing Guide:** `/PHASE_3_1_TESTING_GUIDE.md`
- **Examples:** `/supabase/functions/server/crud_examples.ts`
- **Summary:** `/PHASE_3_1_SUMMARY.md`

---

## 💬 **Common Questions**

### **Q: Can I customize the routes?**
A: Yes! The factory creates standard routes, but you can add custom routes alongside them.

### **Q: How do I add authentication?**
A: Use the `accessControl` option to check user permissions.

### **Q: Can I use this with existing routes?**
A: Yes! The factory integrates seamlessly with existing Hono routes.

### **Q: What about relationships between resources?**
A: Handle relationships in your `transform` or `postProcess` functions.

### **Q: Is it production-ready?**
A: Absolutely! Includes error handling, logging, validation, and more.

---

## 🚀 **Ready to Build?**

You now have everything you need to create production-ready CRUD APIs in minutes instead of hours!

**Happy coding! 🎉**

---

**Last Updated:** February 9, 2026  
**Status:** ✅ READY TO USE
