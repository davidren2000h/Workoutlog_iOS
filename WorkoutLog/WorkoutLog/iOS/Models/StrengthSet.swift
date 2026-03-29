import Foundation
import SwiftData

@Model
final class StrengthSet {
    var setIndex: Int
    var weight: Double
    var reps: Int
    var rpe: Int?
    var restSeconds: Int?
    var tempo: String?
    var isCompleted: Bool

    var activity: Activity?

    init(
        setIndex: Int,
        weight: Double = 0,
        reps: Int = 0,
        rpe: Int? = nil,
        restSeconds: Int? = nil,
        tempo: String? = nil,
        isCompleted: Bool = false
    ) {
        self.setIndex = setIndex
        self.weight = weight
        self.reps = reps
        self.rpe = rpe
        self.restSeconds = restSeconds
        self.tempo = tempo
        self.isCompleted = isCompleted
    }
}
