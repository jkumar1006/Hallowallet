#!/usr/bin/env python3
import re

# Read the file
with open('src/app/api/suggestions/route.ts', 'r') as f:
    content = f.read()

# Find and replace the goal parsing section
# Pattern to match from "console.log("[API] Goal keyword detected")" to "if (limit) {"
pattern = r'(console\.log\("\[API\] Goal keyword detected"\);)\s*\n\s*\n\s*// Parse different formats:.*?if \(limit\) \{'

replacement = r'''\1

    // Use flexible parser that handles "thousand dollars" and word amounts
    const { amount: limit, period, category } = parseCommand(text);
    
    console.log("[API] Goal parsed - limit:", limit, "category:", category, "period:", period);
    
    if (limit) {'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Also remove the "Ask for period if not specified" section
pattern2 = r'// Ask for period if not specified\s*\n\s*if \(!period\) \{[^}]*\}\s*\n\s*return NextResponse\.json\(\{ messages \}\);\s*\n\s*\}'

content = re.sub(pattern2, '', content, flags=re.DOTALL)

# Write back
with open('src/app/api/suggestions/route.ts', 'w') as f:
    f.write(content)

print("✅ Fixed goal parsing to use parseCommand()")
