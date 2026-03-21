Analyze the web project in the folder WorkoutLog-web and summarize only the parts needed for an iOS rewrite:

1. Core data entities and relationships
2. Main user flows
3. Key CRUD operations
4. Derived statistics logic
5. Important reusable business rules

Do not generate code yet. Write the result as a migration note for the iOS project.

---

# iOS Migration Notes

## 1. Core Data Entities and Relationships

### Entities

| Entity | Key Fields | Notes |
|---|---|---|
| **UserProfile** | `id`, `name`, `createdAt` (epoch ms) | Single-row; optional (guest mode supported) |
| **Session** | `id`, `date` (YYYY-MM-DD), `startTime` (epoch ms), `endTime?`, `duration?` (seconds), `notes`, `templateId?` | Top-level workout container |
| **Activity** | `id`, `sessionId` (FK→Session), `type` (Strength/Cardio/Skill), `title`, `order`, `notes` | One session has many activities |
| **StrengthSet** | `id`, `activityId` (FK→Activity), `setIndex`, `weight`, `reps`, `rpe?`, `restSeconds?`, `tempo?`, `isCompleted` | Only for type=Strength |
| **CardioEntry** | `id`, `activityId` (FK→Activity), `duration` (sec), `distance?` (km), `pace?`, `avgHr?`, `rpe?` | Only for type=Cardio; one-to-one with Activity |
| **SkillEntry** | `id`, `activityId` (FK→Activity), `duration` (sec), `rpe?`, `notes`, `tags` (string[]) | Only for type=Skill; one-to-one with Activity |
| **ExerciseReference** | `id`, `name`, `bodyPart`, `equipment`, `isCustom` | Exercise catalog (seeded with ~50 defaults) |
| **WorkoutTemplate** | `id`, `name`, `activities` (embedded TemplateActivity[]) | Reusable workout blueprints |
| **TemplateActivity** | `type`, `title`, `order`, `sets?` | Embedded in WorkoutTemplate (not a separate table) |

### Relationships

```
UserProfile (singleton)

Session 1──→ * Activity
Activity 1──→ * StrengthSet      (when type = Strength)
Activity 1──→ 0..1 CardioEntry   (when type = Cardio)
Activity 1──→ 0..1 SkillEntry    (when type = Skill)

WorkoutTemplate ──embeds──→ TemplateActivity[]

Session.templateId ──→ WorkoutTemplate.id  (optional origin ref)
```

### Aggregated View Models (not persisted, computed at read time)

- **SessionWithActivities** = Session + ActivityWithSets[]
- **ActivityWithSets** = Activity + strengthSets?[] / cardioEntry? / skillEntry?
- **PersonalRecord** = { exerciseName, maxWeight, maxWeightReps, maxRepsAtWeight, date }
- **DaySummary** = { date, hasWorkout, totalDuration, sessionCount }
- **ShareStats** = { startDate, endDate, sessionCount, totalDuration, totalVolume, activeDays, exerciseNames, topExercises }

---

## 2. Main User Flows

### Onboarding
1. First launch → **WelcomePage**: user enters name to create profile, or taps "Continue as Guest"
2. Guest flag stored in localStorage (`workoutlog-guest`)

### Today (Home) Flow
1. **TodayPage** shows today's sessions split into "In Progress" / "Completed"
2. User taps **"Start Blank Workout"** → creates Session → navigates to SessionPage
3. Or taps **"Start from Template"** → picks template → creates Session pre-filled with activities and default sets → SessionPage

### Session (Workout) Flow
1. **SessionPage** displays a running timer + list of activities
2. User taps **"Add Exercise"** → opens **ExercisePicker** (search/filter from ExerciseReference catalog) → selects exercise → Activity created
3. For **Strength**: shows set rows (weight, reps, ✓ complete). User can add/delete sets. Effort level selector (Easy/Medium/Hard → sets RPE 1/2/3)
4. For **Cardio**: inline form for duration, distance, pace, avg HR, RPE
5. For **Skill**: inline form for duration, RPE, notes, tags
6. User taps **"Finish"** → session endTime & duration computed and saved
7. **RestTimer** auto-triggers after completing a set

