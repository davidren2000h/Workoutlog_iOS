import Foundation
import SwiftData

enum ActivityType: String, Codable {
    case strength = "Strength"
    case cardio = "Cardio"
    case skill = "Skill"
}

@Model
final class Activity {
    var type: ActivityType
    var title: String
    var order: Int
    var notes: String

    var session: Session?

    @Relationship(deleteRule: .cascade, inverse: \StrengthSet.activity)
    var strengthSets: [StrengthSet] = []

    init(type: ActivityType = .strength, title: String, order: Int, notes: String = "") {
        self.type = type
        self.title = title
        self.order = order
        self.notes = notes
    }

    var sortedSets: [StrengthSet] {
        strengthSets.sorted { $0.setIndex < $1.setIndex }
    }
}
