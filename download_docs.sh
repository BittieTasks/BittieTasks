#!/bin/bash

# BittieTasks Documentation Download Script
# This script lists all the business documentation files created

echo "BittieTasks Business Documentation Files:"
echo "========================================"
echo ""

# List all the documentation files
docs=(
    "BittieTasks_Business_Plan_2025.md"
    "BittieTasks_Investor_Letter_2025.md"
    "BittieTasks_Brand_Partnership_Letter_2025.md"
    "BittieTasks_Elevator_Pitch_2025.md"
    "BittieTasks_Due_Diligence_Checklist_2025.md"
    "BittieTasks_Legal_Compliance_Guide_2025.md"
    "BittieTasks_Marketing_Strategy_2025.md"
    "BittieTasks_Financial_Model_2025.md"
)

echo "Available documentation files:"
for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        size=$(wc -c < "$doc")
        lines=$(wc -l < "$doc")
        echo "✓ $doc ($lines lines, $size bytes)"
    else
        echo "✗ $doc (not found)"
    fi
done

echo ""
echo "To download these files:"
echo "1. Use the Replit file explorer to view each file"
echo "2. Copy the content and save locally"
echo "3. Or use 'wget' if you deploy this to a web server"
echo ""
echo "All files are in Markdown format (.md) and can be opened with any text editor."