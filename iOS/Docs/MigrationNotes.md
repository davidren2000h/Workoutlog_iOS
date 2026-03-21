# iOS Migration Notes — Phase 1

> Scope: Session, Activity, StrengthSet, and basic workout creation/editing flow only.
> Source: Web project in `../Web/`

---

## 1. Core Entities and Relationships

### Session
| Field | Type | Notes |
|---|---|---|
| id | Auto-increment Int | Primary key |
| date | String (YYYY-MM-DD) | The calendar date of the workout |
| startTime | Int (epoch ms) | When the session began |
| endTime | Int? (epoch ms) | When the user tapped "Finish"; nil while active |
| duration | Int? (seconds) | Computed on finish: `(endTime - startTime) / 1000` |
| notes | String | Free-text notes, default empty |

### Activity
| Field | Type | Notes |
|---|---|---|
| id | Auto-increment Int | Primary key |
| sessionId | Int (FK → Session) | Parent session |
| type | Enum: Strength / Cardio / Skill | Phase 1: only Strength |
| title | String | Exercise name (e.g. "Barbell Bench Press") |
| order | Int | 0-based position within the session |
| notes | String | Per-activity notes, default empty |

### StrengthSet
| Field | Type | Notes |
|---|---|---|
| id | Auto-increment Int | Primary key |
| activityId | Int (FK → Activity) | Parent activity |
| setIndex | Int | 0-based position within the activity |
| weight | Double | Weight in kg |
| reps | Int | Number of repetitions |
| rpe | Int? | Effort rating (1=Easy, 2=Medium, 3=Hard) |
| restSeconds | Int? | Rest time after this set |
| tempo | String? | Tempo notation (e.g. "3-1-1") |
| isCompleted | Bool | Whether the user marked this set done |

### Relationships

```
Session  1 ──→ *  Activity      (one session has many activities)
Activity 1 ──→ *  StrengthSet   (one activity has many sets, when type = Strength)
```

- In the web project, relationships are manual via foreign keys (sessionId, activityId).
- For iOS/SwiftData, use proper `@Relationship` with cascade delete rules.

---

## 2. Main User Flow

### Start a Workout
1. User opens the app → **Today screen** shows today's sessions (active and completed).
2. User taps **"Start Blank Workout"**.
3. A new `Session` is created with `date = today`, `startTime = now`, `notes = ""`.
4. App navigates to the **Session Detail screen**.

### Build the Workout
5. User taps **"Add Exercise"** → selects an exercise name → a new `Activity` is created with `type = Strength`, `order = next index`.
6. One default `StrengthSet` is automatically created with the new activity.
7. **Smart defaults**: if the user has done this exercise before, the new set pre-fills with the last session's final set values (weight, reps, rpe, restSeconds).
8. User edits **weight** and **reps** inline for each set.
9. User taps the **checkmark** to mark a set as completed (`isCompleted = true`).
10. User can **add more sets** — new sets duplicate the last set's weight and reps.
11. User can **delete a set** or **delete an entire activity** (which cascades to delete its sets).
12. User can set **effort level** (Easy/Medium/Hard) — applies RPE to all sets in that activity.

### Finish the Workout
13. User taps **"Finish"**.
14. `endTime = now`, `duration = round((endTime - startTime) / 1000)` is saved.
15. Session moves from "In Progress" to "Completed" on the Today screen.

### View / Resume
16. User can tap any session (active or completed) to view/edit it.
17. Active sessions show a running timer; completed sessions show total duration.

### Delete
18. User can delete a completed session from the Today screen (with confirmation).
19. Deleting a session cascades: all activities → all sets are deleted.

---

## 3. Key CRUD Operations

### Session
| Operation | Web Function | Behavior |
|---|---|---|
| Create | `createSession(date)` | Sets startTime = now, notes = "" |
| Read | `getSessionFull(id)` | Returns session with all activities and their sets |
| Read by date | `getSessionsByDate(date)` | For the Today screen |
| Update | `updateSession(id, changes)` | Update notes |
| End | `endSession(id)` | Compute and save endTime + duration |
| Delete | `deleteSession(id)` | Cascade delete all activities → sets |

### Activity
| Operation | Web Function | Behavior |
|---|---|---|
| Create | `addActivity(sessionId, type, title)` | order = count of existing activities in session |
| Delete | `deleteActivity(id)` | Cascade delete all child strengthSets |

### StrengthSet
| Operation | Web Function | Behavior |
|---|---|---|
| Create | `addSet(activityId, defaults?)` | setIndex = count of existing sets; pre-fill from defaults |
| Update | `updateSet(id, changes)` | weight, reps, rpe, isCompleted, etc. |
| Delete | `deleteSet(id)` | Direct delete |

### Smart Defaults
| Operation | Web Function | Behavior |
|---|---|---|
| Get last used | `getLastUsedDefaults(exerciseTitle)` | Find most recent activity with same title → return its last set's weight, reps, rpe, restSeconds |

---

## 4. Important Business Rules

### Cascade Deletes
- Delete Session → delete all its Activities → delete all their StrengthSets.
- Delete Activity → delete all its StrengthSets.
- In SwiftData, configure `.cascade` delete rules on relationships.

### Ordering
- Activities are ordered by `order` field (0-based, assigned as count of existing activities).
- StrengthSets are ordered by `setIndex` (0-based, assigned as count of existing sets).

### Smart Defaults (Pre-fill from History)
- When adding a new strength activity, look up the most recent session containing the same exercise title.
- From that activity, take the **last set's** weight, reps, rpe, and restSeconds.
- Pre-fill the first set of the new activity with these values.
- When the user adds additional sets, duplicate the **current last set's** weight and reps.

### Effort Level (Simplified RPE)
- Three levels: Easy (1), Medium (2), Hard (3).
- Selecting a level applies the same RPE value to **all sets** in that activity.

### Session Duration
- Duration is only computed when the user taps "Finish".
- Formula: `duration = round((Date.now - startTime) / 1000)` in seconds.
- An active session has `endTime = nil` and `duration = nil`.

### Activity Type
- Phase 1 only uses `Strength`. The `type` field should still exist as an enum for future expansion (Cardio, Skill), but only Strength logic needs to be implemented now.

### No Direct DB Access from Views
- All persistence goes through a service layer (equivalent to web's `operations.ts`).
- Views talk to ViewModels, ViewModels talk to the service layer.