### Calendar Flow
1. **CalendarPage** shows month grid with dots on workout days
2. Tap a day → shows list of sessions for that date → tap to navigate to SessionPage

### Progress Flow
1. **ProgressPage**: user selects an exercise from dropdown
2. Shows **Personal Records** (max weight, reps at max, best reps, PR date)
3. Shows **This Week's Volume** (weight × reps summed for current Mon–Sun)

### Templates Flow
1. **TemplatesPage**: list saved templates; create/edit/delete
2. Template editor: set name, add activities (title, type, default sets count)

### Export Flow
1. **ExportPage**: pick date range → download as JSON or CSV

### Share Flow
1. **SharePage**: pick date range → generates a share-card image with stats (session count, total duration, total volume, active days, top exercises)

### Settings Flow
1. View/edit profile name, switch language (English/中文), link to share/templates/export, **danger zone: delete all data**

---

## 3. Key CRUD Operations

### Session
| Operation | Function | Details |
|---|---|---|
| Create | `createSession(date, templateId?)` | Sets startTime=now, empty notes |
| Read one | `getSession(id)`, `getSessionFull(id)` | Full version loads all nested activities+sets |
| Read by date | `getSessionsByDate(date)` | For TodayPage and CalendarPage |
| Update | `updateSession(id, changes)` | Notes, etc. |
| End | `endSession(id)` | Computes duration = (now - startTime) / 1000 |
| Delete | `deleteSession(id)` | **Cascades**: deletes all child activities (which cascade to their sets/entries) |

### Activity
| Operation | Function | Details |
|---|---|---|
| Create | `addActivity(sessionId, type, title)` | order = count of existing activities |
| Update | `updateActivity(id, changes)` | |
| Delete | `deleteActivity(id)` | **Cascades**: deletes related strengthSets, cardioEntries, skillEntries |

### StrengthSet
| Operation | Function | Details |
|---|---|---|
| Create | `addSet(activityId, defaults?)` | setIndex = count of existing sets |
| Update | `updateSet(id, changes)` | weight, reps, RPE, isCompleted, etc. |
| Delete | `deleteSet(id)` | |

### CardioEntry / SkillEntry
| Operation | Function | Details |
|---|---|---|
| Upsert | `upsertCardio(activityId, data)`, `upsertSkill(activityId, data)` | Creates if not exists, updates if exists (one-to-one) |

### ExerciseReference
| Operation | Function | Details |
|---|---|---|
| Read all | `getAllExercises()` | Sorted by name |
| Create | `addExercise(ex)` | For custom exercises |
| Delete | `deleteExercise(id)` | |
| Seed | `seedExercisesIfEmpty()` | On first load, seeds ~50 default exercises; for existing users, adds any missing new built-ins |

### WorkoutTemplate
| Operation | Function | Details |
|---|---|---|
| Read all | `getAllTemplates()` | |
| Read one | `getTemplate(id)` | |
| Save | `saveTemplate(t)` | If t.id exists → update; else → insert |
| Delete | `deleteTemplate(id)` | |
| Start from | `startFromTemplate(templateId, date)` | Creates session + activities + default sets with smart defaults |

### UserProfile
| Operation | Function | Details |
|---|---|---|
| Read | `getProfile()` | Returns first (and only) profile |
| Create | `createProfile(name)` | Sets createdAt = now |
| Update | `updateProfile(id, changes)` | Name editing |

### Data Management
| Operation | Function | Details |
|---|---|---|
| Delete all | `deleteAllData()` | Clears all tables, then re-seeds exercises |
| Export JSON | `exportJSON(startDate, endDate)` | Full session data with nested activities/sets |
| Export CSV | `exportCSV(startDate, endDate)` | Flat rows: Date, Exercise, Type, Set#, Weight, Reps, RPE, etc. |

---

## 4. Derived Statistics Logic

### Personal Records (`getPersonalRecords(exerciseName)`)
- Finds all Activities with matching title
- Iterates all completed StrengthSets across all sessions
- Tracks:
  - **maxWeight**: highest weight lifted (and reps at that weight)
  - **maxWeightReps**: if same max weight, highest reps
  - **maxRepsAtWeight**: highest reps performed (at any weight), preferring heavier weight on tie
  - **date**: session date when max weight PR occurred
