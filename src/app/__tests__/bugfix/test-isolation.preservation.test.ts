/**
 * Preservation Test: Test Isolation Configuration
 * 
 * This test ensures that test:full command maintains proper isolation settings
 * to prevent race conditions in parallel CI runs.
 * 
 * Background: Tests were failing in CI with high parallelism due to shared state
 * when isolate=false. This preservation test ensures the fix remains in place.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Test Isolation Configuration Preservation', () => {
  it('should maintain isolate flag in test:full command', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    const testFullCommand = packageJson.scripts['test:full'];
    
    // Verify isolate=true is present for CI test isolation
    expect(testFullCommand).toContain('--isolate=true');
  });

  it('should maintain 6 workers for CI as specified in CI-CD.md', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    const testFullCommand = packageJson.scripts['test:full'];
    
    // CI-CD.md specifies: "CI environment: npm run test:full (6 workers, 6 max concurrency)"
    expect(testFullCommand).toContain('--maxConcurrency=6');
    expect(testFullCommand).toContain('--poolOptions.threads.maxThreads=6');
  });

  it('should disable singleThread for parallel execution', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    const testFullCommand = packageJson.scripts['test:full'];
    
    // Verify singleThread is disabled for parallel execution
    expect(testFullCommand).toContain('--poolOptions.threads.singleThread=false');
  });

  it('should maintain single-threaded execution for test:safe', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    const testSafeCommand = packageJson.scripts['test:safe'];
    
    // Verify test:safe remains single-threaded for local development
    expect(testSafeCommand).toContain('--maxConcurrency=1');
    expect(testSafeCommand).toContain('--poolOptions.threads.maxThreads=1');
  });

  it('should have isolate comment in vitest.config.ts explaining CI override', () => {
    const vitestConfig = readFileSync(
      join(process.cwd(), 'vitest.config.ts'),
      'utf-8'
    );
    
    // Verify documentation exists for isolate setting
    expect(vitestConfig).toContain('isolate');
    expect(vitestConfig).toContain('CI');
  });
});
