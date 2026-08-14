===============================================================================
KRIORA LMS — STABILITY-FIRST ENGINEERING RULES
===============================================================================

IMPORTANT:

The application currently has multiple interconnected features.

Previous attempts to fix individual issues have caused regressions in other
parts of the application, including:

- Authentication failures
- Page rendering failures
- Admin/Student routing problems
- Broken dashboard pages
- Broken lesson rendering
- Incorrect release states
- Assessment issues
- Data synchronization problems

Therefore, from this point forward, the highest priority is:

                    DO NOT BREAK EXISTING FUNCTIONALITY.

A feature is NOT considered fixed if the fix causes another existing feature
to stop working.

===============================================================================
1. CORE RULE
===============================================================================

Before modifying code, understand the existing architecture.

DO NOT immediately start editing the file that visually appears related to
the bug.

First trace:

UI
 ↓
component
 ↓
state
 ↓
query/mutation
 ↓
Convex function
 ↓
database
 ↓
authentication/authorization
 ↓
response
 ↓
UI rendering

Understand the complete data flow before making changes.

===============================================================================
2. PRESERVE WORKING FUNCTIONALITY
===============================================================================

The following areas are HIGH RISK and must be treated as protected systems:

- Clerk authentication
- Authentication state
- Role detection
- Admin authorization
- Student authorization
- Routing
- App initialization
- Convex initialization
- Convex authentication
- Main application entry point
- Student/Admin portal switching
- Existing working course rendering
- Existing working compiler
- Existing working lesson data
- Existing working batch data

DO NOT modify these systems unless the requested issue is proven to originate
there.

If authentication is working before the change, authentication MUST remain
working after the change.

If a page renders before the change, it MUST continue rendering after the
change.

===============================================================================
3. NO UNNECESSARY REFACTORING
===============================================================================

Do not perform broad refactoring while fixing a specific bug.

For example:

If the problem is:

"Student assessment score is not updating"

DO NOT:

- rewrite authentication
- rewrite routing
- rewrite StudentPortal
- rewrite AdminPortal
- replace Convex architecture
- replace database queries
- restructure the entire project
- replace UI components unnecessarily

Only modify the smallest set of files/functions required to solve the actual
problem.

===============================================================================
4. DO NOT MODIFY AUTHENTICATION FOR UNRELATED FEATURES
===============================================================================

Authentication is a protected subsystem.

DO NOT modify:

- Clerk configuration
- auth.config
- authentication providers
- App.tsx authentication gates
- main.tsx initialization
- ctx.auth.getUserIdentity()
- ADMIN_EMAIL logic
- user identity binding
- login/logout flow

unless the issue has been proven to be an authentication issue.

A course-content bug must not result in authentication changes.

An assessment bug must not result in authentication changes.

An analytics bug must not result in authentication changes.

===============================================================================
5. DO NOT CHANGE DATABASE SCHEMA WITHOUT PROOF
===============================================================================

Before changing the Convex schema:

1. Inspect the current schema.
2. Inspect existing documents.
3. Inspect existing queries.
4. Inspect existing mutations.
5. Determine whether the required data already exists.

If the data already exists, reuse it.

Do not create duplicate fields or duplicate collections simply because the
current UI is not displaying existing data correctly.

===============================================================================
6. ONE FEATURE AT A TIME
===============================================================================

Do not implement all outstanding issues simultaneously.

Work in isolated phases.

Recommended order:

PHASE 1
Assessment execution and auto-grading

PHASE 2
Assessment persistence and dashboard scores

PHASE 3
Student topic progress

PHASE 4
Admin course preview

PHASE 5
Batch release consistency

PHASE 6
Admin analytics

PHASE 7
Lesson content improvements

PHASE 8
OpenRouter AI Tutor

Do not start Phase 2 until Phase 1 is verified.

Do not start Phase 3 until Phase 2 is verified.

etc.

===============================================================================
7. BEFORE EVERY CHANGE
===============================================================================

Before editing code, answer these questions internally:

1. What exactly is broken?
2. What is the expected behavior?
3. Which component renders the affected UI?
4. Which query/mutation supplies its data?
5. Where is that data stored?
6. Is authentication involved?
7. Is this shared code?
8. Could changing this code affect Admin and Student simultaneously?
9. What existing behavior must remain unchanged?
10. What is the smallest safe change?

Only then modify the code.

