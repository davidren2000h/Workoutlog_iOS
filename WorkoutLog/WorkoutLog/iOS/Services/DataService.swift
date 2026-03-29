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

    // MARK: - Helpers

    private func save() {
        try? modelContext.save()
    }
}
