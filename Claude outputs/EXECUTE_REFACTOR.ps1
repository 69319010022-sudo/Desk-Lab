# DeskLab Code Refactor — Execution Script (PowerShell)
# This script performs cleanup of unused files and folders

param(
    [Switch]$DryRun = $false
)

$projectRoot = "C:\Users\ADMIN\OneDrive\Desktop\Desklab project"

Write-Host "🧹 DeskLab Code Refactor" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host ""

if ($DryRun) {
    Write-Host "⚠️  DRY RUN MODE — No files will be deleted" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Delete "Claude outputs" folder
Write-Host "Step 1: Deleting 'Claude outputs' folder..."
$claudeOutputsPath = Join-Path $projectRoot "Claude outputs"
if (Test-Path $claudeOutputsPath) {
    $folderSize = (Get-ChildItem $claudeOutputsPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    $fileCount = (Get-ChildItem $claudeOutputsPath -Recurse).Count

    Write-Host "   📁 Folder: $claudeOutputsPath"
    Write-Host "   📊 Files: $fileCount"
    Write-Host "   📏 Size: $([math]::Round($folderSize, 2)) MB"

    if (-not $DryRun) {
        Remove-Item -Recurse -Force $claudeOutputsPath
        Write-Host "   ✅ Deleted" -ForegroundColor Green
    } else {
        Write-Host "   [WOULD DELETE]" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Folder not found (already deleted?)" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Delete Navbar.tsx
Write-Host "Step 2: Deleting unused Navbar.tsx component..."
$navbarPath = Join-Path $projectRoot "src\components\Navbar.tsx"
if (Test-Path $navbarPath) {
    $fileSize = (Get-Item $navbarPath).Length
    Write-Host "   📄 File: src/components/Navbar.tsx"
    Write-Host "   📏 Size: $([math]::Round($fileSize / 1KB, 2)) KB"
    Write-Host "   ℹ️  This component was replaced by TopBar.tsx (in use)"

    if (-not $DryRun) {
        Remove-Item $navbarPath
        Write-Host "   ✅ Deleted" -ForegroundColor Green
    } else {
        Write-Host "   [WOULD DELETE]" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  File not found (already deleted?)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 50
Write-Host ""

if ($DryRun) {
    Write-Host "📋 Summary (DRY RUN):" -ForegroundColor Cyan
    Write-Host "   This script WOULD delete:"
    Write-Host "   • Claude outputs/ folder (temp AI files)"
    Write-Host "   • src/components/Navbar.tsx (unused component)"
} else {
    Write-Host "✅ Refactoring Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Run linting: npm run lint"
    Write-Host "   2. Type check:  npm run type-check"
    Write-Host "   3. Run tests:   npm run test"
    Write-Host "   4. Build:       npm run build"
    Write-Host "   5. Commit:      git add -A && git commit -m 'refactor: cleanup'"
    Write-Host ""
}

Write-Host ""
