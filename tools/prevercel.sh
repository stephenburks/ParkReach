#!/bin/bash
# Vercel build: generate .env.production from Vercel environment variables.
# varlock/pass can't resolve pass() calls on Vercel's build servers (no GPG),
# so we write the actual values to a .env.production file that Next.js loads.

set -e

echo '⚡ Generating .env.production from Vercel environment variables...'

cat > .env.production << EOF
NPS_API_KEY=$NPS_API_KEY
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
EOF

echo '✓ .env.production generated'
