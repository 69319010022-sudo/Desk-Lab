# CI/CD Pipeline Setup Guide

## Overview

This guide walks you through setting up GitHub Actions for automated testing, linting, and building of the DeskLab project.

---

## Step 1: Create GitHub Workflows Directory

On your local machine or directly in GitHub:

```bash
mkdir -p .github/workflows
```

## Step 2: Add CI Workflow File

Copy the provided `ci.yml` file to your workflows directory:

```
.github/
└── workflows/
    └── ci.yml
```

**File location**: `.github/workflows/ci.yml`

The workflow includes:
- **Test Job**: Runs Jest tests with coverage reporting to Codecov
- **Lint Job**: Runs ESLint with 0 max warnings policy
- **Build Job**: Builds Next.js project and verifies .next directory
- **Status Job**: Final check that all critical jobs passed

---

## Step 3: Configure GitHub Secrets

Navigate to your repository settings and add the following secrets under **Settings → Secrets and variables → Actions**:

### Required Secrets for Build Environment

```
NEXT_PUBLIC_SUPABASE_URL     = Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY = Your Supabase anonymous key
```

**How to find these:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your DeskLab project
3. Click **Settings → API**
4. Copy `Project URL` and `anon public key`

### Optional Secrets (for future deployment)

```
SUPABASE_SERVICE_ROLE_KEY    = For server-side operations
DATABASE_PASSWORD             = For database operations
```

---

## Step 4: Update package.json Scripts

Ensure your `package.json` includes all test and lint scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings 0",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**If updating**, run after changes:
```bash
npm install
```

---

## Step 5: Verify Workflow Triggers

The workflow triggers on:
- ✅ Push to `main` branch
- ✅ Push to `develop` branch
- ✅ Pull requests targeting `main` or `develop`

**Customize in `.github/workflows/ci.yml`:**
```yaml
on:
  push:
    branches: [main, develop]  # Change these to your branch names
  pull_request:
    branches: [main, develop]
```

---

## Step 6: Push to GitHub

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions CI/CD pipeline"
git push origin main
```

Once pushed, the workflow will automatically:
1. ✅ Run on every push to main/develop
2. ✅ Run on every PR to those branches
3. ✅ Report results in the GitHub UI
4. ✅ Block merging if critical jobs fail (if branch protection enabled)

---

## Workflow Jobs Explained

### Job 1: Test (Parallel with Lint)

```
npm run test:coverage
↓
Jest runs all tests in __tests__/ directory
↓
Coverage report generated (coverage/ folder)
↓
Coverage uploaded to Codecov (if configured)
↓
PR comment with coverage report (if PR)
```

**Passes if:**
- All tests pass
- Coverage meets thresholds (50% global, 70% for action files)

---

### Job 2: Lint (Parallel with Test)

```
npm run lint -- . --max-warnings 0
↓
ESLint checks all files
↓
0 warnings allowed (strict mode)
↓
Continues on error (doesn't block build)
```

**Note**: Lint failures don't block the build but are flagged with ⚠️ warning.

---

### Job 3: Build (Requires Test + Lint)

```
npm ci
↓
npm run build
↓
Verifies .next directory created
↓
Reports build size
```

**Passes if:**
- No build errors
- `.next` directory exists
- All dependencies resolved

**Requires:**
- `NEXT_PUBLIC_SUPABASE_URL` secret
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` secret

---

### Job 4: Status Check (Final Gate)

Aggregates results from all jobs:
- ✅ If tests pass AND build succeeds → **Green check**
- ⚠️ If lint issues → **Yellow warning** (doesn't block)
- ❌ If tests OR build fails → **Red X**

---

## Enabling Branch Protection Rules

To prevent merging without passing CI:

1. Go to **Settings → Branches**
2. Click **Add rule** (or edit `main`)
3. Enable **Require status checks to pass before merging**
4. Select:
   - `Test (Run Tests & Coverage)`
   - `Build (Build Project)`
5. Optionally require: `Lint (Lint Code)`

---

## Local Testing Before Push

Test locally to catch errors before CI runs:

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build (requires Supabase secrets as env vars)
NEXT_PUBLIC_SUPABASE_URL=your_url \
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
npm run build
```

---

## Troubleshooting

### ❌ "Build failed - .next directory not found"
- Check for TypeScript errors: `npm run build` locally
- Verify Supabase secrets are set correctly in GitHub
- Review error log in Actions tab

### ❌ "Tests failed"
- Run `npm test` locally to debug
- Check if jest.config.js exists
- Verify jest.setup.js is configured

### ⚠️ "Linting failed with N warnings"
- Run `npm run lint` locally
- Fix errors: `npm run lint -- --fix`
- Commit fixed files and push

### 📊 "Coverage not uploading to Codecov"
- This is optional - workflow continues without it
- To enable: Create account at codecov.io
- Add CODECOV_TOKEN to GitHub secrets (optional)

---

## Next Steps

After CI/CD is set up:

1. **Monitor Actions Tab**: GitHub → Your Repo → Actions
2. **Review Coverage**: codecov.io/gh/your-org/desklab
3. **Iterate**: Fix issues reported by CI, push again
4. **Scale**: Add more jobs (security scanning, performance testing)

---

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `.github/workflows/ci.yml` | Create | GitHub Actions workflow configuration |
| `package.json` | Update | Add/verify test and lint scripts |
| GitHub Secrets | Create | Store Supabase credentials |

**Status**: ✅ CI/CD Pipeline Ready to Deploy
