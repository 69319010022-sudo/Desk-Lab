#!/bin/bash

# DeskLab Code Refactor — Execution Script (Bash/Linux/Mac)
# This script performs cleanup of unused files and folders

set -e

PROJECT_ROOT="$HOME/OneDrive/Desktop/Desklab project"
DRY_RUN=false

# Parse arguments
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
fi

echo "🧹 DeskLab Code Refactor"
echo "=================================================="
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "⚠️  DRY RUN MODE — No files will be deleted"
    echo ""
fi

# Step 1: Delete "Claude outputs" folder
echo "Step 1: Deleting 'Claude outputs' folder..."
CLAUDE_OUTPUTS_PATH="$PROJECT_ROOT/Claude outputs"

if [ -d "$CLAUDE_OUTPUTS_PATH" ]; then
    FILE_COUNT=$(find "$CLAUDE_OUTPUTS_PATH" -type f | wc -l)
    FOLDER_SIZE=$(du -sh "$CLAUDE_OUTPUTS_PATH" | cut -f1)

    echo "   📁 Folder: Claude outputs/"
    echo "   📊 Files: $FILE_COUNT"
    echo "   📏 Size: $FOLDER_SIZE"

    if [ "$DRY_RUN" = false ]; then
        rm -rf "$CLAUDE_OUTPUTS_PATH"
        echo "   ✅ Deleted"
    else
        echo "   [WOULD DELETE]"
    fi
else
    echo "   ⚠️  Folder not found (already deleted?)"
fi

echo ""

# Step 2: Delete Navbar.tsx
echo "Step 2: Deleting unused Navbar.tsx component..."
NAVBAR_PATH="$PROJECT_ROOT/src/components/Navbar.tsx"

if [ -f "$NAVBAR_PATH" ]; then
    FILE_SIZE=$(du -h "$NAVBAR_PATH" | cut -f1)
    echo "   📄 File: src/components/Navbar.tsx"
    echo "   📏 Size: $FILE_SIZE"
    echo "   ℹ️  This component was replaced by TopBar.tsx (in use)"

    if [ "$DRY_RUN" = false ]; then
        rm "$NAVBAR_PATH"
        echo "   ✅ Deleted"
    else
        echo "   [WOULD DELETE]"
    fi
else
    echo "   ⚠️  File not found (already deleted?)"
fi

echo ""
echo "=================================================="
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "📋 Summary (DRY RUN):"
    echo "   This script WOULD delete:"
    echo "   • Claude outputs/ folder (temp AI files)"
    echo "   • src/components/Navbar.tsx (unused component)"
    echo ""
    echo "To execute for real, run without --dry-run:"
    echo "  ./EXECUTE_REFACTOR.sh"
else
    echo "✅ Refactoring Complete!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Run linting: npm run lint"
    echo "   2. Type check:  npm run type-check"
    echo "   3. Run tests:   npm run test"
    echo "   4. Build:       npm run build"
    echo "   5. Commit:      git add -A && git commit -m 'refactor: cleanup'"
    echo ""
fi

echo ""
