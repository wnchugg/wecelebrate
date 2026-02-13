# Workflow Visual Diagram - 10 Stages

**Version:** 1.0  
**Last Updated:** February 12, 2026  
**Related:** [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)

---

## 🔄 Complete 10-Stage Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      WECELEBRATE SDLC WORKFLOW                       │
│                           10-Stage Process                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│ 1. BACKLOG  │  ← Product Owner creates & prioritizes stories
└──────┬──────┘
       │ DoR Check ✅
       ↓
┌──────────────────────┐
│ 2. READY FOR DEV     │  ← Meets Definition of Ready
└──────┬───────────────┘
       │ Developer picks story
       ↓
┌──────────────────────┐
│ 3. IN DEVELOPMENT    │  ← Active coding
└──────┬───────────────┘
       │ PR created & reviewed
       ↓
┌──────────────────────┐
│ 4. DEV DONE          │  ← Dev DoD met: Code review ✅, Tests ✅,
└──────┬───────────────┘    TypeScript ✅, ESLint ✅, Docs ✅
       │ Deploy to test environment
       ↓
┌──────────────────────┐
│ 5. READY FOR QA      │  ← Handoff to QA with test cases
└──────┬───────────────┘
       │ QA starts testing
       ↓
┌──────────────────────┐
│ 6. IN QA TESTING     │  ← QA executing test scenarios
└──────┬───────────────┘
       │ QA approves ✅ (or back to Dev if bugs found ❌)
       ↓
┌──────────────────────┐
│ 7. READY FOR UAT     │  ← Deploy to UAT environment
└──────┬───────────────┘
       │ Stakeholders start testing
       ↓
┌──────────────────────┐
│ 8. IN UAT            │  ← User Acceptance Testing
└──────┬───────────────┘
       │ Stakeholders approve ✅ (or back to Dev/QA if issues ❌)
       ↓
┌──────────────────────┐
│ 9. READY FOR RELEASE │  ← CAB approval ✅, Security scan ✅,
└──────┬───────────────┘    Release notes ✅, Rollback plan ✅
       │ Production deployment
       ↓
┌──────────────────────┐
│ 10. RELEASED         │  ← Live in production, monitoring active
└──────────────────────┘
```

---

## 🚦 Quality Gates & Owners

```
┌────────┬─────────────────────┬─────────────────────────┬─────────────────┐
│ Stage  │ Quality Gates       │ Owner                   │ Duration Target │
├────────┼─────────────────────┼─────────────────────────┼─────────────────┤
│ 1      │ • Story created     │ Product Owner           │ Variable        │
│ Backlog│ • Prioritized       │                         │                 │
├────────┼─────────────────────┼─────────────────────────┼─────────────────┤
│ 2      │ • DoR met ✅         │ Product Owner           │ < 1 sprint      │
│ Ready  │ • Team understands  │ + Tech Lead             │                 │
│ for Dev│ • No blockers       │                         │                 │
├────────┼─────────────────────┼─────────────────────────┼─────────────────┤
│ 3      │ • Code complete     │ Developer               │ 1-5 days        │
│ In Dev │ • Tests written     │                         │                 │
│        │ • PR created        │                         │                 │
├────────┼─────────────────────┼─────────────────────────┼─────────────────┤
│ 4      │ • TypeScript ✅      │ Developer               │ < 1 day         │
│ Dev    │ • ESLint ✅          │ + Reviewer              │                 │
│ Done   │ • Tests ✅ (≥80%)    │                         │                 │
│        │ • Code review ✅     │                         │                 │
│        │ • Docs ✅            │                         │                 │
│        │ • QA cases ready ✅  │                         │                 │
├────────┼─────────────────────┼─────────────────────────┼─────────────────┤
│ 5      │ • Deployed to test  │ Developer               │ < 4 hours       │
│ Ready  │ • QA notified       │ → handoff to QA         │                 │
│ for QA │ • Test data ready   │                         │                 │
├────────┼─────────────────────┼─────────────────────────┼─────────────────┤
│ 6      │ • All tests pass ✅  │ QA Engineer             │ 1-3 days        │
│ In QA  │ • AC verified ✅     │                         │                 │
│ Testing│ • No critical bugs  │                         │                 │
├────────┼─────────────────────┼─────────────────────────┼─────────────────┤
│ 7      │ • QA approved       │ Product Owner           │ < 1 day         │
│ Ready  │ • UAT deployed      │ + QA                    │                 │
│ for UAT│ • User docs ready   │                         │                 │
├────────┼─────────────────────┼─────────────────────────┼─────────────────┤
│ 8      │ • UAT complete      │ Product Owner           │ 2-5 days        │
│ In UAT │ • Stakeholder OK ✅  │ + Stakeholders          │                 │
│        │ • No critical issues│                         │                 │
├────────┼─────────────────────┼─────────────────────────┼─────────────────┤
│ 9      │ • CAB approval ✅    │ Tech Lead               │ 1-2 days        │
│ Ready  │ • Security scan ✅   │ + Release Manager       │                 │
│ for    │ • Release notes ✅   │                         │                 │
│ Release│ • Rollback plan ✅   │                         │                 │
├────────┼─────────────────────┼─────────────────────────┼─────────────────┤
│ 10     │ • Prod deployed ✅   │ DevOps                  │ Ongoing         │
│Released│ • Smoke tests ✅     │ + Tech Lead             │ (24-48hr watch) │
│        │ • Monitoring OK ✅   │                         │                 │
│        │ • Full DoD met ✅    │                         │                 │
└────────┴─────────────────────┴─────────────────────────┴─────────────────┘
```

---

## 🔀 Rollback Paths

```
                    ┌─────────────────┐
                    │   6. IN QA      │
                    │    TESTING      │
                    └────┬────────┬───┘
                         │        │
                    PASS │        │ FAIL (bugs found)
                         │        │
                         ↓        ↓
              ┌──────────────┐  ┌──────────────┐
              │ 7. READY FOR │  │ 3. BACK TO   │
              │     UAT      │  │ DEVELOPMENT  │
              └──────┬───────┘  └──────────────┘
                     │
                     ↓
              ┌──────────────┐
              │  8. IN UAT   │
              └──────┬───────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    APPROVED     MINOR       MAJOR
         │        ISSUES     ISSUES
         │           │           │
         ↓           ↓           ↓
   ┌──────────┐ ┌─────────┐ ┌──────────┐
   │ 9. READY │ │ BACK TO │ │ BACK TO  │
   │   FOR    │ │   DEV   │ │    QA    │
   │ RELEASE  │ └─────────┘ └──────────┘
   └────┬─────┘
        │
        ↓
   ┌──────────┐
   │ 10.      │
   │ RELEASED │
   └────┬─────┘
        │
        │ Critical issue in production?
        │
        ↓
   ┌──────────────┐
   │ ROLLBACK TO  │
   │ PREVIOUS     │
   │ STABLE       │
   │ VERSION      │
   └──────────────┘
        │
        ↓
   Move story back to "3. IN DEVELOPMENT"
