#!/usr/bin/env python3
"""
Fix @/app/ import paths to relative paths for Figma Make compatibility
"""

import os
import re
from pathlib import Path

def fix_imports_in_file(file_path):
    """Fix all @/app/ imports in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix imports based on common patterns
        # UI components: @/app/components/ui/* -> ./ui/*
        content = re.sub(r'from ["\']@/app/components/ui/', r'from "./ui/', content)
        content = re.sub(r'import\(["\']@/app/components/ui/', r'import("./ui/', content)
        
        # Components: @/app/components/* -> ./
        content = re.sub(r'from ["\']@/app/components/', r'from "./', content)
        content = re.sub(r'import\(["\']@/app/components/', r'import("./', content)
        
        # Context: @/app/context/* -> ../context/
        content = re.sub(r'from ["\']@/app/context/', r'from "../context/', content)
        content = re.sub(r'import\(["\']@/app/context/', r'import("../context/', content)
        
        # Utils: @/app/utils/* -> ../utils/
        content = re.sub(r'from ["\']@/app/utils/', r'from "../utils/', content)
        content = re.sub(r'import\(["\']@/app/utils/', r'import("../utils/', content)
        
        # Data: @/app/data/* -> ../data/
        content = re.sub(r'from ["\']@/app/data/', r'from "../data/', content)
        content = re.sub(r'import\(["\']@/app/data/', r'import("../data/', content)
        
        # Config: @/app/config/* -> ../config/
        content = re.sub(r'from ["\']@/app/config/', r'from "../config/', content)
        content = re.sub(r'import\(["\']@/app/config/', r'import("../config/', content)
        
        # Pages: @/app/pages/* -> ../pages/
        content = re.sub(r'from ["\']@/app/pages/', r'from "../pages/', content)
        content = re.sub(r'import\(["\']@/app/pages/', r'import("../pages/', content)
        
        if content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {file_path}")
            return True
        return False
        
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    print("🔧 Fixing import paths for Figma Make...\n")
    
    directories = [
        'src/app/components',
        'src/app/pages',
        'src/app/context',
        'src/app/utils',
    ]
    
    total_fixed = 0
    
    for directory in directories:
        if not os.path.exists(directory):
            continue
            
        print(f"\n📁 Processing {directory}...")
        
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(('.tsx', '.ts')):
                    file_path = os.path.join(root, file)
                    if fix_imports_in_file(file_path):
                        total_fixed += 1
    
    print(f"\n✅ Complete! Fixed {total_fixed} files.")

if __name__ == '__main__':
    main()
