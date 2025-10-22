#!/bin/bash

# Script do testowania seed endpoint
# Użycie: ./scripts/test-seed.sh

BASE_URL="http://localhost:3000/api"
COOKIE_FILE="cookies.txt"

echo "🧪 Test Seed Endpoint"
echo "===================="

# Cleanup cookie file
rm -f $COOKIE_FILE

echo ""
echo "1️⃣ Logowanie jako admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elearning.pl","password":"Admin123!"}' \
  -c $COOKIE_FILE)

echo "Response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Zalogowano pomyślnie"
else
  echo "❌ Błąd logowania - prawdopodobnie użytkownik admin nie istnieje jeszcze"
  echo "Spróbuj najpierw: npm run db:seed"
  exit 1
fi

echo ""
echo "2️⃣ Wywołanie seed endpoint..."
SEED_RESPONSE=$(curl -s -X POST "$BASE_URL/seed" \
  -b $COOKIE_FILE)

echo "Response: $SEED_RESPONSE"

if echo "$SEED_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Seedowanie zakończone pomyślnie"
else
  echo "❌ Błąd podczas seedowania"
  exit 1
fi

echo ""
echo "3️⃣ Test logowania nowym użytkownikiem admin..."
TEST_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elearning.pl","password":"Admin123!"}' \
  -c $COOKIE_FILE)

if echo "$TEST_LOGIN" | grep -q '"success":true'; then
  echo "✅ Nowy admin działa poprawnie"
else
  echo "❌ Nie można zalogować się nowym adminem"
  exit 1
fi

# Cleanup
rm -f $COOKIE_FILE

echo ""
echo "✨ Wszystkie testy przeszły pomyślnie!"

