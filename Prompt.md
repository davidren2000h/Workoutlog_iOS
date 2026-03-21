Please use the existing web project as a reference and help me rewrite it into a native iOS app using SwiftUI.

=====================
GLOBAL RULES
=====================

1. Do NOT translate the web code line by line.
2. Preserve business logic, but rewrite it in idiomatic Swift/SwiftUI.
3. Generate code ONLY for the iOS project.
4. Keep architecture clean and layered:
   - Models (data)
   - Services (business logic + persistence)
   - ViewModels (state + screen logic)
   - Views (UI only)
5. Prefer SwiftUI + SwiftData.
6. Keep everything minimal, clean, and compilable.

=====================
PHASE 1 SCOPE (IMPORTANT)
=====================

ONLY implement:

- Session
- Activity
- StrengthSet
- Today screen
- Session detail screen

DO NOT implement yet:

- Cardio
- Skill
- Templates
- Calendar
- Progress charts
- Export
- Share
- i18n
- Timers

=====================
STEP 1 — MIGRATION NOTES (NO CODE)
=====================

Analyze the web project and create a migration note for the iOS project.

Focus only on:
- Session
- Activity
- StrengthSet
- basic workout creation/editing flow

Summarize:
1. Core entities and relationships
2. Main user flow (start workout → edit → finish)
3. Key CRUD operations
4. Important business rules

Write the result into:
Docs/MigrationNotes.md

DO NOT generate Swift code in this step.

=====================
STEP 2 — MODELS
=====================

Using the web project and Docs/MigrationNotes.md as reference, create SwiftData models.

Create ONLY:
- Session
- Activity
- StrengthSet

Requirements:
1. Use SwiftData
2. Use relationships instead of manual foreign keys where possible
3. Keep models minimal but aligned with the web structure
4. Must compile

Target folder:
Models

=====================
STEP 3 — DATA SERVICE
=====================

Create a DataService layer (similar to operations.ts in the web project).

Implement ONLY:

- createSession
- loadSession
- addActivity
- updateActivity
- deleteActivity
- addStrengthSet
- updateStrengthSet
- deleteStrengthSet
- endSession

Requirements:
1. Adapt logic from web project (do NOT translate line by line)
2. All persistence must go through this layer
3. No database logic inside Views
4. Keep clean and minimal

Target folder:
Services

=====================
STEP 4 — TODAY VIEW MODEL
=====================

Create TodayViewModel.

Responsibilities:
- load today's sessions
- create a blank session
- expose data for UI
- support navigation to session detail

Requirements:
- Use ObservableObject + @Published
- Use DataService
- Keep minimal

Target folder:
ViewModels

=====================
STEP 5 — SESSION VIEW MODEL (CORE)
=====================

Create SessionViewModel.

Responsibilities:
- load session with activities
- add strength activity
- add strength set
- edit weight/reps
- delete set
- delete activity
- finish session

Requirements:
1. Use DataService
2. Keep scope limited to Session / Activity / StrengthSet
3. No cardio, no templates, no analytics
4. Must compile

Target folder:
ViewModels

=====================
STEP 6 — TODAY VIEW
=====================

Create TodayView.

Requirements:
- show today’s sessions
- button to start a new session
- navigate to SessionDetailView
- simple UI only

Use TodayViewModel.

Target folder:
Views/Today

=====================
STEP 7 — SESSION DETAIL VIEW (CORE UI)
=====================

Create SessionDetailView.

Requirements:
1. show session info
2. list activities in order
3. show strength sets
4. add activity
5. add set
6. edit weight & reps
7. delete set
8. delete activity
9. finish workout

Rules:
- Use SessionViewModel
- Keep UI simple
- No advanced styling
- No cardio / skill / templates

Target folder:
Views/Session

=====================
STEP 8 — APP NAVIGATION
=====================

Set up basic app navigation.

Requirements:
- SwiftUI App entry
- NavigationStack
- TodayView as root
- navigation to SessionDetailView
- minimal working structure

=====================
STEP 9 — FIX COMPILATION
=====================

Fix compile errors.

Rules:
1. Do NOT redesign architecture
2. Do NOT add features
3. Only minimal fixes
4. Explain each fix briefly

=====================
STEP 10 — REFACTOR (NO NEW FEATURES)
=====================

Refactor code for clarity.

Rules:
1. No behavior changes
2. No new features
3. Keep architecture
4. Improve naming and structure only

=====================
IMPORTANT
=====================

Always:
- read the web project for business logic
- generate code ONLY for iOS
- stay strictly within Phase 1 scope
