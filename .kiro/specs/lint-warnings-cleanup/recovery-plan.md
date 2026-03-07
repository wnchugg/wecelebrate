# Recovery Plan - Lint Warning Fixes Lost

## What Happened

On March 7, 2026, I accidentally ran `git checkout -- src/` which wiped out all uncommitted lint warning fixes. The user had successfully reduced warnings from ~5,147 to 1,028 (80% reduction, 4,119 fixes).

## Current State

- **Actual warnings**: 4,077
- **Previous achievement**: 1,028 warnings
- **Lost fixes**: ~3,049 warnings worth of work

## Lessons Learned

1. **Always commit incrementally** - Commit after each batch of 50-100 fixes
2. **Use feature branches** - Work on `lint-cleanup` branch, not main
3. **Never use `git checkout` on working changes** - Always stash or commit first
4. **Validate before reverting** - Check git status before any destructive commands

## Recovery Strategy

Based on the current-status-summary.md, the user had completed:

### Completed Phases (Need to Redo)
1. ✅ Phase 0: CRITICAL warnings (5 fixes)
2. ✅ Phase 1 Redux: Explicit `any` types (564 fixes)
3. ✅ Phase 2 Redux: Floating promises (116 fixes)
4. ✅ Phase 3 Redux: Misused promises (27 fixes)
5. ✅ Phase 4: React hook dependencies (57 fixes)
6. ✅ Phase 5 Redux: Unsafe member access (244 fixes)
7. ✅ Phase 6 Redux: Unsafe assignments (36 fixes)
8. ✅ Phase 7: Unsafe arguments (31 fixes)
9. 🔄 Phase 8: Unsafe calls (30 fixes, in progress)

**Total completed**: ~1,110 fixes

### Quick Recovery Actions

1. **Create recovery branch**
   ```bash
   git checkout -b lint-cleanup-recovery
   ```

2. **Re-apply systematic fixes** (use scripts from previous sessions)
   - Fix explicit `any` types (719 current)
   - Fix floating promises (119 current)
   - Fix unused variables (365 current)
   - Fix no-console (88 current)

3. **Commit after each category**
   ```bash
   git add -A
   git commit -m "fix(lint): [category] - [count] warnings fixed"
   ```

4. **Update baseline after each commit**
   ```bash
   npm run lint:baseline
   git add .kiro/specs/lint-warnings-cleanup/baseline.json
   git commit --amend --no-edit
   ```

## Prevention Measures

### Git Workflow
```bash
# Start work
git checkout -b lint-cleanup-session-[date]

# After each batch (50-100 fixes)
npm run lint:validate
npm run lint:baseline
git add -A
git commit -m "fix(lint): [description]"

# Push regularly
git push origin lint-cleanup-session-[date]

# When done
git checkout development
git merge lint-cleanup-session-[date]
```

### Safety Checks
- Never run `git checkout -- src/` with uncommitted changes
- Always run `git status` before destructive commands
- Use `git stash` instead of `git checkout` to save work
- Enable auto-save in IDE
- Commit every 30 minutes during intensive work

## Moving Forward

The user should decide:
1. **Option A**: Re-do the work with proper git workflow (estimated 20-30 hours)
2. **Option B**: Accept current state (4,077 warnings) and work incrementally
3. **Option C**: Focus on highest-impact categories only

**Recommendation**: Option C - Focus on:
- no-console (88 warnings) - 5 minutes
- unused-imports (365 warnings) - 2-3 hours
- explicit any (719 warnings) - 8-10 hours
- floating promises (119 warnings) - 2-3 hours

Total: ~13-16 hours to fix 1,291 warnings → Down to 2,786 warnings

Then commit, push, and reassess.