- Only counts sets where `isCompleted === true`

### Weekly Volume (`getWeeklyVolume(exerciseName, weekStart, weekEnd)`)
- Filters sessions in date range
- Sums `weight × reps` for all completed sets of the specified exercise
- Returns total volume in kg

### Month Summaries (`getMonthSummaries(year, month)`)
- Filters sessions by date prefix (YYYY-MM)
- Groups by date
- Returns per-day: `{ date, hasWorkout: true, totalDuration, sessionCount }`

### Share Stats (`getShareStats(startDate, endDate)`)
- Over a date range, computes:
  - **sessionCount**: total sessions
  - **totalDuration**: sum of all session durations (seconds)
  - **totalVolume**: sum of weight × reps for all completed strength sets (kg)
  - **activeDays**: count of unique dates with sessions
  - **exerciseNames**: unique exercise names used
  - **topExercises**: top 5 exercises by frequency (count of appearances)

### Session Duration (computed on `endSession`)
- `duration = Math.round((Date.now() - startTime) / 1000)` — stored in seconds

---

## 5. Important Reusable Business Rules

### Smart Defaults
- When starting from a template or adding an exercise, the app looks up the **most recent session** containing the same exercise title (`getLastUsedDefaults`)
- Pre-fills new sets with the last set's `weight`, `reps`, `rpe`, and `restSeconds`
- When manually adding sets, duplicates the **last set's** weight and reps

### Activity Type Polymorphism
- Each Activity has a `type` field (Strength / Cardio / Skill) that determines which child entity it links to
- **Strength** → multiple StrengthSets (ordered by setIndex)
- **Cardio** → single CardioEntry (upsert pattern)
- **Skill** → single SkillEntry (upsert pattern)
- iOS Core Data should model this as either separate relationships or a protocol/enum-based approach

### Cascade Deletes
- Deleting a Session → deletes all its Activities → deletes all their Sets/Entries
- Deleting an Activity → deletes its StrengthSets, CardioEntry, SkillEntry
- Must be implemented manually (not automatic in Dexie/IndexedDB); in Core Data, use cascade delete rules

### Exercise Catalog Seeding
- ~50 built-in exercises across 8 body parts (Chest, Back, Shoulders, Biceps, Triceps, Legs, Abs, Cardio)
- Each has: name, bodyPart, equipment, isCustom=false
- On app launch, seeds if empty; for existing users, adds any new built-ins not yet present (idempotent by name matching)
- Users can add custom exercises (isCustom=true)

### Ordering
- Activities within a session are ordered by `order` field (0-based, assigned as count of existing)
- StrengthSets within an activity are ordered by `setIndex` (0-based)

### Effort Level (RPE Simplification)
- Simplified to 3 levels: Easy (1), Medium (2), Hard (3)
- Selecting an effort level applies the same RPE to **all sets** in that activity

### Guest Mode
- Users can skip account creation; guest flag stored in localStorage
- Guest users have full functionality but no profile
- Can upgrade to a named profile later from Settings

### Internationalization
- Supports English and Chinese (zh)
- Exercise names have bilingual translations (stored in `utils/exerciseNames.ts`)
- Language preference stored locally

### Date Handling
- All dates stored as `YYYY-MM-DD` strings
- Timestamps stored as epoch milliseconds
- Durations stored in seconds
- Week starts on Monday for volume calculations

---

# Phase 1 Implementation Summary

All 10 steps from `Prompt.md` have been executed. Below is a summary of what was created.

## Project Structure

```
iOS/
  WorkoutLogApp.swift          ← App entry point + NavigationStack
  Docs/
    MigrationNotes.md          ← Phase 1 migration analysis
  Models/
    Session.swift              ← SwiftData model
    Activity.swift             ← SwiftData model + ActivityType enum
    StrengthSet.swift          ← SwiftData model
  Services/
    DataService.swift          ← All persistence / CRUD operations
  ViewModels/
    TodayViewModel.swift       ← Today screen state + actions
    SessionViewModel.swift     ← Session detail state + actions
  Views/
    Today/
      TodayView.swift          ← Today screen UI
    Session/
      SessionDetailView.swift  ← Workout detail UI
  Helpers/
    DurationFormatter.swift    ← Shared duration formatting
```

