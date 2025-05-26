module.exports = { prePushHookTemplate: `#!/bin/sh
branch_name=$(git symbolic-ref --short HEAD)
pattern='^[0-9]{4}\\.[0-9]{2}\\.[0-9]{2}-[A-Za-z0-9\\-]+$'

if ! echo "$branch_name" | grep -Eq "$pattern"; then
  echo "⛔️ Branch name '$branch_name' is invalid."
  echo "Format must be: YYYY.MM.DD-description-with-hyphens"
  echo ""
  echo "Example: 2025.05.22-Weng-Dockerfile"
  exit 1
fi`
}