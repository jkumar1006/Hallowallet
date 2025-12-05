#!/usr/bin/env python3
import re

with open('src/app/api/suggestions/route.ts', 'r') as f:
    lines = f.readlines()

# Find and remove the period check section
new_lines = []
skip_until_brace = False
brace_count = 0
i = 0

while i < len(lines):
    line = lines[i]
    
    # Start skipping when we find "Ask for period"
    if "Ask for period if not specified" in line:
        skip_until_brace = True
        brace_count = 0
        i += 1
        continue
    
    if skip_until_brace:
        # Count braces to know when the if block ends
        brace_count += line.count('{') - line.count('}')
        if brace_count <= 0 and '}' in line:
            skip_until_brace = False
            i += 1
            continue
    
    if not skip_until_brace:
        new_lines.append(line)
    
    i += 1

with open('src/app/api/suggestions/route.ts', 'w') as f:
    f.writelines(new_lines)

print("✅ Removed period check section")
