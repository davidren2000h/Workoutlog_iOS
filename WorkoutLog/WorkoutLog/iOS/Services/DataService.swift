import Foundation
import SwiftData

@MainActor
final class DataService {
    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    // MARK: - Session

    func createSession(date: String) -> Session {
        let session = Session(date: date)
        modelContext.insert(session)
        save()
        return session
    }

    func endSession(_ session: Session) {
        let now = Date.now
        session.endTime = now
        session.duration = Int(now.timeIntervalSince(session.startTime))
        save()
    }

    func updateSessionNotes(_ session: Session, notes: String) {
        session.notes = notes
        save()
    }

    func deleteSession(_ session: Session) {
        modelContext.delete(session) // cascade handles activities → sets
        save()
    }

    func sessionsForDate(_ date: String) -> [Session] {
        let predicate = #Predicate<Session> { $0.date == date }
        let descriptor = FetchDescriptor<Session>(
            predicate: predicate,
            sortBy: [SortDescriptor(\.startTime)]
        )
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    // MARK: - Activity

    @discardableResult
    func addActivity(to session: Session, type: ActivityType = .strength, title: String) -> Activity {
        let order = session.activities.count
        let activity = Activity(type: type, title: title, order: order)
        activity.session = session
        modelContext.insert(activity)

        // Auto-create one default set for strength activities
        if type == .strength {
            let defaults = lastUsedDefaults(for: title)
            let set = StrengthSet(
                setIndex: 0,
                weight: defaults?.weight ?? 0,
                reps: defaults?.reps ?? 0,
                rpe: defaults?.rpe,
                restSeconds: defaults?.restSeconds
            )
            set.activity = activity
            modelContext.insert(set)
        }

        save()
        return activity
    }

    func deleteActivity(_ activity: Activity) {
        modelContext.delete(activity) // cascade handles sets
        save()
    }

    // MARK: - StrengthSet

    @discardableResult
    func addStrengthSet(to activity: Activity) -> StrengthSet {
        let lastSet = activity.sortedSets.last
        let set = StrengthSet(
            setIndex: activity.strengthSets.count,
            weight: lastSet?.weight ?? 0,
            reps: lastSet?.reps ?? 0
        )
        set.activity = activity
        modelContext.insert(set)
        save()
        return set
    }

    func updateStrengthSet(_ set: StrengthSet, weight: Double? = nil, reps: Int? = nil,
                           rpe: Int? = nil, isCompleted: Bool? = nil) {
        if let weight { set.weight = weight }
        if let reps { set.reps = reps }
        if let rpe { set.rpe = rpe }
        if let isCompleted { set.isCompleted = isCompleted }
        save()
    }

    func deleteStrengthSet(_ set: StrengthSet) {
        modelContext.delete(set)
        save()
    }

    // MARK: - Effort Level

    func setEffortLevel(for activity: Activity, level: Int) {
        for set in activity.strengthSets {
            set.rpe = level
        }
        save()
    }

    // MARK: - Smart Defaults

    private func lastUsedDefaults(for exerciseTitle: String) -> StrengthSet? {
        // Find all activities with this title, sorted by their session's startTime descending
        let predicate = #Predicate<Activity> { $0.title == exerciseTitle }
        let descriptor = FetchDescriptor<Activity>(predicate: predicate)
        guard let activities = try? modelContext.fetch(descriptor) else { return nil }

        // Sort by session start time, most recent first
        let sorted = activities
            .filter { $0.session != nil }
            .sorted { ($0.session?.startTime ?? .distantPast) > ($1.session?.startTime ?? .distantPast) }

        guard let latest = sorted.first else { return nil }
        return latest.sortedSets.last
    }

    // MARK: - Exercise Reference

    func seedExercisesIfEmpty() {
        let descriptor = FetchDescriptor<ExerciseReference>()
        let count = (try? modelContext.fetchCount(descriptor)) ?? 0
        guard count == 0 else { return }

        for ex in Self.defaultExercises {
            modelContext.insert(ex)
        }
        save()
    }

    func allExercises() -> [ExerciseReference] {
        let descriptor = FetchDescriptor<ExerciseReference>(
            sortBy: [SortDescriptor(\.bodyPart), SortDescriptor(\.name)]
        )
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    func exercisesByBodyPart() -> [String: [ExerciseReference]] {
        Dictionary(grouping: allExercises(), by: \.bodyPart)
    }

    @discardableResult
    func addCustomExercise(name: String, bodyPart: String, equipment: String) -> ExerciseReference {
        let ref = ExerciseReference(name: name, bodyPart: bodyPart, equipment: equipment, isCustom: true)
        modelContext.insert(ref)
        save()
        return ref
    }

    // MARK: - Helpers

    private func save() {
        try? modelContext.save()
    }

    // MARK: - Default Exercise Catalog

    private static let defaultExercises: [ExerciseReference] = [
        // Chest
        ExerciseReference(name: "Barbell Bench Press", bodyPart: "Chest", equipment: "Barbell"),
        ExerciseReference(name: "Cable Fly", bodyPart: "Chest", equipment: "Cable"),
        ExerciseReference(name: "Chest Press Machine", bodyPart: "Chest", equipment: "Machine"),
        ExerciseReference(name: "Hammer Strength Decline Chest Press", bodyPart: "Chest", equipment: "Machine"),
        ExerciseReference(name: "Incline Cable Fly", bodyPart: "Chest", equipment: "Cable"),
        ExerciseReference(name: "Decline Cable Fly", bodyPart: "Chest", equipment: "Cable"),
        ExerciseReference(name: "Assisted Dips", bodyPart: "Chest", equipment: "Machine"),
        ExerciseReference(name: "Hammer Strength Incline Chest Press", bodyPart: "Chest", equipment: "Machine"),

        // Back
        ExerciseReference(name: "Barbell Deadlift", bodyPart: "Back", equipment: "Barbell"),
        ExerciseReference(name: "Barbell Row", bodyPart: "Back", equipment: "Barbell"),
        ExerciseReference(name: "Pull-Up", bodyPart: "Back", equipment: "Bodyweight"),
        ExerciseReference(name: "Lat Pulldown", bodyPart: "Back", equipment: "Cable"),
        ExerciseReference(name: "Wide-Grip Pull-Up", bodyPart: "Back", equipment: "Bodyweight"),
        ExerciseReference(name: "Assisted Wide-Grip Pull-Up", bodyPart: "Back", equipment: "Machine"),
        ExerciseReference(name: "Weighted Wide-Grip Pull-Up", bodyPart: "Back", equipment: "Bodyweight"),
        ExerciseReference(name: "Neutral-Grip Pull-Up", bodyPart: "Back", equipment: "Bodyweight"),
        ExerciseReference(name: "Assisted Neutral-Grip Pull-Up", bodyPart: "Back", equipment: "Machine"),
        ExerciseReference(name: "Weighted Neutral-Grip Pull-Up", bodyPart: "Back", equipment: "Bodyweight"),
        ExerciseReference(name: "Seated Row Machine", bodyPart: "Back", equipment: "Machine"),
        ExerciseReference(name: "Wide-Grip Lat Pulldown", bodyPart: "Back", equipment: "Cable"),
        ExerciseReference(name: "Close-Grip Lat Pulldown", bodyPart: "Back", equipment: "Cable"),
        ExerciseReference(name: "V-Bar Lat Pulldown", bodyPart: "Back", equipment: "Cable"),
        ExerciseReference(name: "Bent-Over Barbell Row", bodyPart: "Back", equipment: "Barbell"),

        // Shoulders
        ExerciseReference(name: "Overhead Press", bodyPart: "Shoulders", equipment: "Barbell"),
        ExerciseReference(name: "Dumbbell Lateral Raise", bodyPart: "Shoulders", equipment: "Dumbbell"),
        ExerciseReference(name: "Lateral Raise", bodyPart: "Shoulders", equipment: "Dumbbell"),
        ExerciseReference(name: "Front Raise", bodyPart: "Shoulders", equipment: "Dumbbell"),
        ExerciseReference(name: "Seated Barbell Overhead Press", bodyPart: "Shoulders", equipment: "Barbell"),
        ExerciseReference(name: "Push Press", bodyPart: "Shoulders", equipment: "Barbell"),
        ExerciseReference(name: "Reverse Pec Deck Fly", bodyPart: "Shoulders", equipment: "Machine"),
        ExerciseReference(name: "Upright Barbell Row", bodyPart: "Shoulders", equipment: "Barbell"),

        // Biceps
        ExerciseReference(name: "Dumbbell Curl", bodyPart: "Biceps", equipment: "Dumbbell"),
        ExerciseReference(name: "Standing Alternating Dumbbell Curl", bodyPart: "Biceps", equipment: "Dumbbell"),
        ExerciseReference(name: "Seated Alternating Dumbbell Curl", bodyPart: "Biceps", equipment: "Dumbbell"),
        ExerciseReference(name: "EZ-Bar Biceps Curl", bodyPart: "Biceps", equipment: "Barbell"),

        // Triceps
        ExerciseReference(name: "Tricep Pushdown", bodyPart: "Triceps", equipment: "Cable"),
        ExerciseReference(name: "Cable Triceps Extension", bodyPart: "Triceps", equipment: "Cable"),
        ExerciseReference(name: "V-Bar Triceps Pushdown", bodyPart: "Triceps", equipment: "Cable"),
        ExerciseReference(name: "Straight Bar Triceps Pushdown", bodyPart: "Triceps", equipment: "Cable"),

        // Legs
        ExerciseReference(name: "Barbell Squat", bodyPart: "Legs", equipment: "Barbell"),
        ExerciseReference(name: "Leg Press", bodyPart: "Legs", equipment: "Machine"),
        ExerciseReference(name: "Squat", bodyPart: "Legs", equipment: "Barbell"),
        ExerciseReference(name: "Deadlift", bodyPart: "Legs", equipment: "Barbell"),
        ExerciseReference(name: "Romanian Deadlift", bodyPart: "Legs", equipment: "Barbell"),
        ExerciseReference(name: "Bulgarian Split Squat", bodyPart: "Legs", equipment: "Dumbbell"),

        // Abs
        ExerciseReference(name: "Plank", bodyPart: "Abs", equipment: "Bodyweight"),
        ExerciseReference(name: "Sit-Up", bodyPart: "Abs", equipment: "Bodyweight"),
        ExerciseReference(name: "Ab Crunch Machine", bodyPart: "Abs", equipment: "Machine"),

        // Cardio
        ExerciseReference(name: "Running", bodyPart: "Cardio", equipment: "None"),
        ExerciseReference(name: "Cycling", bodyPart: "Cardio", equipment: "None"),
        ExerciseReference(name: "Rowing", bodyPart: "Cardio", equipment: "Machine"),
        ExerciseReference(name: "Rowing Machine", bodyPart: "Cardio", equipment: "Machine"),
        ExerciseReference(name: "Elliptical Trainer", bodyPart: "Cardio", equipment: "Machine"),
        ExerciseReference(name: "Indoor Cycling", bodyPart: "Cardio", equipment: "Machine"),
    ]
}
