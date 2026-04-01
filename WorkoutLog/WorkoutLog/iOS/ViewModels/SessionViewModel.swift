import Foundation
import SwiftData
import Combine

@MainActor
final class SessionViewModel: ObservableObject {
    @Published var session: Session

    private let dataService: DataService

    init(session: Session, dataService: DataService) {
        self.session = session
        self.dataService = dataService
    }

    var isActive: Bool { session.isActive }

    var sortedActivities: [Activity] { session.sortedActivities }

    // MARK: - Session

    func finishSession() {
        dataService.endSession(session)
        objectWillChange.send()
    }

    func updateNotes(_ notes: String) {
        dataService.updateSessionNotes(session, notes: notes)
    }

    // MARK: - Activity

    func addActivity(title: String, type: ActivityType = .strength) {
        dataService.addActivity(to: session, type: type, title: title)
        objectWillChange.send()
    }

    func deleteActivity(_ activity: Activity) {
        dataService.deleteActivity(activity)
        objectWillChange.send()
    }

    // MARK: - StrengthSet

    func addSet(to activity: Activity) {
        dataService.addStrengthSet(to: activity)
        objectWillChange.send()
    }

    func updateSet(_ set: StrengthSet, weight: Double? = nil, reps: Int? = nil, isCompleted: Bool? = nil) {
        dataService.updateStrengthSet(set, weight: weight, reps: reps, isCompleted: isCompleted)
        objectWillChange.send()
    }

    func deleteSet(_ set: StrengthSet) {
        dataService.deleteStrengthSet(set)
        objectWillChange.send()
    }

    // MARK: - Effort Level

    func setEffort(for activity: Activity, level: Int) {
        dataService.setEffortLevel(for: activity, level: level)
        objectWillChange.send()
    }
}