## Step-by-Step Results

### Step 1 — Migration Notes
- Created `iOS/Docs/MigrationNotes.md` with Phase 1-scoped analysis.
- Documented: Session, Activity, StrengthSet entities; relationships; CRUD operations; the start→edit→finish user flow; business rules (cascade deletes, smart defaults, ordering, effort levels).
- No code generated.

### Step 2 — SwiftData Models
- **Session**: `date` (String), `startTime` (Date), `endTime?`, `duration?` (Int, seconds), `notes`. Cascade relationship to Activities. Computed `isActive` and `sortedActivities`.
- **Activity**: `type` (ActivityType enum: strength/cardio/skill), `title`, `order`, `notes`. Belongs to Session. Cascade relationship to StrengthSets. Computed `sortedSets`.
- **StrengthSet**: `setIndex`, `weight` (Double), `reps` (Int), `rpe?`, `restSeconds?`, `tempo?`, `isCompleted`. Belongs to Activity.
- Used native `Date` instead of epoch ms. Used `@Relationship(deleteRule: .cascade)` for automatic cascading.

### Step 3 — DataService
- Single service class with `ModelContext` dependency injection.
- **Session ops**: `createSession`, `endSession` (computes duration), `updateSessionNotes`, `deleteSession`, `sessionsForDate`.
- **Activity ops**: `addActivity` (auto-creates first set with smart defaults), `deleteActivity`.
- **Set ops**: `addStrengthSet` (duplicates last set values), `updateStrengthSet`, `deleteStrengthSet`.
- **Effort**: `setEffortLevel` — applies RPE to all sets in an activity.
- **Smart defaults**: `lastUsedDefaults` looks up the most recent session with same exercise title, returns last set's weight/reps/rpe/restSeconds.

### Step 4 — TodayViewModel
- Loads today's sessions via DataService, splits into `activeSessions` / `completedSessions`.
- `createBlankSession()` — creates and returns session for navigation.
- `deleteSession()` — deletes with refresh.

### Step 5 — SessionViewModel
- Holds a `Session` and exposes all mutation methods: `finishSession`, `updateNotes`, `addActivity`, `deleteActivity`, `addSet`, `updateSet`, `deleteSet`, `setEffort`.
- Notifies UI via `objectWillChange.send()`.

### Step 6 — TodayView
- Shows "Today" header with formatted date.
- Active sessions: green "In Progress" cards with exercise names and set completion counts.
- Completed sessions: exercise summary, duration, delete button.
- Empty state message when no workouts.
- "Start Blank Workout" button → creates session → navigates to SessionDetailView via `navigationDestination(item:)`.

### Step 7 — SessionDetailView
- Start time display (active) or completed duration (finished).
- Activity cards with: title, "Strength" badge, delete button, column headers, set rows.
- Set rows: index, weight input, reps input, completion checkmark, delete button.
- Effort selector: Easy (green) / Medium (orange) / Hard (red) capsule buttons.
- "Add Exercise" button → alert with text field.
- "Finish" toolbar button.
- Notes text field at bottom.

### Step 8 — App Navigation
- `@main` WorkoutLogApp with SwiftData `modelContainer` for all three models.
- ContentView wraps TodayView in a NavigationStack.
- DataService initialized from environment `modelContext`.

### Step 9 — Compilation Fixes
- Added `@discardableResult` to `addActivity` and `addStrengthSet` (return values unused by callers).
- Replaced tuple-based `ForEach` in effort selector (tuples aren't `Hashable`) with explicit `effortButton` method calls.

### Step 10 — Refactoring
- Extracted duplicate `formatDuration` into shared `DurationFormatter` helper.
- Removed unused `loadSession` no-op method from DataService.
- Removed unused `import SwiftData` from TodayView.