===============================================================================
8. AFTER EVERY CHANGE
===============================================================================

After implementing a change:

RUN:

npx tsc --noEmit

Then:

npm run build

If either fails:

STOP.

Do not continue adding features on top of a broken build.

Fix the regression first.

===============================================================================
9. RUNTIME VERIFICATION IS REQUIRED
===============================================================================

A successful TypeScript compilation does NOT mean the feature works.

For every change, verify the actual user flow.

Example:

Assessment fix:

Student login
 ↓
Dashboard
 ↓
Open Day 1
 ↓
Open assessment
 ↓
Write code
 ↓
Run code
 ↓
Submit
 ↓
Test cases execute
 ↓
Score appears
 ↓
Dashboard updates
 ↓
Admin analytics updates

If any step fails, the feature is NOT complete.

===============================================================================
10. PROTECT BOTH ROLES
===============================================================================

Whenever shared data or shared Convex functions are changed, test:

STUDENT:

- Login
- Dashboard
- Course access
- Lesson
- Topic completion
- Assessment
- Score

ADMIN:

- Login
- Dashboard
- Course Content
- Content Release
- Assessments
- Analytics

A fix is not complete until both roles continue functioning.

===============================================================================
11. DO NOT HIDE ERRORS
===============================================================================

Do not solve a backend/data problem by hiding it in the UI.

Bad:

If score is undefined:
    display 0%

Bad:

If content is missing:
    display placeholder and declare success.

Bad:

If query fails:
    return empty array.

Instead:

Identify why the expected data is missing.

For example:

Submission exists
but score is undefined

Trace:

submission creation
 ↓
evaluation
 ↓
score calculation
 ↓
database mutation
 ↓
query
 ↓
dashboard

Fix the actual broken link.

===============================================================================
12. DO NOT FABRICATE DATA
===============================================================================

Never hardcode:

scores
progress
release states
topic completion
assessment status
analytics

All of these must come from actual persisted application state.

===============================================================================
13. DO NOT DUPLICATE SOURCES OF TRUTH
===============================================================================

There should be one authoritative source for:

Course content
Topic data
Release state
Student progress
Assessment submissions
Assessment results

The UI should consume those sources.

Do not create separate fake state just to make one page look correct.

===============================================================================
14. REGRESSION PROTECTION
===============================================================================

Before modifying a shared component, identify every page using it.

For example:

StudentPortal.tsx

may affect:

- Dashboard
- Syllabus
- Player
- Assessment
- Topic progress

Therefore:

DO NOT make a broad change to StudentPortal simply to fix one card.

Instead isolate the affected logic.

===============================================================================
15. IF A CHANGE BREAKS SOMETHING
===============================================================================

If after a change:

- authentication stops working
- page becomes blank
- route fails
- Convex stops loading
- student portal crashes
- admin portal crashes
- lesson content disappears

DO NOT continue implementing new features.

Immediately:

1. Identify the regression.
2. Compare the modified code with the previous working state.
3. Revert the problematic change.
4. Restore the previously working behavior.
5. Re-run TypeScript/build.
6. Re-test.
7. Only then attempt a safer implementation.

===============================================================================
16. DO NOT CLAIM SUCCESS TOO EARLY
===============================================================================

Do not say:

"Fixed."

because:

- TypeScript passes
- build passes
- database query returns data

A feature is fixed only when the actual user flow works.

The final report must distinguish:

CODE VERIFIED

from:

RUNTIME VERIFIED

from:

END-TO-END VERIFIED

===============================================================================
17. REQUIRED FINAL REPORT
===============================================================================

After every implementation phase, report:

1. Problem identified
2. Root cause
3. Files changed
4. Functions changed
5. Database changes, if any
6. Authentication changes, if any
7. Why authentication was not affected
8. TypeScript result
9. Build result
10. Runtime test performed
11. Student test result
12. Admin test result
13. Remaining issues

If authentication was not required for the fix, explicitly state:

"Authentication was not modified."

===============================================================================
18. GOLDEN RULE
===============================================================================

NEVER TRADE SYSTEM STABILITY FOR A QUICK FIX.

A smaller correct fix is better than a large rewrite.

A verified partial implementation is better than an unverified complete
implementation.

A working existing feature must be preserved.

If the root cause is unclear:

DO NOT GUESS.

Inspect the data flow first.

===============================================================================
END OF STABILITY-FIRST ENGINEERING RULES
===============================================================================