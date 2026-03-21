# Product Requirements Document (PRD)

## Product Name
**Lightweight Workout Log (PWA)**
(Working title)

## Product Type
Web-first Progressive Web App (PWA)
Offline-first, installable on mobile, future migration to native mobile app (iOS / Android).

---

## 1. Overview

### 1.1 Problem Statement
Most fitness apps (e.g., MyFitnessPal, Strong, Hevy) are either too heavy, too social, or too opinionated.
For users who just want to log daily workouts quickly and accurately, existing apps introduce unnecessary friction:

- Too many features (nutrition, social feeds, AI coaching)
- Slow or unreliable input in gyms with poor connectivity
- Data lock-in and limited export

### 1.2 Product Vision
Build a fast, offline-first workout journal that focuses on:

- Daily workout logging
- High-quality strength training data (sets, reps, weight, RPE)
- Simple review of progress
- Full data ownership (export anytime)

This product prioritizes speed, reliability, and data clarity over social or recommendation features.

### 1.3 Target Users

- Strength / hypertrophy focused lifters
- Users who already know what they train and just want to log it
- Data-oriented users who value export and analysis
- Users training in environments with poor or no internet connectivity

---

## 2. Product Scope

### 2.1 In Scope (MVP)

- Daily workout logging (Strength / Cardio / Skill)
- Set-level strength tracking (weight, reps, RPE, rest, tempo)
- Offline-first PWA (works fully without network)
- Calendar and basic progress review
- CSV / JSON export
- Installable on mobile via PWA

### 2.2 Out of Scope (MVP)

- Nutrition tracking
- Social features (followers, likes, sharing)
- AI coaching or program generation
- Wearable integrations (Apple Health, Garmin, etc.)
- Automatic progression logic

---

## 3. Core User Experience

### 3.1 Primary User Flow (Daily Logging)

1. Open app (even offline)
2. Start today's workout (blank or from template)
3. Log exercises and sets quickly
4. Mark sets as completed
5. End workout
6. Review later via calendar or stats

**Target:** A full workout can be logged in < 30 seconds per exercise.

---

## 4. Functional Requirements

### 4.1 Workout Types
The app supports three activity types within one session:

#### A. Strength

- Exercise-based
- Multiple sets per exercise

**Per Set Fields:**
- Weight
- Repetitions
- RPE (optional)
- Rest time (seconds, optional)
- Tempo (string, optional, e.g. 3-1-1)
- Completion checkbox

#### B. Cardio

- Duration (required)
- Distance (optional)
- Pace (optional)
- Average HR (optional)
- RPE (optional)

#### C. Skill / Sport
(e.g., basketball, yoga, mobility)

- Duration
- Intensity (RPE)
- Free-text notes
- Optional tags

### 4.2 Workout Templates

- Users can define reusable workout templates
- Templates may represent:
  - A single workout
  - A weekly plan (3–5 days)

**Template usage:**
- One tap to generate today's workout
- Previous weights/reps are auto-filled

### 4.3 Smart Defaults
To optimize input speed:

- Last-used weight/reps auto-filled per exercise
- Rest time defaults configurable
- RPE optional by default
- New sets duplicate previous set values

---

## 5. Data Review & Insights (MVP)

### 5.1 Calendar View

- Monthly calendar
- Each day shows:
  - Workout completed (dot/indicator)
  - Total workout duration

### 5.2 Workout Detail View

- Timeline-style view of the day
- Exercises listed in performed order
- Sets clearly grouped

### 5.3 Progress Tracking

**Personal Records (PRs):**
- Max weight per exercise
- Best reps at a given weight

**Training Volume:**
- Volume = weight × reps × sets
- Weekly aggregation

(No advanced analytics or AI interpretation in MVP)

---

## 6. Data Model (High-Level)

### 6.1 Core Entities

**Session**
- id
- date
- startTime
- duration
- notes
- templateId (optional)

**Activity**
- id
- sessionId
- type (Strength | Cardio | Skill)
- title
- order
- notes

**StrengthSet**
- id
- activityId
- setIndex
- weight
- reps
- rpe
- restSeconds
- tempo
- isCompleted

**ExerciseReference**
- id
- name
- bodyPart
- equipment
- isCustom

---

## 7. Offline & Sync Strategy

### 7.1 Offline-First Principle

- App must function fully offline
- All writes go to local storage first

### 7.2 Local Storage

- IndexedDB (via wrapper such as Dexie.js)
- Local DB is the source of truth in MVP

### 7.3 Cloud Sync (Post-MVP)

- Optional account-based sync
- Designed to be added without data model changes

---

## 8. Export & Data Ownership

### 8.1 Export Formats

- CSV
- JSON

### 8.2 Export Scope

- User-selectable date range
- Includes:
  - Sessions
  - Exercises
  - Sets
  - Cardio entries

### 8.3 Privacy Principles

- User owns all data
- No export restrictions
- Full delete capability

---

## 9. Platform & Technical Assumptions

### 9.1 Platform

- Web-first PWA
- Mobile-installable (Add to Home Screen)

### 9.2 Tech Stack (Non-binding)

- Frontend: React or Vue + TypeScript
- Storage: IndexedDB
- PWA: Service Worker + offline cache
- No backend required for MVP

---

## 10. Success Metrics (Qualitative for MVP)

- Logging friction (subjective)
- Ability to complete a workout entirely offline
- Speed of workout entry
- Successful export of full history

---

## 11. Future Enhancements (Explicitly Non-MVP)

- Native mobile app (React Native / Flutter)
- Cloud sync
- Advanced analytics (e1RM trends, RPE distributions)
- PDF reports
- Wearable data import
- Program progression logic

---

## 12. Design Principles

- Fast over fancy
- Fewer taps > more features
- Offline is the default, not an edge case
- Data clarity > visual polish
