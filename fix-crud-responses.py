#!/usr/bin/env python3
"""
Fix CRUD response format to use 'data' instead of entity names
"""

import re

# Read the file
with open('supabase/functions/server/crud_db.ts', 'r') as f:
    content = f.read()

# Replace patterns
replacements = [
    (r'(\s+return\s+\{\s+success:\s+true,\s+)client,', r'\1data: client,'),
    (r'(\s+return\s+\{\s+success:\s+true,\s+)site,', r'\1data: site,'),
    (r'(\s+return\s+\{\s+success:\s+true,\s+)product,', r'\1data: product,'),
    (r'(\s+return\s+\{\s+success:\s+true,\s+)employee,', r'\1data: employee,'),
    (r'(\s+return\s+\{\s+success:\s+true,\s+)order,', r'\1data: order,'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# Write back
with open('supabase/functions/server/crud_db.ts', 'w') as f:
    f.write(content)

print("✅ Fixed all CRUD response formats")
