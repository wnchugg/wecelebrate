#!/usr/bin/env python3
import re
from collections import defaultdict

file_counts = defaultdict(int)
current_file = None

with open('/tmp/lint-145.txt', 'r') as f:
    for line in f:
        if line.startswith('/'):
            current_file = line.strip()
            if 'jala2-app/' in current_file:
                current_file = current_file.split('jala2-app/')[1]
        elif '@typescript-eslint/no-explicit-any' in line and current_file:
            file_counts[current_file] += 1

sorted_files = sorted(file_counts.items(), key=lambda x: x[1], reverse=True)

print("Remaining files with @typescript-eslint/no-explicit-any warnings:\n")
for file, count in sorted_files:
    print(f"{count:4d}  {file}")

print(f"\nTotal: {sum(file_counts.values())} warnings in {len(file_counts)} files")
