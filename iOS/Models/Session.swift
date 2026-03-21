import Foundation
import SwiftData

@Model
final class Session {
    var date: String          // YYYY-MM-DD
    var startTime: Date
    var endTime: Date?
    var duration: Int?        // seconds
    var notes: String

    @Relationship(deleteRule: .cascade, inverse: \Activity.session)
    var activities: [Activity] = []

    init(date: String, startTime: Date = .now, notes: String = "") {
        self.date = date
        self.startTime = startTime
        self.notes = notes
    }

    var isActive: Bool { endTime == nil }

    var sortedActivities: [Activity] {
        activities.sorted { $0.order < $1.order }
    }
}
