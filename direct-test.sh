#!/bin/bash

# Direct cURL test for bootstrap endpoint

echo "Testing bootstrap endpoint directly..."
echo ""

curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"SecurePass123!","username":"testuser"}' \
  https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/bootstrap/create-admin

echo ""
echo ""
echo "Done!"
