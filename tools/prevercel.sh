#!/bin/bash
# Vercel build: generate .env.production from Vercel environment variables.
# varlock/pass can't resolve pass() calls on Vercel's build servers (no GPG),
# so we write the actual values to a .env.production file that Next.js loads.

set -e

echo '⚡ Generating .env.production from Vercel environment variables...'

node -e "
  const fs = require('fs');
  const keys = [
    'NPS_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GOOGLE_MAPS_API_KEY',
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  ];
  const lines = [];
  for (const key of keys) {
    const val = process.env[key] || '';
    lines.push(key + '=' + val);
  }
  fs.writeFileSync('.env.production', lines.join('\n') + '\n');
  console.log('Keys found: ' + keys.filter(k => process.env[k]).join(', '));
  console.log('✓ .env.production generated');
" 2>&1

echo 'Contents (masked):'
cat .env.production | sed 's/=.*/=***/g'