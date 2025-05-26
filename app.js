const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

// Function to clear generated directory
function clearGeneratedDirectory() {
    const generatedDir = path.join('generated');
    if (fs.existsSync(generatedDir)) {
        fs.rmSync(generatedDir, { recursive: true, force: true });
    }
    fs.mkdirSync(generatedDir);
}

const questions = [
    {
        name: 'useConventionalCommits',
        message: `
\n1. (Git) Do you want to enforce Conventional Commit message format?

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
\n2. (Git) Do you want to enforce branch naming convention

Format must be: YYYY.MM.DD-description-with-hyphens
Example: 2025.05.22-Weng-Dockerfile
`,
        type: 'confirm',
        default: true
    },
    {
        name: 'useCustomVSCodeFormatting',
        message: '\n3. (VSCode) Do you want to change VS Code default formatting settings?',
        type: 'confirm',
        default: true
    },
    {
        name: 'usePrettier',
        message: '\n4. (Prettier) Do you want to use Prettier for code formatting?',
        type: 'confirm',
        default: true
    },
    {
        name: 'useESLint',
        message: '\n5. (ESLint) Do you want to use ESLint for code linting?',
        type: 'confirm',
        default: true
    },
    {
        name: 'indentationType',
        message: '\n6. (VS Code, Prettier) What type of indentation do you prefer?',
        type: 'list',
        choices: ['Spaces', 'Tabs'],
        default: 'Spaces',
        when: (answers) => answers.useCustomVSCodeFormatting
    },
    {
        name: 'tabSize',
        message: '\n7. (VS Code, Prettier) How many spaces/tabs for indentation?',
        type: 'number',
        default: 2,
        when: (answers) => answers.useCustomVSCodeFormatting
    },
    {
        name: 'endOfLine',
        message: '\n8. (VS Code, Prettier) What line ending do you prefer?\n',
        type: 'list',
        choices: [
          { name: 'LF (\\n) - Unix/macOS - Recommended for cross-platform projects', value: 'lf' },
          { name: 'CRLF (\\r\\n) - Windows - May be required for some Windows tools', value: 'crlf' },
          { name: 'CR (\\r) - Legacy Macs (rarely used)', value: 'cr' },
          { name: 'Auto - Let Prettier detect and preserve existing endings', value: 'auto' }
        ],
        default: 'lf',
        when: (answers) => answers.usePrettier || answers.useESLint
    },      
    {
        name: 'trimTrailingWhitespace',
        message: '\n9. (VS Code, Prettier always) Do you want to trim trailing whitespace?',
        type: 'confirm',
        default: true,
        // prettier will always trim trailing whitespace and takes precedance over VS Code settings.json
        when: (answers) => !answers.usePrettier
    },
    {
        name: 'insertFinalNewline',
        message: '\n10. (VS Code) Do you want to insert final newline at the end of files?',
        type: 'confirm',
        default: true,
        when: (answers) => answers.usePrettier || answers.useESLint
    }
];

inquirer.prompt(questions).then((answers) => {
    // Clear and recreate generated directory
    clearGeneratedDirectory();
    
    const hooksDir = path.join('generated','.git', 'hooks');
    const vscodeDir = path.join('generated', '.vscode');
    
    // Create directories if they don't exist
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }
    if (!fs.existsSync(vscodeDir)) {
        fs.mkdirSync(vscodeDir, { recursive: true });
    }

    // Create VS Code extensions.json
    if (answers.usePrettier || answers.useESLint) {
        const extensions = {
            recommendations: []
        };
        
        if (answers.usePrettier) {
            extensions.recommendations.push('esbenp.prettier-vscode');
        }
        if (answers.useESLint) {
            extensions.recommendations.push('dbaeumer.vscode-eslint');
        }
        
        fs.writeFileSync(
            path.join(vscodeDir, 'extensions.json'),
            JSON.stringify(extensions, null, 2)
        );
        console.log('✅ Created VS Code extensions.json');
    }

    // Create VS Code settings.json
    if (answers.usePrettier || answers.useESLint) {
        let settings = {
            'editor.formatOnSave': true,
            'editor.tabWidth': answers.tabSize,
            'editor.insertSpaces': answers?.indentationType === 'Spaces',
            'files.insertFinalNewline': answers.insertFinalNewline
        };

        if("trimTrailingWhitespace" in answers) {
            settings['files.trimTrailingWhitespace'] = answers.trimTrailingWhitespace;
        }

        if (answers.usePrettier) {
            settings['editor.defaultFormatter'] = 'esbenp.prettier-vscode';
        }

        fs.writeFileSync(
            path.join(vscodeDir, 'settings.json'),
            JSON.stringify(settings, null, 2)
        );
        console.log('✅ Created VS Code settings.json');
    }

    // Create .prettierrc
    if (answers.usePrettier) {
        const prettierConfig = {
            tabWidth: answers.tabSize,
            useTabs: answers?.indentationType === 'Tabs',
            endOfLine: answers.endOfLine,
            trailingComma: 'es5',
            semi: true,
            singleQuote: true,
            printWidth: 80,
        };

        fs.writeFileSync(
            path.join('generated', '.prettierrc'),
            JSON.stringify(prettierConfig, null, 2)
        );
        console.log('✅ Created .prettierrc');

        // Create .prettierignore
        const prettierIgnoreContent = `# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
out/
.next/

# Cache
.cache/
.npm/
.eslintcache

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Generated files
generated/
coverage/
`;

        fs.writeFileSync(
            path.join('generated', '.prettierignore'),
            prettierIgnoreContent
        );
        console.log('✅ Created .prettierignore');
    }

    // Create .eslintrc
    if (answers.useESLint) {
        const eslintConfig = {
            env: {
                browser: true,
                es2021: true,
                node: true
            },
            extends: [
                'eslint:recommended'
            ],
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module'
            },
            rules: {
                'indent': ['error', answers?.indentationType === 'Spaces' ? answers.tabSize : 'tab'],
                'linebreak-style': ['error', answers.endOfLine],
                'quotes': ['error', 'single'],
                'semi': ['error', 'always']
            }
        };

        fs.writeFileSync(
            path.join('generated', '.eslintrc'),
            JSON.stringify(eslintConfig, null, 2)
        );
        console.log('✅ Created .eslintrc');
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

    console.log('\n✨ All configurations have been generated successfully!\n✨ Please open `generated/` folder and copy the files where you want to enforce the rules.');
});
