# Development Workflow - Quick Reference

**Version:** 1.0  
**Last Updated:** February 12, 2026

---

## 🚀 Quick Start

### New to the Workflow?

1. Read [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) - Complete guide
2. See [EPIC_EXAMPLE_DASHBOARD.md](EPIC_EXAMPLE_DASHBOARD.md) - Real example
3. Use templates below for your work

### Already Familiar?

Jump to: [Templates](#templates) | [Checklists](#checklists) | [Examples](#examples)

---

## 📋 Templates

### Epic Template (Quick)

```markdown
# Epic: [Title]

**ID:** EPC-XXX | **Priority:** P1 | **Status:** In Progress

## Objective
[One sentence: what business problem does this solve?]

## Success Metrics
- [ ] Metric 1: [Target]
- [ ] Metric 2: [Target]

## Stories
- [ ] US-XXX: [Title] - [Points]
- [ ] US-XXX: [Title] - [Points]

## Timeline
Start: [Date] | Target: [Date]
```

[Full Epic Template →](DEVELOPMENT_WORKFLOW.md#epic-template)

---

### User Story Template (Quick)

```markdown
# US-XXX: [Title]

**Epic:** EPC-XXX | **Points:** 5 | **Status:** Ready

## Story
As a **[role]**  
I want **[feature]**  
So that **[benefit]**

## Acceptance Criteria

**AC1:** [Happy Path]
- Given [context]
- When [action]
- Then [outcome]

**AC2:** [Edge Case]
- Given [context]
- When [action]  
- Then [outcome]

**AC3:** [Error Case]
- Given [context]
- When [action]
- Then [error handling]

## Tasks
- [ ] Backend implementation
- [ ] Frontend implementation
- [ ] Tests (min 80% coverage)
- [ ] Documentation

## DoR
- [ ] All DoR criteria met

## DoD
- [ ] All DoD criteria met
```

[Full Story Template →](DEVELOPMENT_WORKFLOW.md#user-story-template)

---

### Task Template (Quick)

```markdown
# Task: [Title]

**ID:** TSK-XXX | **Story:** US-XXX | **Status:** To Do

## Description
[What needs to be done]

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Estimate
[Hours/Days]
```

---

## ✅ Checklists

### Definition of Ready (Essential)

**Before starting development, verify:**

#### Requirements
- [ ] User story written in "As a / I want / So that" format
- [ ] Acceptance criteria defined (Given/When/Then)
- [ ] Business value is clear

#### Technical
- [ ] Technical approach agreed upon
- [ ] API contracts defined (if applicable)
- [ ] Dependencies identified and resolved

#### Estimation
- [ ] Story estimated (points or days)
- [ ] Story can be completed in one sprint
- [ ] Broken down into tasks

#### Approval
- [ ] Product Owner approved
- [ ] Tech Lead approved
- [ ] Team understands requirements

[Complete DoR Checklist →](DEVELOPMENT_WORKFLOW.md#definition-of-ready)

---

### Definition of Done (Essential)

**Before marking story as done, verify:**

#### Code
- [ ] Code written and follows standards
- [ ] Code reviewed and approved
- [ ] No TypeScript/linting errors
- [ ] Merged to main branch

#### Testing
- [ ] Unit tests written (min 80% coverage)
- [ ] All tests passing
- [ ] Integration tests (if applicable)
- [ ] Manual QA complete

#### Functionality
- [ ] All acceptance criteria met
- [ ] Error handling implemented
- [ ] Loading/empty states added

#### Documentation
- [ ] Code comments added
- [ ] API docs updated (if applicable)
- [ ] README updated

#### Deployment
- [ ] Deployed to test environment
- [ ] Smoke tests passed
- [ ] Deployed to production

#### Approval
- [ ] QA approved
- [ ] Product Owner accepted

[Complete DoD Checklist →](DEVELOPMENT_WORKFLOW.md#definition-of-done)

---

## 🔄 Workflow Stages

```
1. Backlog
   ↓
2. Ready for Development
   ↓
3. In Development (In Progress)
   ↓
4. Dev Done
   ↓
5. Ready for QA
   ↓
6. In QA Testing
   ↓
7. Ready for UAT
   ↓
8. In UAT
   ↓
9. Ready for Release
   ↓
10. Released
```

### Stage Transitions

| From | To | Trigger | Owner |
|------|----|---------| ------|
| Backlog | Ready for Dev | Meets DoR | Product Owner |
| Ready for Dev | In Development | Developer picks up | Developer |
| In Development | Dev Done | PR approved + merged | Developer |
| Dev Done | Ready for QA | Test deployment complete | Developer |
| Ready for QA | In QA Testing | QA starts testing | QA Engineer |
| In QA Testing | Ready for UAT | QA approves | QA Engineer |
| In QA Testing | In Development | Bugs found | QA Engineer |
| Ready for UAT | In UAT | UAT deployment complete | Product Owner |
| In UAT | Ready for Release | Stakeholders approve | Product Owner |
| In UAT | In Development | Issues found | Product Owner |
| Ready for Release | Released | All gates passed + deployed | Release Manager |
| Released | Done | Monitoring confirms stable | Tech Lead |

### Key Quality Gates

| Stage | Quality Gate | Must Pass |
|-------|-------------|-----------|
| **Ready for Dev** | Definition of Ready | ✅ |
| **Dev Done** | TypeScript check | ✅ |
| | ESLint check | ✅ |
| | Unit tests (≥80% coverage) | ✅ |
| | Code review approved | ✅ |
| **QA Approved** | All test scenarios pass | ✅ |
| | Acceptance criteria met | ✅ |
| | No critical bugs | ✅ |
| **UAT Approved** | Stakeholder approval | ✅ |
| | User documentation ready | ✅ |
| **Ready for Release** | CAB approval | ✅ |
| | Security scan | ✅ |
| | Release notes complete | ✅ |
| **Released** | Production smoke tests | ✅ |
| | Monitoring shows no errors | ✅ |

---

## 📏 Story Sizing Guide

| Size | Days | Points | When to Use |
|------|------|--------|-------------|
| **XS** | 0.5-1 | 1 | Small bug fix, minor tweak |
| **S** | 1-2 | 2-3 | Simple feature, single component |
| **M** | 3-5 | 5 | Standard feature, multiple files |
| **L** | 5-8 | 8 | Complex feature, integration |
| **XL** | 8+ | 13 | **TOO BIG - Break down!** |

**Rule of Thumb:** If story is > 5 points, break it into smaller stories.

---

## 🎯 Acceptance Criteria Format

### Use Given/When/Then

```markdown
**Given** [context or precondition]
**When** [action or event occurs]
**Then** [expected outcome or result]
```

### Example: Login Feature

```markdown
**Scenario 1: Successful Login**
- Given I am on the login page
- When I enter valid credentials and click "Login"
- Then I am redirected to the dashboard

**Scenario 2: Invalid Password**
- Given I am on the login page
- When I enter invalid credentials
- Then I see "Invalid credentials" error message

**Scenario 3: Locked Account**
- Given my account is locked
- When I try to log in
- Then I see "Account locked" message with unlock instructions
```

---

## 🧪 Testing Requirements

### Minimum Test Coverage

- **Unit Tests:** 80% code coverage minimum
- **Integration Tests:** All major user flows
- **E2E Tests:** Critical paths

### What to Test

✅ **Always Test:**
- Happy path (normal flow)
- Error cases (what goes wrong)
- Edge cases (boundary conditions)
- Validation (input checking)
- Authentication/authorization

❌ **Don't Test:**
- Third-party libraries (already tested)
- Simple getters/setters
- Generated code

### Test Naming Convention

```typescript
// Pattern: "should [expected behavior] when [condition]"

describe('Dashboard Stats API', () => {
  it('should return stats when authenticated user requests data', () => {
    // test code
  });
  
  it('should return 401 when request has no auth token', () => {
    // test code
  });
  
  it('should calculate growth correctly when previous data exists', () => {
    // test code
  });
});
```

---

## 📝 Documentation Requirements

### Code Documentation

```typescript
/**
 * Fetches dashboard statistics for a site
 * 
 * @param siteId - The site ID to fetch stats for
 * @param timeRange - Time range for stats (7d, 30d, 90d, 1y)
 * @param environmentId - Optional environment filter
 * @returns Dashboard statistics with growth percentages
 * @throws {UnauthorizedError} When user is not authenticated
 * @throws {ForbiddenError} When user lacks permissions
 * 
 * @example
 * ```typescript
 * const stats = await getStats('site123', '30d', 'prod');
 * console.log(stats.totalOrders); // 1234
 * ```
 */
export async function getStats(
  siteId: string,
  timeRange: TimeRange = '30d',
  environmentId?: string
): Promise<DashboardStats> {
  // implementation
}
```

### API Documentation

Include in every API:
- Endpoint URL
- HTTP method
- Parameters (path, query, body)
- Headers required
- Response format (200, 4xx, 5xx)
- Example request/response

### User Documentation

Update when:
- New feature added
- UI/UX changes
- Workflow changes
- Configuration changes

---

## 🚀 Sprint Workflow

### Sprint Planning (Day 1)

1. Review ready stories (meet DoR)
2. Team commits to stories
3. Break stories into tasks
4. Assign tasks to developers

### Daily Standup (Every Day)

Answer three questions:
1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers?

### Sprint Review (Last Day)

1. Demo completed stories
2. Get stakeholder feedback
3. Mark stories as done (meet DoD)

### Sprint Retrospective (Last Day)

Discuss:
- What went well?
- What could improve?
- Action items for next sprint

---

## 🎓 Best Practices

### Writing Stories

✅ **DO:**
- Focus on user value
- Keep them small (1-2 days)
- Use clear acceptance criteria
- Include the "so that" (benefit)

❌ **DON'T:**
- Write technical tasks as stories
- Make them too large
- Skip acceptance criteria
- Use technical jargon

### Code Reviews

✅ **DO:**
- Review within 24 hours
- Be constructive and specific
- Test the code locally
- Check tests pass

❌ **DON'T:**
- Nitpick style (use linter)
- Approve without testing
- Block on minor issues
- Take it personally

### Testing

✅ **DO:**
- Write tests as you code
- Test edge cases
- Keep tests simple
- Use descriptive names

❌ **DON'T:**
- Skip tests to save time
- Only test happy path
- Write flaky tests
- Test implementation details

---

## 📊 Common Metrics

### Velocity

**Story points completed per sprint**

Example:
- Sprint 1: 25 points
- Sprint 2: 28 points
- Sprint 3: 30 points
- Average: 27.7 points

Use for: Sprint planning, capacity estimation

### Cycle Time

**Time from "In Progress" to "Done"**

Target: < 3 days for most stories

Use for: Identifying bottlenecks

### Lead Time

**Time from "Ready" to "Done"**

Target: < 5 days for most stories

Use for: Process efficiency

### Quality

**Bugs found in production per sprint**

Target: < 2 bugs per sprint

Use for: Quality tracking

---

## 🆘 Common Issues & Solutions

### Issue: Story Too Large

**Symptoms:** Estimated > 5 days, complex requirements

**Solution:**
1. Break into smaller stories
2. Identify minimal viable slice
3. Create spike story for unknowns

### Issue: Unclear Requirements

**Symptoms:** Team has questions, missing details

**Solution:**
1. Schedule refinement session
2. Create wireframes/mockups
3. Write detailed acceptance criteria
4. Mark as "Not Ready" until clarified

### Issue: Blocked by Dependencies

**Symptoms:** Can't start work, waiting on external team

**Solution:**
1. Document dependency clearly
2. Create mock/placeholder
3. Escalate to unblock
4. Defer story if needed

### Issue: Definition of Done Not Met

**Symptoms:** Work complete but missing tests/docs

**Solution:**
1. Move back to "In Progress"
2. Create tasks for missing items
3. Complete DoD before re-submitting
4. Learn for next story

---

## 🔗 Quick Links

### Documentation
- [Full Workflow Guide](DEVELOPMENT_WORKFLOW.md)
- [Epic Example](EPIC_EXAMPLE_DASHBOARD.md)
- [User Story Example](USER_STORY_EXAMPLE_STATS_API.md)

### Related Processes
- [Code Review Guidelines](../CODE_REVIEW_GUIDELINES.md)
- [Testing Strategy](../../testing/TESTING_STRATEGY.md)
- [Deployment Process](../../deployment/DEPLOYMENT_PROCESS.md)

---

## 📞 Need Help?

**Questions about the workflow?**
- Contact: Tech Lead
- Slack: #dev-workflow
- Docs: [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)

**Want to improve this workflow?**
- Submit a PR with changes
- Discuss in team meeting
- Update this document

---

## 🎯 Quick Decision Tree

### "Is my story ready?"

```
Does it meet all DoR criteria?
├─ Yes → Move to "Ready" ✅
└─ No → Keep in "Backlog", refine more ❌
```

### "Can I mark this done?"

```
Does it meet all DoD criteria?
├─ Yes → Mark as "Done" ✅
└─ No → Keep in "In Progress/Review" ❌
```

### "Should I break this story down?"

```
Is it > 5 story points?
├─ Yes → Break into smaller stories ✅
└─ No → Keep as-is ❌
```

---

**Remember:** When in doubt, refer to the [full workflow guide](DEVELOPMENT_WORKFLOW.md)!

---

**Status:** ✅ Active  
**Version:** 1.0  
**Last Updated:** February 12, 2026