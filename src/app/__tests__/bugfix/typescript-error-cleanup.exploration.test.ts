/**
 * Bug Condition Exploration Test - TypeScript Error Cleanup
 * 
 * **Property 1: Fault Condition** - TypeScript Compilation Failure with 334 Errors
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * **DO NOT attempt to fix the test or the code when it fails**
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation.
 * The goal is to surface counterexamples that demonstrate the bug exists.
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'

describe('TypeScript Error Cleanup - Bug Condition Exploration', () => {
  it('should verify TypeScript compilation fails with 334 errors on unfixed code', () => {
    /**
     * **Scoped PBT Approach**: Scope the property to concrete failing cases
     * Run type check on unfixed code and verify 334 errors exist
     * 
     * **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
     */
    
    let typeCheckOutput = ''
    let exitCode = 0
    
    try {
      // Run type-check command and capture output
      typeCheckOutput = execSync('npm run type-check', {
        encoding: 'utf-8',
        stdio: 'pipe',
        cwd: process.cwd()
      })
    } catch (error: any) {
      // Type check is expected to fail, capture the output
      exitCode = error.status || 1
      typeCheckOutput = error.stdout || error.stderr || ''
    }
    
    // Parse error output to extract error information
    const errorLines = typeCheckOutput.split('\n')
    const errorPattern = /^(.+\.tsx?)\((\d+),(\d+)\): error (TS\d+):/
    const errors: Array<{
      file: string
      line: number
      column: number
      code: string
      message: string
    }> = []
    
    let currentError: any = null
    
    for (const line of errorLines) {
      const match = line.match(errorPattern)
      if (match) {
        if (currentError) {
          errors.push(currentError)
        }
        currentError = {
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: line.substring(match[0].length).trim()
        }
      } else if (currentError && line.trim()) {
        currentError.message += ' ' + line.trim()
      }
    }
    
    if (currentError) {
      errors.push(currentError)
    }
    
    // Extract summary line (e.g., "Found 334 errors in 61 files.")
    const summaryMatch = typeCheckOutput.match(/Found (\d+) errors? in (\d+) files?\./)
    const errorCount = summaryMatch ? parseInt(summaryMatch[1]) : errors.length
    const fileCount = summaryMatch ? parseInt(summaryMatch[2]) : new Set(errors.map(e => e.file)).size
    
    // Categorize errors by error code
    const errorsByCode: Record<string, number> = {}
    const errorsByCategory: Record<string, Array<{ file: string; code: string; message: string }>> = {
      'HTMLElement Type Errors (TS2339)': [],
      'Function Argument Mismatches (TS2554)': [],
      'Implicit Any Types (TS7053)': [],
      'Missing Return Types (TS7011)': [],
      'Type Assignment Errors (TS2322)': [],
      'Undefined Property Access (TS2339)': [],
      'Index Signature Errors (TS7053)': []
    }
    
    for (const error of errors) {
      errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1
      
      // Categorize errors
      if (error.code === 'TS2339' && error.file.includes('__tests__')) {
        errorsByCategory['HTMLElement Type Errors (TS2339)'].push({
          file: error.file,
          code: error.code,
          message: error.message
        })
      } else if (error.code === 'TS2554' && (error.file.includes('admin') || error.file.includes('components'))) {
        errorsByCategory['Function Argument Mismatches (TS2554)'].push({
          file: error.file,
          code: error.code,
          message: error.message
        })
      } else if (error.code === 'TS7053' && error.file.includes('hooks')) {
        errorsByCategory['Implicit Any Types (TS7053)'].push({
          file: error.file,
          code: error.code,
          message: error.message
        })
      } else if (error.code === 'TS7011' && error.file.includes('db-optimizer')) {
        errorsByCategory['Missing Return Types (TS7011)'].push({
          file: error.file,
          code: error.code,
          message: error.message
        })
      } else if (error.code === 'TS2322' && error.file.includes('services')) {
        errorsByCategory['Type Assignment Errors (TS2322)'].push({
          file: error.file,
          code: error.code,
          message: error.message
        })
      } else if (error.code === 'TS2339' && !error.file.includes('__tests__')) {
        errorsByCategory['Undefined Property Access (TS2339)'].push({
          file: error.file,
          code: error.code,
          message: error.message
        })
      } else if (error.code === 'TS7053' && !error.file.includes('hooks')) {
        errorsByCategory['Index Signature Errors (TS7053)'].push({
          file: error.file,
          code: error.code,
          message: error.message
        })
      }
    }
    
    // Document counterexamples found
    console.log('\n=== BUG CONDITION EXPLORATION RESULTS ===\n')
    console.log(`Total TypeScript Errors: ${errorCount}`)
    console.log(`Files Affected: ${fileCount}`)
    console.log(`Type Check Exit Code: ${exitCode}`)
    console.log('\nError Distribution by Code:')
    Object.entries(errorsByCode)
      .sort((a, b) => b[1] - a[1])
      .forEach(([code, count]) => {
        console.log(`  ${code}: ${count} errors`)
      })
    
    console.log('\nError Categories (Expected Patterns):')
    for (const [category, categoryErrors] of Object.entries(errorsByCategory)) {
      if (categoryErrors.length > 0) {
        console.log(`\n  ${category}: ${categoryErrors.length} errors`)
        // Show first 3 examples from each category
        categoryErrors.slice(0, 3).forEach(err => {
          console.log(`    - ${err.file}`)
          console.log(`      ${err.code}: ${err.message.substring(0, 100)}${err.message.length > 100 ? '...' : ''}`)
        })
        if (categoryErrors.length > 3) {
          console.log(`    ... and ${categoryErrors.length - 3} more`)
        }
      }
    }
    
    console.log('\n=== EXPECTED OUTCOME ===')
    console.log('This test SHOULD FAIL on unfixed code (proving the bug exists)')
    console.log('After fixes are applied, this test should PASS (proving the bug is fixed)')
    console.log('=====================================\n')
    
    // Verify the bug condition exists
    // This assertion will FAIL on unfixed code (which is correct - it proves the bug exists)
    // After fixes are applied, this assertion will PASS (proving the bug is fixed)
    expect(exitCode, 
      `TypeScript compilation should succeed with 0 errors, but found ${errorCount} errors in ${fileCount} files. ` +
      `This is expected on unfixed code - the test failure confirms the bug exists.`
    ).toBe(0)
    
    expect(errorCount,
      `Expected 0 TypeScript errors after fixes, but found ${errorCount} errors. ` +
      `On unfixed code, we expect 334 errors - this test failure is correct and proves the bug exists.`
    ).toBe(0)
    
    // Verify expected error categories are present (on unfixed code)
    // These checks document the expected error patterns
    const hasTS2339 = errorsByCode['TS2339'] > 0
    const hasTS2554 = errorsByCode['TS2554'] > 0
    const hasTS7053 = errorsByCode['TS7053'] > 0
    const hasTS7011 = errorsByCode['TS7011'] > 0
    const hasTS2322 = errorsByCode['TS2322'] > 0
    
    // On unfixed code, we expect these error categories to exist
    // After fixes, these should all be resolved
    if (errorCount > 0) {
      console.log('\nVerifying expected error categories exist (on unfixed code):')
      console.log(`  TS2339 (Property errors): ${hasTS2339 ? '✓ Found' : '✗ Not found'}`)
      console.log(`  TS2554 (Argument errors): ${hasTS2554 ? '✓ Found' : '✗ Not found'}`)
      console.log(`  TS7053 (Index signature errors): ${hasTS7053 ? '✓ Found' : '✗ Not found'}`)
      console.log(`  TS7011 (Return type errors): ${hasTS7011 ? '✓ Found' : '✗ Not found'}`)
      console.log(`  TS2322 (Type assignment errors): ${hasTS2322 ? '✓ Found' : '✗ Not found'}`)
    }
  })
})
