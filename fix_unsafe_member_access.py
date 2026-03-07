#!/usr/bin/env python3
"""
Script to help identify and fix unsafe member access warnings
"""
import re
import sys
from collections import defaultdict

def parse_lint_output(lint_file):
    """Parse lint output to extract file paths and warning details"""
    warnings = defaultdict(list)
    current_file = None
    
    with open(lint_file, 'r') as f:
        for line in f:
            # Match file path lines
            if line.startswith('/Users/') and 'jala2-app/' in line:
                # Extract relative path
                match = re.search(r'jala2-app/(.+?)$', line.strip())
                if match:
                    current_file = match.group(1)
            
            # Match unsafe member access warnings
            elif 'Unsafe member access' in line and current_file:
                # Extract line number and property name
                line_match = re.match(r'\s+(\d+):(\d+)\s+warning\s+Unsafe member access \.(\w+)', line)
                if line_match:
                    line_num = line_match.group(1)
                    property_name = line_match.group(3)
                    warnings[current_file].append({
                        'line': int(line_num),
                        'property': property_name
                    })
    
    return warnings

def group_by_property(warnings):
    """Group warnings by property name"""
    by_property = defaultdict(lambda: defaultdict(list))
    
    for file_path, file_warnings in warnings.items():
        for warning in file_warnings:
            by_property[warning['property']][file_path].append(warning['line'])
    
    return by_property

def main():
    lint_file = '/tmp/lint2.txt'
    warnings = parse_lint_output(lint_file)
    
    print(f"Total files with warnings: {len(warnings)}")
    print(f"Total warnings: {sum(len(w) for w in warnings.values())}")
    print()
    
    # Show top files
    print("Top 20 files by warning count:")
    sorted_files = sorted(warnings.items(), key=lambda x: len(x[1]), reverse=True)
    for file_path, file_warnings in sorted_files[:20]:
        print(f"  {len(file_warnings):3d} - {file_path}")
    print()
    
    # Group by property
    by_property = group_by_property(warnings)
    print("Warnings by property:")
    for prop, files in sorted(by_property.items(), key=lambda x: sum(len(v) for v in x[1].values()), reverse=True):
        total = sum(len(lines) for lines in files.values())
        print(f"  {total:3d} - .{prop} (in {len(files)} files)")
    print()
    
    # Show files for each property
    print("\nFiles by property (top 3 properties):")
    for prop, files in list(sorted(by_property.items(), key=lambda x: sum(len(v) for v in x[1].values()), reverse=True))[:3]:
        total = sum(len(lines) for lines in files.values())
        print(f"\n.{prop} ({total} warnings in {len(files)} files):")
        for file_path in sorted(files.keys()):
            print(f"  {file_path}: lines {sorted(files[file_path])}")

if __name__ == '__main__':
    main()
