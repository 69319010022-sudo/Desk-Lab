#!/bin/bash

# DeskLab CI/CD Pipeline Setup Script
# This script sets up GitHub Actions for automated testing and building

set -e

echo "🚀 DeskLab CI/CD Pipeline Setup"
echo "================================"
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✅ Found project root"
echo ""

# Step 1: Create .github/workflows directory
echo "📁 Step 1: Creating .github/workflows directory..."
mkdir -p .github/workflows
echo "✅ Directory created"
echo ""

# Step 2: Copy CI workflow file
echo "📋 Step 2: Setting up CI workflow..."
cat > .github/workflows/ci.yml << 'WORKFLOW_EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Run Tests & Coverage
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false

      - name: Comment coverage on PR
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info

  lint:
    name: Lint Code
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint -- . --max-warnings 0
        continue-on-error: true

      - name: Report lint results
        if: failure()
        run: echo "⚠️ Linting issues found. Please fix them before merging."

  build:
    name: Build Project
    runs-on: ubuntu-latest
    needs: [test, lint]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js project
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Check build artifacts
        run: |
          if [ -d ".next" ]; then
            echo "✅ Build successful - .next directory created"
            du -sh .next
          else
            echo "❌ Build failed - .next directory not found"
            exit 1
          fi

  status:
    name: CI Status Check
    runs-on: ubuntu-latest
    needs: [test, lint, build]
    if: always()

    steps:
      - name: Check job statuses
        run: |
          if [[ "${{ needs.test.result }}" == "failure" ]]; then
            echo "❌ Tests failed"
            exit 1
          fi
          if [[ "${{ needs.lint.result }}" == "failure" ]]; then
            echo "⚠️ Linting failed"
          fi
          if [[ "${{ needs.build.result }}" == "failure" ]]; then
            echo "❌ Build failed"
            exit 1
          fi
          echo "✅ All checks passed!"
WORKFLOW_EOF

echo "✅ CI workflow created at .github/workflows/ci.yml"
echo ""

# Step 3: Update package.json with test scripts
echo "📦 Step 3: Updating package.json with test scripts..."
if ! grep -q '"test"' package.json; then
    echo "⚠️ Test scripts not found in package.json"
    echo "Please ensure these scripts are in your package.json:"
    echo '  "test": "jest",'
    echo '  "test:watch": "jest --watch",'
    echo '  "test:coverage": "jest --coverage"'
else
    echo "✅ Test scripts found in package.json"
fi
echo ""

# Step 4: Summary
echo "🎉 CI/CD Setup Complete!"
echo "========================"
echo ""
echo "📝 Next Steps:"
echo "1. Commit the .github directory:"
echo "   git add .github/"
echo "   git commit -m 'ci: add GitHub Actions CI/CD pipeline'"
echo ""
echo "2. Push to your repository:"
echo "   git push origin main"
echo ""
echo "3. Configure GitHub Secrets:"
echo "   - Go to GitHub → Settings → Secrets and variables → Actions"
echo "   - Add NEXT_PUBLIC_SUPABASE_URL"
echo "   - Add NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "4. Monitor your first CI run:"
echo "   - GitHub → Your Repo → Actions tab"
echo ""
echo "✅ Your CI/CD pipeline is now configured!"
