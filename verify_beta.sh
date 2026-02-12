#!/bin/bash
BASE_URL="http://localhost:5002/api/v1"
EMAIL="beta_test_$(date +%s)@example.com"
PASSWORD="password123"

echo "Registering user $EMAIL..."
REGISTER_RES=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"firstName\": \"Beta\", \"lastName\": \"Tester\", \"role\": \"teacher\"}")

TOKEN=$(echo $REGISTER_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Registration failed. Response: $REGISTER_RES"
  exit 1
fi
echo "Token obtained."

echo "1. Checking status (expect default)..."
curl -s -X GET $BASE_URL/beta/status -H "Authorization: Bearer $TOKEN"
echo ""

echo "2. Accepting beta..."
curl -s -X POST $BASE_URL/beta/accept -H "Authorization: Bearer $TOKEN"
echo ""

echo "3. Checking status (expect accepted)..."
curl -s -X GET $BASE_URL/beta/status -H "Authorization: Bearer $TOKEN"
echo ""

echo "4. Marking confirmation seen..."
curl -s -X PATCH $BASE_URL/beta/confirmation-seen -H "Authorization: Bearer $TOKEN"
echo ""

echo "5. Checking status (expect seen)..."
curl -s -X GET $BASE_URL/beta/status -H "Authorization: Bearer $TOKEN"
echo ""

echo "6. Trying to accept again (expect 409)..."
curl -s -X POST $BASE_URL/beta/accept -H "Authorization: Bearer $TOKEN"
echo ""

# Test Decline with another user
EMAIL2="beta_decline_$(date +%s)@example.com"
echo "Registering user 2 ($EMAIL2)..."
REGISTER_RES2=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL2\", \"password\": \"$PASSWORD\", \"firstName\": \"Beta\", \"lastName\": \"Decliner\", \"role\": \"teacher\"}")
TOKEN2=$(echo $REGISTER_RES2 | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "7. Declining beta (User 2)..."
curl -s -X POST $BASE_URL/beta/decline -H "Authorization: Bearer $TOKEN2"
echo ""

echo "8. Checking status (User 2, expect declined)..."
curl -s -X GET $BASE_URL/beta/status -H "Authorization: Bearer $TOKEN2"
echo ""
