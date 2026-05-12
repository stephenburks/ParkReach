#!/usr/bin/env bash
set -euo pipefail

if ! command -v pass &>/dev/null; then
	echo '⚠️  pass is not installed — env vars via varlock will fail'
	echo '   Install: brew install pass'
	exit 1
fi

if ! pass show parkreach/supabase-url &>/dev/null; then
	echo ''
	echo '🔐 GPG passphrase not cached — pinentry-mac should appear for prompt'
	echo '   If no dialog appears, run: gpgconf --kill gpg-agent && gpgconf --launch gpg-agent'
	echo ''

	if ! pass show parkreach/supabase-url 2>/dev/null; then
		echo '❌ GPG decryption failed — varlock will not resolve secrets'
		echo '   Troubleshoot:'
		echo '     1. Ensure pinentry-mac is installed: brew install pinentry-mac'
		echo '     2. Ensure gpg-agent.conf has: pinentry-program /opt/homebrew/bin/pinentry-mac'
		echo '     3. Restart agent: gpgconf --kill gpg-agent && gpgconf --launch gpg-agent'
		echo '     4. Try manually: pass show parkreach/supabase-url'
		exit 1
	fi
fi

echo '✅ GPG passphrase cached — varlock will resolve secrets'
