#!/usr/bin/env python3

"""
Fix Regex Issues in security.ts
Fixes three double-backslash regex patterns
"""

import os
import re
import sys
from datetime import datetime
from pathlib import Path

# Colors for console output
class Colors:
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    RESET = '\033[0m'

def log(color, symbol, message):
    print(f"{color}{symbol}{Colors.RESET} {message}")

def main():
    print()
    print(f"{Colors.BLUE}═══════════════════════════════════════={Colors.RESET}")
    print(f"{Colors.BLUE}   Fix security.ts Regex Issues{Colors.RESET}")
    print(f"{Colors.BLUE}═══════════════════════════════════════={Colors.RESET}")
    print()
    
    # Get file path
    script_dir = Path(__file__).parent
    file_path = script_dir.parent / 'supabase' / 'functions' / 'server' / 'security.ts'
    
    # Check if file exists
    if not file_path.exists():
        log(Colors.RED, '✗', f'Error: {file_path} not found!')
        sys.exit(1)
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.parent / f'security.ts.backup.{timestamp}'
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    log(Colors.GREEN, '✓', f'Backup created: {backup_path.name}')
    print()
    
    # Count issues before
    issues_before = len(re.findall(r'\\\\w|\\\\D|\\\\\\.', content))
    log(Colors.YELLOW, '→', f'Found {issues_before} regex issues with double backslashes')
    print()
    
    # Fix 1: String sanitization - on\\w+= should be on\w+=
    log(Colors.YELLOW, '→', 'Fixing: .replace(/on\\\\w+=/gi, \'\') → .replace(/on\\w+=/gi, \'\')')
    content = content.replace('/on\\\\w+=/gi', '/on\\w+=/gi')
    
    # Fix 2: Email validation - \\\. should be \.
    log(Colors.YELLOW, '→', 'Fixing: Email regex \\\\. → \\.')
    content = content.replace('\\\\.', '\\.')
    
    # Fix 3: Phone validation - \\D should be \D
    log(Colors.YELLOW, '→', 'Fixing: .replace(/\\\\D/g, \'\') → .replace(/\\D/g, \'\')')
    content = content.replace('/\\\\\\\\D/', '/\\D/')
    
    print()
    
    # Write the fixed content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Count issues after
    issues_after = len(re.findall(r'\\\\w|\\\\D|\\\\\\.', content))
    
    if issues_after == 0:
        log(Colors.GREEN, '✓', 'All regex issues fixed!')
        print()
        print('Changes made:')
        print('  - Fixed on\\w+= pattern in string sanitization')
        print('  - Fixed \\. pattern in email validation')
        print('  - Fixed \\D pattern in phone validation')
        print()
        print(f"{Colors.GREEN}═══════════════════════════════════════={Colors.RESET}")
        print(f"{Colors.GREEN}   Success! Ready to redeploy{Colors.RESET}")
        print(f"{Colors.GREEN}═══════════════════════════════════════={Colors.RESET}")
        print()
        print('Next steps:')
        print('  1. Deploy to dev: ./scripts/redeploy-backend.sh dev')
        print('  2. Test login at: http://localhost:5173/admin/login')
        print()
        print('To restore backup if needed:')
        print(f'  cp {backup_path} {file_path}')
        print()
    else:
        log(Colors.RED, '✗', f'Warning: {issues_after} issues still remain')
        print()
        
        # Show remaining issues
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            if re.search(r'\\\\w|\\\\D|\\\\\\.', line):
                print(f'  Line {i}: {line.strip()}')
        
        print()
        print('You can restore the backup if needed:')
        print(f'  cp {backup_path} {file_path}')
        sys.exit(1)

if __name__ == '__main__':
    main()
