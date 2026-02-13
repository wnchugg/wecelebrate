# Development Workflow Guide

**Version:** 1.0  
**Last Updated:** February 12, 2026  
**Status:** ✅ Active

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Workflow Stages](#workflow-stages)
3. [Epics](#epics)
4. [User Stories](#user-stories)
5. [Tasks](#tasks)
6. [Definition of Ready](#definition-of-ready)
7. [Definition of Done](#definition-of-done)
8. [Process Flow](#process-flow)
9. [Templates](#templates)
10. [Examples](#examples)

---

## 🎯 Overview

### Purpose

This workflow standardizes how we plan, develop, test, and deploy features across the wecelebrate platform, ensuring consistency and quality across multiple developers.

### Hierarchy

```
Epic (Business Initiative)
  ├── User Story (Feature/Capability)
  │   ├── Task (Technical Work Item)
  │   ├── Task (Technical Work Item)
  │   └── Task (Technical Work Item)
  ├── User Story (Feature/Capability)
  │   └── Tasks...
  └── User Story (Feature/Capability)
      └── Tasks...
```

### Principles

- **User-Centric:** Focus on user value
- **Incremental:** Deliver in small, testable increments
- **Quality-First:** Meet Definition of Done for every story
- **Collaborative:** Cross-functional team involvement
- **Transparent:** Clear status and progress tracking

---

## 🔄 Workflow Stages

### 1. Backlog

**Definition:** Work identified but not yet ready for development.

**Activities:**
- Epics and stories are created
- Initial requirements gathered
- High-level estimates provided
- Prioritized by Product Owner

**Exit Criteria:**
- Epic/story documented
- Added to backlog
- Prioritized

---

### 2. Ready for Development

**Definition:** Work that meets Definition of Ready and can be picked up by developers.

**Activities:**
- Detailed requirements documented
- Acceptance criteria defined
- Technical approach agreed
- Dependencies identified
- Estimates refined

**Entry Criteria:**
- Story created in backlog
- Initial priority assigned
- Basic requirements documented

**Exit Criteria:**
- ✅ Meets Definition of Ready
- ✅ Team understands requirements
- ✅ No blockers
- ✅ Assigned to sprint

**Owner:** Product Owner + Tech Lead

---

### 3. In Development (In Progress)

**Definition:** Active development work.

**Activities:**
- Backend development
- Frontend development
- Unit testing
- Code comments
- Documentation updates

**Entry Criteria:**
- Story meets Definition of Ready
- Developer has capacity
- Developer understands requirements

**Exit Criteria:**
- Code complete
- Tests written and passing locally
- Ready for code review

**Owner:** Developer

---

### 4. Dev Done

**Definition:** Development complete and meets "Dev Definition of Done" - ready for QA.

**Required Criteria:**
- ✅ **Code reviewed** - At least one peer approval
- ✅ **All TypeScript errors fixed** - `npm run type-check` passes
- ✅ **All ESLint errors fixed** - `npm run lint` passes with zero errors
- ✅ **Automated tests created** - Unit tests for all new code (min 80% coverage)
- ✅ **Application documentation updated** - Code comments, README, API docs
- ✅ **Test data and cases for QA** - Test scenarios documented, test data prepared

**Activities:**
- Code review by peer(s)
- Fix all linting/type errors
- Write automated tests
- Update documentation
- Prepare QA test cases
- Merge to test branch

**Entry Criteria:**
- Code complete
- Developer self-review done
- Pull request created

**Exit Criteria:**
- All Dev Done criteria met ✅
- PR approved and merged
- Deployed to test environment
- QA has test cases and data

**Owner:** Developer + Reviewer(s)

**Quality Gates:**
- TypeScript: `npm run type-check` ✅
- ESLint: `npm run lint` ✅
- Tests: `npm test` ✅
- Coverage: ≥80% ✅
- Code Review: Approved ✅

---

### 5. Ready for QA

**Definition:** Development complete, deployed to test environment, ready for QA to start testing.

**Activities:**
- Smoke test in test environment
- Notify QA team
- Handoff test cases and data
- Answer QA questions

**Entry Criteria:**
- All Dev Done criteria met
- Deployed to test environment
- Test cases prepared

**Exit Criteria:**
- QA team acknowledges receipt
- QA has all needed information
- QA starts testing

**Owner:** Developer (handoff to QA)

---

### 6. In QA Testing

**Definition:** QA is actively testing the feature.

**Activities:**
- Execute test scenarios
- Verify acceptance criteria
- Test edge cases
- Test error handling
- Document bugs found
- Regression testing

**Entry Criteria:**
- Feature deployed to test environment
- Test cases received
- Test data available

**Exit Criteria:**
- All test scenarios executed
- All acceptance criteria verified
- Critical/blocking bugs fixed
- QA approves for UAT

**Owner:** QA Engineer

**Possible Outcomes:**
- ✅ **Pass** → Move to "Ready for UAT"
- ❌ **Fail** → Move back to "In Development" with bugs documented

---

### 7. Ready for UAT

**Definition:** QA approved, ready for User Acceptance Testing by stakeholders/end users.

**Activities:**
- Deploy to UAT environment
- Notify stakeholders
- Prepare demo/walkthrough
- Provide user documentation

**Entry Criteria:**
- QA approved
- All critical bugs fixed
- User documentation ready

**Exit Criteria:**
- Stakeholders notified
- UAT environment ready
- UAT starts

**Owner:** Product Owner + QA

---

### 8. In UAT

**Definition:** End users/stakeholders are testing the feature.

**Activities:**
- User acceptance testing
- Gather user feedback
- Document usability issues
- Fix critical issues
- Final approval from stakeholders

**Entry Criteria:**
- Feature deployed to UAT environment
- Stakeholders ready to test
- User documentation available

**Exit Criteria:**
- All UAT scenarios completed
- Stakeholders approve for release
- No critical issues remain

**Owner:** Product Owner + Stakeholders

**Possible Outcomes:**
- ✅ **Approved** → Move to "Ready for Release"
- ❌ **Issues Found** → Move back to "In Development" or "In QA" depending on severity

---

### 9. Ready for Release

**Definition:** Approved for production release, pending final release activities.

**Required Criteria:**
- ✅ **CAB approval** - Change Advisory Board has approved the release
- ✅ **Security scan complete** - Security/vulnerability scan passed
- ✅ **Added to release version** - Feature included in release notes and version
- ✅ **Release notes documented** - User-facing changes documented

**Activities:**
- Change Advisory Board (CAB) review
- Security/vulnerability scanning
- Create release notes
- Tag release version
- Prepare rollback plan
- Schedule deployment

**Entry Criteria:**
- UAT approved
- All testing complete
- All approvals obtained

**Exit Criteria:**
- All Ready for Release criteria met ✅
- Deployment scheduled
- Team ready to release

**Owner:** Tech Lead + Release Manager

**Quality Gates:**
- CAB Approval: ✅
- Security Scan: Pass ✅
- Release Notes: Complete ✅
- Rollback Plan: Ready ✅

---

### 10. Released

**Definition:** Feature deployed to production and verified working.

**Activities:**
- Deploy to production
- Smoke tests in production
- Monitor for errors
- Verify metrics
- Notify stakeholders
- Close story/epic

**Entry Criteria:**
- All Ready for Release criteria met
- Deployment window available
- Team on standby

**Exit Criteria:**
- Deployed to production ✅
- Smoke tests passed ✅
- Monitoring shows no errors ✅
- Stakeholders notified ✅
- Meets full Definition of Done ✅

**Owner:** DevOps + Tech Lead

**Post-Release:**
- Monitor for 24-48 hours
- Gather user feedback
- Track success metrics
- Document lessons learned

---

## 📦 Epics

### What is an Epic?

An **Epic** is a large body of work that delivers significant business value and can be broken down into multiple user stories. Epics typically span multiple sprints/weeks.

### Epic Structure

```
Epic Title: [Verb] [Business Capability]
Epic ID: EPC-XXXX
Business Value: [High/Medium/Low]
Strategic Theme: [Platform/Feature/Technical]
```

### Epic Template

```markdown
# Epic: [Title]

**Epic ID:** EPC-XXXX  
**Status:** [Backlog/In Progress/Done]  
**Priority:** [P0 - Critical | P1 - High | P2 - Medium | P3 - Low]  
**Business Value:** [High/Medium/Low]  
**Strategic Theme:** [Platform/Feature/Technical]

## Business Objective

[What business problem does this solve?]

## Success Metrics

- [ ] Metric 1: [Target]
- [ ] Metric 2: [Target]
- [ ] Metric 3: [Target]

## User Impact

**Who benefits:** [Admin/Client/Employee/System]  
**Value delivered:** [Description of value]

## Scope

### In Scope
- Item 1
- Item 2
- Item 3

### Out of Scope
- Item 1
- Item 2

## User Stories

- [ ] US-XXXX: [Story Title]
- [ ] US-XXXX: [Story Title]
- [ ] US-XXXX: [Story Title]

## Dependencies

- Dependency 1
- Dependency 2

## Risks

- Risk 1: [Mitigation]
- Risk 2: [Mitigation]

## Timeline

**Start Date:** [Date]  
**Target Completion:** [Date]  
**Actual Completion:** [Date]

## Stakeholders

- Product Owner: [Name]
- Tech Lead: [Name]
- Developers: [Names]
- QA: [Name]
```

---

## 📝 User Stories

### What is a User Story?

A **User Story** is a small, user-focused piece of functionality that can be completed in one sprint. Stories follow the format: "As a [user], I want [feature], so that [benefit]."

### User Story Structure

```
As a [user role]
I want [capability]
So that [business value]
```

### Story Size Guidelines

- **Small:** 1-2 days (ideal)
- **Medium:** 3-5 days (acceptable)
- **Large:** > 5 days (break down into smaller stories)

### User Story Template

```markdown
# User Story: [Title]

**Story ID:** US-XXXX  
**Epic:** EPC-XXXX  
**Status:** [Backlog/Ready/In Progress/In Review/Done]  
**Priority:** [P0/P1/P2/P3]  
**Points:** [1/2/3/5/8/13]

## User Story

As a **[user role]**  
I want **[capability]**  
So that **[business value]**

## Acceptance Criteria

**Given** [context/precondition]  
**When** [action/event]  
**Then** [expected outcome]

### Scenarios

#### Scenario 1: [Happy Path]
- **Given** [precondition]
- **When** [action]
- **Then** [outcome]

#### Scenario 2: [Edge Case]
- **Given** [precondition]
- **When** [action]
- **Then** [outcome]

#### Scenario 3: [Error Case]
- **Given** [precondition]
- **When** [action]
- **Then** [error handling]

## Technical Requirements

### Backend
- [ ] Requirement 1
- [ ] Requirement 2

### Frontend
- [ ] Requirement 1
- [ ] Requirement 2

### Database
- [ ] Schema changes needed
- [ ] Migrations required

### API
- [ ] New endpoints
- [ ] Changes to existing endpoints

## Dependencies

- [ ] Dependency 1
- [ ] Dependency 2

## Tasks

- [ ] TSK-XXXX: [Backend task]
- [ ] TSK-XXXX: [Frontend task]
- [ ] TSK-XXXX: [Testing task]
- [ ] TSK-XXXX: [Documentation task]

## Design

- Wireframes: [Link]
- Mockups: [Link]
- Design System: [Components used]

## Test Plan

### Unit Tests
- [ ] Backend tests
- [ ] Frontend tests
- [ ] Service layer tests

### Integration Tests
- [ ] API integration
- [ ] Database integration
- [ ] External service integration

### E2E Tests
- [ ] User flow 1
- [ ] User flow 2

## Documentation

- [ ] API documentation
- [ ] User guide
- [ ] Technical documentation
- [ ] README updates

## Definition of Ready

- [ ] All DoR criteria met (see section below)

## Definition of Done

- [ ] All DoD criteria met (see section below)

## Notes

[Additional context, decisions, or information]
```

---

## ✅ Definition of Ready

### Purpose

Definition of Ready (DoR) ensures that a user story has enough detail and clarity before development begins. Stories that don't meet DoR should not be started.

### Criteria Checklist

#### Requirements

- [ ] **User story is clearly written** in "As a / I want / So that" format
- [ ] **Acceptance criteria are defined** using Given/When/Then format
- [ ] **All scenarios documented** (happy path, edge cases, error cases)
- [ ] **Business value is clear** and understood by the team
- [ ] **User role is identified** and validated

#### Technical Clarity

- [ ] **Technical approach is agreed upon** by the team
- [ ] **Backend requirements** are documented
- [ ] **Frontend requirements** are documented
- [ ] **API contracts defined** (if applicable)
- [ ] **Database changes identified** (if applicable)
- [ ] **Architecture reviewed** and approved

#### Design

- [ ] **UI/UX design is available** (wireframes/mockups)
- [ ] **Design system components identified**
- [ ] **Accessibility requirements documented**
- [ ] **Mobile/responsive behavior defined**

#### Dependencies

- [ ] **All dependencies identified**
- [ ] **Blocking dependencies resolved**
- [ ] **External services documented**
- [ ] **Required APIs available or planned**

#### Estimation

- [ ] **Story is estimated** (story points or days)
- [ ] **Story is right-sized** (can be completed in one sprint)
- [ ] **Breakdown into tasks** is complete
- [ ] **Team capacity is available**

#### Testing

- [ ] **Test scenarios identified**
- [ ] **Test data requirements documented**
- [ ] **Performance criteria defined** (if applicable)
- [ ] **Security requirements identified** (if applicable)

#### Documentation

- [ ] **Documentation needs identified**
- [ ] **API documentation plan** (if applicable)
- [ ] **User documentation plan** (if applicable)

#### Approval

- [ ] **Product Owner has reviewed** and approved
- [ ] **Tech Lead has reviewed** and approved
- [ ] **Team understands** the requirements
- [ ] **No open questions** or ambiguities

---

## ✅ Definition of Done

### Purpose

Definition of Done (DoD) ensures that work is truly complete and meets quality standards before being marked as done. All stories must meet DoD before deployment.

### Criteria Checklist

#### Code Quality

- [ ] **Code is written** and follows team standards
- [ ] **Code is properly formatted** (linting passes)
- [ ] **No TypeScript errors**
- [ ] **No console errors** in browser
- [ ] **Code is reviewed** by at least one peer
- [ ] **Code review comments addressed**
- [ ] **Code is merged** to main branch

#### Testing

##### Backend Testing
- [ ] **Unit tests written** for all new code
- [ ] **All backend tests passing** (100%)
- [ ] **Integration tests added** (where applicable)
- [ ] **API endpoint tests complete**
- [ ] **Error handling tested**

##### Frontend Testing
- [ ] **Component tests written** for all new components
- [ ] **All frontend tests passing** (100%)
- [ ] **User interaction tests complete**
- [ ] **Loading states tested**
- [ ] **Error states tested**

##### Integration Testing
- [ ] **Full integration tests passing**
- [ ] **End-to-end user flows tested**
- [ ] **Cross-browser tested** (Chrome, Firefox, Safari, Edge)
- [ ] **Mobile/responsive tested** (if applicable)

##### Test Coverage
- [ ] **Minimum 80% code coverage** achieved
- [ ] **All acceptance criteria have tests**
- [ ] **Edge cases covered**
- [ ] **Error scenarios covered**

#### Functionality

- [ ] **All acceptance criteria met**
- [ ] **Happy path works** as expected
- [ ] **Edge cases handled** properly
- [ ] **Error cases handled** with user-friendly messages
- [ ] **Loading states implemented**
- [ ] **Empty states implemented**
- [ ] **Validation working** correctly

#### Performance

- [ ] **Page load time acceptable** (< 2 seconds)
- [ ] **API response time acceptable** (< 500ms)
- [ ] **No performance regressions**
- [ ] **No memory leaks**
- [ ] **Large data sets handled** (if applicable)

#### Security

- [ ] **Authentication verified**
- [ ] **Authorization implemented** correctly
- [ ] **Input validation complete**
- [ ] **SQL injection prevention** verified
- [ ] **XSS prevention** verified
- [ ] **CSRF protection** in place
- [ ] **Sensitive data encrypted**
- [ ] **No secrets in code**

#### Accessibility

- [ ] **Keyboard navigation works**
- [ ] **Screen reader compatible**
- [ ] **ARIA labels present** (where needed)
- [ ] **Color contrast meets WCAG** standards
- [ ] **Focus indicators visible**

#### Documentation

##### Code Documentation
- [ ] **JSDoc comments** on public methods
- [ ] **Type definitions** documented
- [ ] **Complex logic explained** with inline comments
- [ ] **README updated** (if applicable)

##### API Documentation
- [ ] **API endpoints documented**
- [ ] **Request/response examples** provided
- [ ] **Error codes documented**
- [ ] **Authentication documented**

##### User Documentation
- [ ] **User guide updated** (if applicable)
- [ ] **Feature documentation written**
- [ ] **Screenshots/GIFs added** (if applicable)

##### Technical Documentation
- [ ] **Architecture documentation** updated
- [ ] **Database schema documented** (if changed)
- [ ] **Environment variables documented**
- [ ] **Deployment instructions** updated

#### Database

- [ ] **Migrations tested** (up and down)
- [ ] **Schema changes reviewed**
- [ ] **Indexes added** where needed
- [ ] **Data integrity verified**
- [ ] **Backup/rollback plan** documented

#### Deployment

- [ ] **Deployed to test environment**
- [ ] **Smoke tests passed** in test environment
- [ ] **Deployment runbook** updated
- [ ] **Rollback plan** documented
- [ ] **Environment variables set**

#### Monitoring & Logging

- [ ] **Error logging implemented**
- [ ] **Performance logging** added (if applicable)
- [ ] **User actions logged** (if applicable)
- [ ] **Monitoring alerts configured** (if applicable)

#### Cleanup

- [ ] **Debug code removed**
- [ ] **Console.log statements removed** (or properly wrapped)
- [ ] **Commented-out code removed**
- [ ] **Unused imports removed**
- [ ] **Test data cleaned up**

#### Approval

- [ ] **QA has tested** and approved
- [ ] **Product Owner has reviewed** and accepted
- [ ] **Tech Lead has reviewed** and approved
- [ ] **Stakeholders notified**

#### Production

- [ ] **Deployed to production**
- [ ] **Smoke tests passed** in production
- [ ] **Feature verified** working in production
- [ ] **Monitoring shows** no errors
- [ ] **User feedback** collected (if applicable)

---

## 🔄 Process Flow

### Complete Development Lifecycle

```
1. Backlog
   ↓
2. Ready for Development (meets DoR)
   ↓
3. In Development
   ↓
4. Dev Done (meets Dev DoD)
   ↓
5. Ready for QA
   ↓
6. In QA Testing
   ↓ (pass)
7. Ready for UAT
   ↓
8. In UAT
   ↓ (approved)
9. Ready for Release (CAB approval, security scan)
   ↓
10. Released (production deployment)
```

### Stage-by-Stage Flow

#### Stage 1-2: Planning & Preparation

```
BACKLOG
  ├─ Product Owner creates epic/story
  ├─ Initial requirements documented
  ├─ High-level estimates
  └─ Prioritized
       ↓
READY FOR DEVELOPMENT
  ├─ Detailed requirements defined
  ├─ Acceptance criteria documented
  ├─ Technical approach agreed
  ├─ Dependencies resolved
  ├─ Definition of Ready met ✅
  └─ Assigned to sprint
```

#### Stage 3-4: Development & Code Review

```
IN DEVELOPMENT
  ├─ Developer picks story
  ├─ Creates feature branch
  ├─ Writes code + tests
  ├─ Self-review
  └─ Creates Pull Request
       ↓
DEV DONE
  ├─ Peer code review
  ├─ TypeScript check passes ✅
  ├─ ESLint passes ✅
  ├─ Tests pass ✅
  ├─ Coverage ≥80% ✅
  ├─ Documentation updated ✅
  ├─ QA test cases prepared ✅
  ├─ PR approved and merged
  └─ Deployed to test environment
```

#### Stage 5-6: QA Testing

```
READY FOR QA
  ├─ Developer smoke tests feature
  ├─ Notifies QA team
  ├─ Hands off test cases and data
  └─ QA acknowledges receipt
       ↓
IN QA TESTING
  ├─ QA executes test scenarios
  ├─ Verifies acceptance criteria
  ├─ Tests edge cases & errors
  ├─ Documents bugs (if found)
  ├─ Regression testing
  └─ QA approves or rejects
       ↓
       ├─ PASS → Move to Ready for UAT
       └─ FAIL → Move back to In Development
```

#### Stage 7-8: User Acceptance Testing

```
READY FOR UAT
  ├─ Deploy to UAT environment
  ├─ Notify stakeholders
  ├─ Prepare demo/walkthrough
  └─ User documentation ready
       ↓
IN UAT
  ├─ Stakeholders test feature
  ├─ Gather user feedback
  ├─ Document usability issues
  ├─ Fix critical issues (if needed)
  └─ Stakeholders approve or reject
       ↓
       ├─ APPROVED → Move to Ready for Release
       ├─ MINOR ISSUES → Move to In Development
       └─ MAJOR ISSUES → Move to In QA Testing
```

#### Stage 9-10: Release & Production

```
READY FOR RELEASE
  ├─ CAB review and approval ✅
  ├─ Security/vulnerability scan ✅
  ├─ Add to release version ✅
  ├─ Write release notes ✅
  ├─ Prepare rollback plan
  └─ Schedule deployment
       ↓
RELEASED
  ├─ Deploy to production
  ├─ Smoke tests in production ✅
  ├─ Monitor for errors
  ├─ Verify metrics
  ├─ Notify stakeholders
  ├─ Mark story as Done
  └─ Document lessons learned
```

### Quality Gates Summary

```
┌────────────────────┬─────────────────────────────────────┐
│ Stage              │ Quality Gates                       │
├────────────────────┼─────────────────────────────────────┤
│ Ready for Dev      │ • Definition of Ready met           │
├────────────────────┼─────────────────────────────────────┤
│ Dev Done           │ • TypeScript check ✅                │
│                    │ • ESLint check ✅                    │
│                    │ • Tests pass ✅                      │
│                    │ • Coverage ≥80% ✅                   │
│                    │ • Code review approved ✅            │
├────────────────────┼─────────────────────────────────────┤
│ QA Approved        │ • All test scenarios pass ✅         │
│                    │ • Acceptance criteria met ✅         │
│                    │ • No critical bugs ✅                │
├────────────────────┼─────────────────────────────────────┤
│ UAT Approved       │ • Stakeholder approval ✅            │
│                    │ • User documentation ready ✅        │
│                    │ • No critical issues ✅              │
├────────────────────┼─────────────────────────────────────┤
│ Ready for Release  │ • CAB approval ✅                    │
│                    │ • Security scan passed ✅            │
│                    │ • Release notes complete ✅          │
│                    │ • Rollback plan ready ✅             │
├────────────────────┼─────────────────────────────────────┤
│ Released           │ • Production deployment ✅           │
│                    │ • Smoke tests passed ✅              │
│                    │ • Monitoring active ✅               │
│                    │ • Full Definition of Done met ✅     │
└────────────────────┴─────────────────────────────────────┘
```

### Rollback Scenarios

**From In QA Testing:**
- If QA finds critical bugs → Move back to "In Development"
- Developer fixes bugs and follows Dev Done criteria again

**From In UAT:**
- If minor issues found → Move to "In Development" for fixes
- If major issues found → Move to "In QA Testing" for re-verification
- If show-stopper found → Move to "Backlog" for re-planning

**From Production:**
- If critical production issue → Execute rollback plan
- Redeploy previous stable version
- Move story back to "In Development" for fixing
- Follow full flow again (Dev → QA → UAT → Release)

---

### 1. Epic Creation

```
Product Owner creates Epic
    ↓
Define business objectives
    ↓
Identify success metrics
    ↓
Add to roadmap
    ↓
Prioritize in backlog
```

### 2. Epic Breakdown

```
Product Owner + Tech Lead collaborate
    ↓
Break epic into user stories
    ↓
Define story acceptance criteria
    ↓
Estimate stories
    ↓
Prioritize stories
```

### 3. Sprint Planning

```
Review ready stories
    ↓
Verify Definition of Ready
    ↓
Team commits to sprint
    ↓
Break stories into tasks
    ↓
Assign tasks to developers
```

### 4. Daily Development Workflow

```
Developer picks story from "Ready for Development"
    ↓
Move to "In Development"
    ↓
Create feature branch
    ↓
Write code + tests + documentation
    ↓
Run local quality checks:
  - npm run type-check
  - npm run lint
  - npm test
    ↓
Create Pull Request
    ↓
Automated CI/CD runs
    ↓
Peer review
    ↓
Address feedback
    ↓
PR approved → Merge to test branch
    ↓
Deploy to test environment
    ↓
Move to "Dev Done"
```

### 5. QA Workflow

```
Developer hands off to QA
    ↓
Move to "Ready for QA"
    ↓
QA acknowledges and starts testing
    ↓
Move to "In QA Testing"
    ↓
QA executes test scenarios
    ↓
All tests pass?
  ├─ YES → Move to "Ready for UAT"
  └─ NO → Document bugs, move to "In Development"
```

### 6. UAT Workflow

```
Deploy to UAT environment
    ↓
Move to "Ready for UAT"
    ↓
Notify stakeholders
    ↓
Move to "In UAT"
    ↓
Stakeholders test and provide feedback
    ↓
Approved?
  ├─ YES → Move to "Ready for Release"
  ├─ MINOR ISSUES → Move to "In Development"
  └─ MAJOR ISSUES → Move to "In QA Testing"
```

### 7. Release Workflow

```
Move to "Ready for Release"
    ↓
Submit to CAB for approval
    ↓
Run security/vulnerability scans
    ↓
Create release notes
    ↓
Tag release version
    ↓
Prepare rollback plan
    ↓
Schedule deployment window
    ↓
All gates passed?
  ├─ YES → Proceed to deployment
  └─ NO → Address issues, repeat gates
    ↓
Deploy to production
    ↓
Move to "Released"
    ↓
Run smoke tests
    ↓
Monitor for 24-48 hours
    ↓
Mark story as "Done"
    ↓
Close in project management tool
```

### 8. Post-Release

```
Monitor production metrics
    ↓
Collect user feedback
    ↓
Track success metrics (if epic)
    ↓
Document lessons learned
    ↓
Update knowledge base
    ↓
Celebrate success! 🎉
```

---

## 📋 Templates

### Quick Reference Templates

#### Epic Template (Short Form)

```markdown
# Epic: [Title]

**ID:** EPC-XXXX | **Priority:** P1 | **Status:** In Progress

## Objective
[One sentence description]

## Success Metrics
- Metric 1: [Target]

## Stories
- [ ] US-001: [Title]
- [ ] US-002: [Title]
```

#### User Story Template (Short Form)

```markdown
# US-XXXX: [Title]

**As a** [role]  
**I want** [feature]  
**So that** [benefit]

## AC
- [ ] Scenario 1
- [ ] Scenario 2

## Tasks
- [ ] Backend
- [ ] Frontend
- [ ] Tests
```

#### Task Template

```markdown
# Task: [Title]

**Task ID:** TSK-XXXX  
**Story:** US-XXXX  
**Assignee:** [Name]  
**Status:** [To Do/In Progress/Done]  
**Estimate:** [Hours]

## Description
[What needs to be done]

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Technical Notes
[Implementation details]
```

---

## 📚 Examples

### Example 1: Dashboard Production Readiness Epic

See the complete real-world example: [Epic Example - Dashboard](EPIC_EXAMPLE_DASHBOARD.md)

**Epic Summary:**
- **ID:** EPC-001
- **Title:** Dashboard Production Readiness
- **Stories:** 4 (one per phase)
- **Duration:** 1 week
- **Status:** ✅ Complete

**User Stories:**
1. US-001: Backend Dashboard APIs
2. US-002: Frontend Dashboard Service
3. US-003: Dashboard UI Refactor
4. US-004: Dashboard Integration & Polish

**Outcome:**
- 90 tests written and passing
- Production-ready dashboard
- Comprehensive documentation
- Zero breaking changes

---

### Example 2: Multi-Catalog Integration Epic

**Epic Summary:**
- **ID:** EPC-002
- **Title:** Multi-Catalog Product Management
- **Stories:** 8 user stories
- **Status:** ✅ Complete

**Key Stories:**
- US-010: Catalog Configuration Management
- US-011: ERP Product Sync
- US-012: External Vendor Integration
- US-013: Catalog Selection UI

---

### Example 3: User Story with Full Details

See: [User Story Example - Dashboard Stats API](USER_STORY_EXAMPLE_STATS_API.md)

**Story:** US-001.1: Dashboard Statistics API Endpoint

**Structure:**
- Clear user story statement
- Detailed acceptance criteria
- Technical requirements (backend, database, API)
- Test plan (30 unit tests)
- Documentation requirements
- DoR/DoD checklist

---

## 🎯 Best Practices

### Writing Epics

✅ **DO:**
- Focus on business outcomes
- Make them user-centric
- Set measurable success criteria
- Keep them strategic (3-6 months max)
- Link to business objectives

❌ **DON'T:**
- Make them too technical
- Let them drag on indefinitely
- Skip success metrics
- Create without clear business value

### Writing User Stories

✅ **DO:**
- Use the "As a / I want / So that" format
- Focus on user value
- Keep them small (1-2 days ideal)
- Include clear acceptance criteria
- Make them testable

❌ **DON'T:**
- Write technical tasks as stories
- Make them too large
- Skip acceptance criteria
- Use technical jargon
- Leave them ambiguous

### Definition of Ready

✅ **DO:**
- Check DoR before sprint planning
- Involve the whole team
- Be strict about DoR criteria
- Send incomplete stories back to backlog

❌ **DON'T:**
- Start work on stories not meeting DoR
- Skip DoR checks
- Make exceptions
- Rush through DoR review

### Definition of Done

✅ **DO:**
- Review DoD before marking done
- Automate DoD checks where possible
- Update DoD as standards evolve
- Enforce DoD strictly

❌ **DON'T:**
- Skip DoD checks
- Mark work done without testing
- Defer documentation
- Rush to production

---

## 🔧 Tools & Integration

### Recommended Tools

1. **Project Management:** Jira, Linear, GitHub Projects
2. **Documentation:** Confluence, Notion, GitHub Wiki
3. **Code Review:** GitHub, GitLab
4. **Testing:** Jest, Vitest, Playwright
5. **CI/CD:** GitHub Actions, GitLab CI

### GitHub Integration

#### Using GitHub Issues

```markdown
## Epic (GitHub Issue)
Label: epic
Milestone: Q1 2026

## User Story (GitHub Issue)
Label: story, feature
Linked to: Epic #123
Milestone: Sprint 5

## Task (GitHub Issue)
Label: task
Linked to: Story #456
```

#### Using GitHub Projects

- **Columns:** Backlog, Ready, In Progress, In Review, Done
- **Automation:** Auto-move based on labels/PR status
- **Fields:** Priority, Story Points, Sprint, Assignee

---

## 📊 Metrics & Reporting

### Track These Metrics

1. **Velocity:** Story points completed per sprint
2. **Cycle Time:** Time from "In Progress" to "Done"
3. **Lead Time:** Time from "Ready" to "Done"
4. **Quality:** Bugs found in production
5. **DoD Compliance:** % of stories meeting DoD first time

### Reports

- **Sprint Burndown:** Track progress during sprint
- **Epic Progress:** Track epic completion
- **Velocity Chart:** Track team velocity over time
- **Quality Metrics:** Track bugs, test coverage

---

## 🆘 Troubleshooting

### Story Too Large

**Problem:** Story is estimated > 5 days

**Solution:**
- Break into smaller stories
- Identify minimal viable slice
- Create spike story for unknowns

### Unclear Requirements

**Problem:** Team doesn't understand requirements

**Solution:**
- Schedule refinement session
- Create wireframes/mockups
- Write more detailed acceptance criteria
- Mark as "Not Ready"

### Missing Dependencies

**Problem:** Blocked by external dependencies

**Solution:**
- Document dependency clearly
- Create placeholder/mock
- Escalate to unblock
- Defer story if needed

### Definition of Done Not Met

**Problem:** Work complete but doesn't meet DoD

**Solution:**
- Move back to "In Progress"
- Create tasks for missing items
- Update story with findings
- Complete DoD before marking done

---

## 📚 Related Documentation

- [Agile Best Practices](AGILE_BEST_PRACTICES.md)
- [Sprint Planning Guide](SPRINT_PLANNING_GUIDE.md)
- [Code Review Guidelines](CODE_REVIEW_GUIDELINES.md)
- [Testing Strategy](../testing/TESTING_STRATEGY.md)
- [Deployment Process](../deployment/DEPLOYMENT_PROCESS.md)

---

## 📝 Changelog

### Version 1.0 - February 12, 2026
- Initial workflow documentation
- Epic, story, task templates
- Definition of Ready
- Definition of Done
- Process flow diagrams
- Real examples from Dashboard project

---

**Questions?** Contact the development team or Tech Lead.

**Feedback?** Submit improvements via PR to this document.

---

**Status:** ✅ Active  
**Owner:** Development Team  
**Last Review:** February 12, 2026  
**Next Review:** March 12, 2026