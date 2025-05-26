const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

const questions = [
    {
        name: 'useConventionalCommits',
        message: `
\n1. Do you want to enforce Conventional Commit message format?

Format must be: (?i)^(feat|fix|docs|style|refactor|test|chore)(\([a-z0-9\-]+\))?
Example: feat: add login button
Example: feat(auth): add login button
`,
        type: 'confirm',
        default: true
    },
    {
        name: 'enforceBranchNaming',
        message: `
\n2. Do you want to enforce branch naming convention

Format must be: YYYY.MM.DD-description-with-hyphens
Example: 2025.05.22-Weng-Dockerfile
`,
        type: 'confirm',
        default: true
    }
];

inquirer.prompt(questions).then((answers) => {
    const hooksDir = path.join('generated','.git', 'hooks');
    
    // Create .git/hooks directory if it doesn't exist
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }

    if (answers.useConventionalCommits) {
        const commitMsgHook = `#!/bin/sh

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
fi`;

        fs.writeFileSync(path.join(hooksDir, 'commit-msg'), commitMsgHook);
        fs.chmodSync(path.join(hooksDir, 'commit-msg'), '755');
        console.log('✅ Created commit-msg hook');
    }

    if (answers.enforceBranchNaming) {
        const prePushHook = `#!/bin/sh
branch_name=$(git symbolic-ref --short HEAD)
pattern='^[0-9]{4}\\.[0-9]{2}\\.[0-9]{2}-[A-Za-z0-9\\-]+$'

if ! echo "$branch_name" | grep -Eq "$pattern"; then
  echo "⛔️ Branch name '$branch_name' is invalid."
  echo "Format must be: YYYY.MM.DD-description-with-hyphens"
  echo ""
  echo "Example: 2025.05.22-Weng-Dockerfile"
  exit 1
fi`;

        fs.writeFileSync(path.join(hooksDir, 'pre-push'), prePushHook);
        fs.chmodSync(path.join(hooksDir, 'pre-push'), '755');
        console.log('✅ Created pre-push hook');
    }

    console.log('\n✨ Enforcement hooks/scripts have been generated successfully!\n✨ Please open `generated/` folder and copy the files where you want to enforce the rules.');
});
