module.exports = { commitMsgHookTemplate: `#!/bin/sh

# Regex for Conventional Commit (e.g., feat: message, fix: message)
commit_regex="(?i)^(feat|fix|docs|style|refactor|test|chore)(\\([a-z0-9\\-]+\\))?: .+"

commit_msg=$(cat "$1")

if ! echo "$commit_msg" | grep -Eq "$commit_regex"; then
  echo "⛔️ Commit message must follow Conventional Commits format:"
  echo "'''"
  echo "(?i)^(feat|fix|docs|style|refactor|test|chore)(\([a-z0-9\-]+\))?: .+"
  echo "'''"
  echo ""
  echo "Example: feat: add login button"
  echo "Example: feat(auth): add login button"
  exit 1
fi`
}