# Vitest Resource Usage Fix

## Problem
50+ Vitest processes were spawning simultaneously on MacBook, consuming excessive CPU and memory.

## Root Cause
- Config had `maxConcurrency: 2` and `maxThreads: 2`
- Multiple test runs spawning separate Vitest instances
- `isolate: true` was using more memory than necessary

## Solution Applied

### 1. Updated `vitest.config.ts`
- Reduced to single-threaded execution: `maxConcurrency: 1`, `maxThreads: 1`
- Added `singleThread: true` to force single-threaded mode
- Changed `isolate: false` to share context (reduces memory)
- Added `pool: 'threads'` for efficiency

### 2. Updated `package.json` Scripts
- `test:safe`: Now explicitly passes `--maxConcurrency=1 --poolOptions.threads.maxThreads=1`
- `test:full`: Overrides with `--maxConcurrency=4 --poolOptions.threads.maxThreads=4 --poolOptions.threads.singleThread=false` for CI
- Added `test:kill`: New command to terminate all Vitest processes

### 3. Created Kill Script
- `scripts/kill-vitest.sh`: Safely terminates all Vitest node processes
- Accessible via `npm run test:kill`

### 4. Updated Documentation
- Updated `.kiro/steering/CI-CD.md` with new resource limits
- Added `test:kill` to debug commands section

## Usage

### Running Tests Locally (MacBook-friendly)
```bash
npm run test:safe
```

### Running Tests in CI (Higher performance)
```bash
npm run test:full
```

### Kill Lingering Processes
```bash
npm run test:kill
```

### Manual Kill (if needed)
```bash
pkill -9 -f "node.*vitest"
```

## Verification
All 50+ processes were successfully terminated. New config ensures only 1 Vitest worker runs at a time locally.
