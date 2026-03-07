#!/usr/bin/env python3
import re
from collections import defaultdict

file_counts = defaultdict(int)
current_file = None

with open('/tmp/lint-output.txt', 'r') as f:
    for line in f:
        # Match file paths
        if line.startswith('/'):
            current_file = line.strip()
            # Extract relative path
            if 'jala2-app/' in current_file:
                current_file = current_file.split('jala2-app/')[1]
        # Match the warning
        elif '@typescript-eslint/no-explicit-any' in line and current_file:
            file_counts[current_file] += 1

# Sort by count descending
sorted_files = sorted(file_counts.items(), key=lambda x: x[1], reverse=True)

print("Top 50 files with most @typescript-eslint/no-explicit-any warnings:\n")
for file, count in sorted_files[:50]:
    print(f"{count:4d}  {file}")

print(f"\nTotal warnings: {sum(file_counts.values())}")
print(f"Total files: {len(file_counts)}")