```

---

## 📊 Stage Duration Targets

```
Total Time from Ready to Released: 7-16 days

┌────────────────────┬──────────┬────────────┐
│ Stage              │ Target   │ Cumulative │
├────────────────────┼──────────┼────────────┤
│ Ready for Dev      │ -        │ Day 0      │
│ In Development     │ 1-5 days │ Day 1-5    │
│ Dev Done           │ < 1 day  │ Day 5-6    │
│ Ready for QA       │ < 4 hrs  │ Day 6      │
│ In QA Testing      │ 1-3 days │ Day 7-9    │
│ Ready for UAT      │ < 1 day  │ Day 9-10   │
│ In UAT             │ 2-5 days │ Day 10-15  │
│ Ready for Release  │ 1-2 days │ Day 15-16  │
│ Released           │ Ongoing  │ Day 16+    │
└────────────────────┴──────────┴────────────┘

Optimistic: 7 days
Realistic: 12 days
Pessimistic: 16 days
```

---

## 🎯 Dev Done Checklist (Stage 4 Details)

```
┌──────────────────────────────────────────────────────┐
│              DEV DONE QUALITY GATE                   │
│                                                      │
│  All 6 criteria must be met:                        │
│                                                      │
│  ✅ 1. Code Reviewed                                 │
│     └─ At least 1 peer approval                     │
│                                                      │
│  ✅ 2. TypeScript Errors Fixed                       │
│     └─ npm run type-check passes                    │
│                                                      │
│  ✅ 3. ESLint Errors Fixed                           │
│     └─ npm run lint passes (zero errors)            │
│                                                      │
│  ✅ 4. Automated Tests Created                       │
│     └─ Unit tests for all new code                  │
│     └─ Minimum 80% coverage                         │
│     └─ npm test passes                              │
│                                                      │
│  ✅ 5. Application Documentation Updated             │
│     └─ Code comments (JSDoc)                        │
│     └─ README updates                               │
│     └─ API documentation (if applicable)            │
│                                                      │
│  ✅ 6. Test Data & Cases for QA                      │
│     └─ Test scenarios documented                    │
│     └─ Test data prepared                           │
│     └─ Handoff document created                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Ready for Release Checklist (Stage 9 Details)

