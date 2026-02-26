---
name: ui-design-review
description: Comprehensive design review for websites and applications with extensive accessibility analysis. Use this skill when users ask you to review UI/UX designs, wireframes, mockups, prototypes, or deployed interfaces for usability, accessibility (WCAG compliance), visual design, interaction patterns, responsive design, and best practices.
---

# UI/UX Design Review

Comprehensive design review capabilities for web and desktop applications, with a strong focus on accessibility compliance and best practices.

## When to Use This Skill

Activate this skill when the user requests:
- Review of UI/UX designs, wireframes, or mockups
- Accessibility audit (WCAG 2.1/2.2 compliance)
- Usability assessment
- Visual design critique
- Interaction pattern review
- Responsive design evaluation
- Design system assessment
- Component library review
- User flow analysis
- Information architecture review

## Review Framework

### 1. Initial Analysis

When a user provides a design or interface, begin by:

1. **Understanding Context**
   - Ask clarifying questions about:
     - Target audience and personas
     - Platform(s): web, desktop, mobile
     - Accessibility requirements and compliance level needed
     - Brand guidelines or design system in use
     - User research or testing conducted
     - Technical constraints
     - Browser/OS support requirements
     - Key user goals and tasks

2. **Design Artifact Analysis**
   - If designs, screenshots, or prototypes are provided, analyze:
     - Visual hierarchy and layout
     - Color usage and contrast
     - Typography and readability
     - Component patterns and consistency
     - Navigation structure
     - Interactive elements
     - Responsive behavior
     - State variations (hover, active, disabled, error, etc.)

### 2. Comprehensive Review Areas

#### A. Accessibility (WCAG 2.1/2.2 Compliance)

This is a CRITICAL area that must be thoroughly reviewed for all interfaces.

**Level A Requirements (Minimum):**
- All images have appropriate alt text
- Color is not the only visual means of conveying information
- All functionality is keyboard accessible
- No keyboard traps exist
- Page titles are descriptive and unique
- Link purpose is clear from context
- Form errors are identified and described
- HTML is valid and properly nested

**Level AA Requirements (Recommended):**
- Contrast ratio is at least 4.5:1 (3:1 for large text)
- Text can be resized up to 200% without assistive technology
- Multiple ways to locate pages exist
- Focus indicator is visible
- Touch targets are sufficiently large (minimum 44x44px)

**Level AAA Requirements (Best Practice):**
- Contrast ratio is at least 7:1 (4.5:1 for large text)
- No images of text are used
- Text spacing can be adjusted

**Provide Feedback On:**
- Specific WCAG violations with severity level
- Missing ARIA labels and landmarks
- Color contrast issues with measured ratios
- Keyboard navigation problems
- Screen reader compatibility issues
- Missing alternative text
- Form accessibility issues
- Focus management problems
- Semantic HTML issues

#### B. Visual Design & Aesthetics

**Evaluate:**
- Visual hierarchy and layout structure
- Color palette and color theory application
- Typography choices and hierarchy
- White space and density
- Visual balance and alignment
- Consistency with brand guidelines
- Modern vs dated design patterns
- Component visual consistency

**Provide Feedback On:**
- Cluttered or overwhelming layouts
- Poor visual hierarchy
- Inconsistent spacing
- Typography issues
- Color palette problems
- Misaligned elements
- Inconsistent component styling

#### C. User Experience & Usability

**Evaluate:**
- User flow logic and efficiency
- Information architecture
- Navigation patterns and clarity
- Cognitive load
- Task completion efficiency
- Error prevention and recovery
- Feedback mechanisms
- Learnability for new users

**Provide Feedback On:**
- Confusing navigation
- Too many steps to complete tasks
- Unclear labeling or terminology
- Missing or unclear feedback
- Poor error messages
- Inconsistent interaction patterns
- High cognitive load

#### D. Responsive Design & Layout

**Evaluate:**
- Breakpoint strategy
- Mobile-first approach
- Touch target sizes (minimum 44x44px)
- Content reflow behavior
- Layout patterns
- Image and media responsiveness
- Typography scaling
- Navigation adaptation

**Provide Feedback On:**
- Missing breakpoints
- Horizontal scrolling on mobile
- Too-small touch targets
- Overlapping content
- Poor mobile navigation
- Unreadable text on mobile

### 3. Review Output Format

Structure your review as follows:

#### Executive Summary
- Overall design assessment (1-3 paragraphs)
- Key strengths identified
- Critical issues requiring immediate attention
- Accessibility compliance level (A, AA, AAA)
- Overall design maturity score

#### Accessibility Analysis (Priority Section)

**WCAG Compliance Summary:**
- Level A: X violations found
- Level AA: X violations found
- Level AAA: X recommendations

**Critical Accessibility Issues:**
- HIGH: Issues that prevent access (with WCAG reference)
- MEDIUM: Issues that hinder access
- LOW: Improvements that enhance access

#### Visual Design Assessment

**Strengths:**
- What works well visually

**Concerns:**
- HIGH: Major visual problems
- MEDIUM: Notable issues
- LOW: Polish and refinement opportunities

#### UX & Usability Assessment

**Strengths:**
- Positive UX patterns identified

**Concerns:**
- HIGH: Usability blockers
- MEDIUM: Friction points
- LOW: Nice-to-have improvements

#### Responsive Design Assessment

**Strengths:**
- Responsive patterns that work well

**Concerns:**
- Issues at various breakpoints
- Mobile-specific problems

### 4. Priority Classification

**CRITICAL:**
- Prevents users from accessing core functionality
- WCAG Level A violations
- Complete blocks for keyboard/screen reader users

**HIGH:**
- Significantly impairs user experience
- WCAG Level AA violations
- Major usability issues affecting most users

**MEDIUM:**
- Creates friction but has workarounds
- WCAG Level AAA recommendations
- Visual inconsistencies

**LOW:**
- Polish and refinement
- Edge case issues
- Aesthetic improvements

## Communication Style

When providing reviews:
- Be constructive and specific
- Start with positives where applicable
- Explain the impact on users (especially accessibility)
- Provide actionable recommendations
- Include examples and code snippets
- Reference specific WCAG criteria when relevant
- Prioritize issues clearly
- Use clear, professional language

## Testing Tools & Resources

Recommend appropriate tools:

**Accessibility Testing:**
- Automated: axe DevTools, WAVE, Lighthouse
- Manual: Keyboard testing, screen reader testing
- Screen readers: NVDA, JAWS, VoiceOver
- Color contrast: WebAIM Contrast Checker

**Visual Testing:**
- Browser DevTools
- Responsinator
- Device emulators

## References

- [WAI-ARIA APG Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/)
