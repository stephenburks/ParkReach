#!/bin/bash
# Vercel build: export env vars from Vercel environment to override varlock/pass.
# Sourced (not exec'd) so exports propagate to next build.

echo '⚡ Setting up environment for Vercel build...'

# Node writes .env.production file
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
  const found = keys.filter(k => process.env[k]);
  if (found.length < keys.length) {
    console.error('ERROR: missing env vars: ' + keys.filter(k => !process.env[k]).join(', '));
    process.exit(1);
  }
  console.log('✓ All ' + keys.length + ' env keys found');
" || exit 1

# Overwrite .env.schema so varlock doesn't try to resolve pass() calls
echo '# Vercel build override' > .env.schema
cat .env.production >> .env.schema

echo "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
echo '✓ Build environment ready'