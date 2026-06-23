#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if ! grep -qxF ".env.local" .git/info/exclude 2>/dev/null; then
  echo ".env.local" >> .git/info/exclude
  echo "Added .env.local to .git/info/exclude"
fi

printf "Paste DEEPSEEK_API_KEY: "
stty -echo
IFS= read -r KEY
stty echo
printf "\n"

if [ -z "$KEY" ]; then
  echo "ERROR: DEEPSEEK_API_KEY is empty. Aborting."
  exit 1
fi

cat > .env.local <<ENVEOF
export BAINA_ZH_AI_APPROVE_RUN=YES_DEEPSEEK_TOP_1000_ONLY
export BAINA_ZH_AI_MAX_INPUT_TOKENS=***
export BAINA_ZH_AI_MAX_OUTPUT_TOKENS=***
export BAINA_ZH_AI_MAX_TOTAL_ESTIMATED_TOKENS=***
export BAINA_ZH_AI_MAX_REQUESTS=25
export BAINA_ZH_AI_MAX_ENTRIES=500
export BAINA_ZH_AI_PROVIDER=deepseek
export DEEPSEEK_MODEL=deepseek-v4-flash
export DEEPSEEK_BASE_URL=https://api.deepseek.com
ENVEOF

printf 'export DEEPSEEK_API_KEY=%s\n' "'$KEY'" >> .env.local

chmod 600 .env.local

echo ".env.local written"
echo "DEEPSEEK_API_KEY_length=${#KEY}"

if git ls-files .env.local --error-unmatch >/dev/null 2>&1; then
  echo "ERROR: .env.local is tracked by git!"
  exit 1
fi
echo ".env.local is NOT tracked by git"