```
┌──────────────────────────────────────────────────────┐
│          READY FOR RELEASE QUALITY GATE              │
│                                                      │
│  All 4 criteria must be met:                        │
│                                                      │
│  ✅ 1. CAB Approval                                  │
│     └─ Change Advisory Board reviewed               │
│     └─ Release approved by CAB                      │
│     └─ Deployment window scheduled                  │
│                                                      │
│  ✅ 2. Security Scan Complete                        │
│     └─ Vulnerability scan passed                    │
│     └─ No critical security issues                  │
│     └─ Dependency audit clean                       │
│                                                      │
│  ✅ 3. Added to Release Version                      │
│     └─ Release tagged in version control            │
│     └─ Feature included in release manifest         │
│     └─ Version number updated                       │
│                                                      │
│  ✅ 4. Release Notes Documented                      │
│     └─ User-facing changes documented               │
│     └─ Breaking changes highlighted                 │
│     └─ Migration guide (if needed)                  │
│     └─ Rollback procedure documented                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📈 Workflow Metrics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                   WORKFLOW HEALTH METRICS                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Cycle Time (In Dev → Released)                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 12 days   Target: <15 │
│                                                             │
│  Dev Done First-Time Pass Rate                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 85%       Target: >80%│
│                                                             │
│  QA First-Time Pass Rate                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 75%          Target: >70%│
│                                                             │
│  UAT First-Time Pass Rate                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 80%       Target: >75%│
│                                                             │
│  Production Defects (per sprint)                           │
│  ━━━━━━━━━ 1 defect                             Target: <2  │
│                                                             │
│  Stories in Each Stage:                                    │
│   Backlog: ██████████████ 45                                │
│   Ready for Dev: ███ 10                                    │
│   In Development: █████ 15                                 │
│   Dev Done: ██ 5                                           │
│   Ready for QA: █ 3                                        │
│   In QA Testing: ██ 6                                      │
│   Ready for UAT: █ 2                                       │
│   In UAT: █ 4                                              │
│   Ready for Release: █ 2                                   │
│   Released: ████████████████████ 65                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Parallel Work Streams

```
Multiple stories can be in different stages simultaneously:

Sprint Week View:
┌──────────────────────────────────────────────────────────┐
│ Mon     Tue     Wed     Thu     Fri     Mon     Tue      │
├──────────────────────────────────────────────────────────┤
│ Story A:                                                 │
│ [Dev]━━━[DevDone]━[QA]━━━[UAT]━━━━━━[Release]━[Released]│
│                                                          │
│ Story B:                                                 │
│      [Dev]━━━━━[DevDone]━[QA]━━━[UAT]━━━━━[Release]     │
│                                                          │
│ Story C:                                                 │
│           [Dev]━━━━━━[DevDone]━[QA]━━━[UAT]             │
│                                                          │
│ Story D:                                                 │
│                 [Dev]━━━━━[DevDone]━[QA]                │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Coding (for tools)

Suggested colors for project management tools:

```
Stage 1: Backlog          → Gray     #6B7280
Stage 2: Ready for Dev    → Blue     #3B82F6
Stage 3: In Development   → Yellow   #EAB308
Stage 4: Dev Done         → Orange   #F97316
Stage 5: Ready for QA     → Cyan     #06B6D4
Stage 6: In QA Testing    → Indigo   #6366F1
Stage 7: Ready for UAT    → Purple   #A855F7
Stage 8: In UAT           → Pink     #EC4899
Stage 9: Ready for Release→ Emerald  #10B981
Stage 10: Released        → Green    #22C55E
```

---

## 🔧 Tool Configuration Examples

### Jira Board Setup

```
Columns:
1. Backlog
2. Ready for Dev
3. In Development
4. Dev Done
5. Ready for QA
6. In QA
7. Ready for UAT
8. In UAT
9. Ready for Release
10. Released

Swimlanes:
- By Priority (P0, P1, P2, P3)
- By Assignee
- By Epic

Automation Rules:
1. When status changes to "Dev Done" → Notify QA team
2. When PR merged → Move to "Dev Done"
3. When all tests pass → Enable "Ready for QA"
4. When QA approved → Enable "Ready for UAT"
```

### GitHub Projects Setup

```
Board View:
1. Backlog | 2. Ready | 3. In Dev | 4. Dev Done | 5-10. (Remaining stages)

Labels:
- stage: backlog
- stage: ready-for-dev
- stage: in-development
- stage: dev-done
- stage: ready-for-qa
- stage: in-qa
- stage: ready-for-uat
- stage: in-uat
- stage: ready-for-release
- stage: released

Automation:
- PR opened → "In Development"
- PR approved + CI passes → "Dev Done"
- Labeled "qa-approved" → "Ready for UAT"
```

---

## 📋 Stage Transition Checklist Template

Use this checklist when moving stories between stages:

```markdown
## Moving Story US-XXX: [Title]

### From: [Current Stage] → To: [Next Stage]

#### Exit Criteria Check (Current Stage)
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

#### Entry Criteria Check (Next Stage)
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

#### Handoff Actions
- [ ] Notify next stage owner
- [ ] Provide required artifacts
- [ ] Update status in tool
- [ ] Add transition comment

#### Date: [Date]
#### Moved by: [Name]
```

---

## 🎯 Summary

**10 stages provide:**
- ✅ Clear quality gates at each stage
- ✅ Defined owners for each stage
- ✅ Explicit handoff points
- ✅ Rollback procedures
- ✅ Measurable metrics
- ✅ Enterprise-grade process
- ✅ CAB integration
- ✅ Security validation
- ✅ UAT formalization
- ✅ Production readiness

**Total typical duration:** 7-16 days from Ready to Released

---

**Related Documentation:**
- [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) - Full workflow guide
- [WORKFLOW_QUICK_REFERENCE.md](WORKFLOW_QUICK_REFERENCE.md) - Quick reference
- [EPIC_EXAMPLE_DASHBOARD.md](EPIC_EXAMPLE_DASHBOARD.md) - Real example

---

**Status:** ✅ Active  
**Version:** 1.0  
**Last Updated:** February 12, 2026
