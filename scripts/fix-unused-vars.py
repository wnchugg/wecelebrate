#!/usr/bin/env python3
"""
Script to extract unused variable warnings from ESLint output
"""
import json
import subprocess
import sys
from collections import defaultdict

# Run lint with JSON format
result = subprocess.run(
    ['npm', 'run', 'lint', '--', '--format', 'json'],
    capture_output=True,
    text=True
)

try:
    data = json.loads(result.stdout)
except:
    print("Failed to parse JSON output")
    sys.exit(1)

# Extract unused variable warnings
unused_vars = []
for file_data in data:
    filepath = file_data['filePath']
    # Make path relative
    if '/jala2-app/' in filepath:
        filepath = filepath.split('/jala2-app/')[1]
    
    for msg in file_data['messages']:
        if msg.get('ruleId') == 'unused-imports/no-unused-vars':
            message = msg['message']
            if "'" in message:
                var_name = message.split("'")[1]
            else:
                var_name = 'unknown'
            
            unused_vars.append({
                'file': filepath,
                'line': msg['line'],
                'column': msg['column'],
                'var': var_name
            })

# Group by file
by_file = defaultdict(list)
for item in unused_vars:
    by_file[item['file']].append(item)

# Print summary
print(f"Total unused variables: {len(unused_vars)}")
print(f"Files affected: {len(by_file)}")
print("\nTop 30 files:\n")

for file, items in sorted(by_file.items(), key=lambda x: len(x[1]), reverse=True)[:30]:
    print(f"{len(items):3d} {file}")
    for item in items[:3]:
        print(f"      L{item['line']:4d}: {item['var']}")
    if len(items) > 3:
        print(f"      ... +{len(items) - 3} more")
