#!/bin/bash
# Vercel build: generate .env.production from Vercel environment variables.
# varlock/pass can't resolve pass() calls on Vercel's build servers (no GPG).
# We replace .env.schema with a clean version so varlock doesn't override our values.

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

# Replace .env.schema with clean version so varlock doesn't try to resolve pass() calls.
# The original is preserved in git — we're just neutering it for this build.
echo '# Vercel build override' > .env.schema
cat .env.production >> .env.schema
echo '✓ .env.schema replaced with real values'