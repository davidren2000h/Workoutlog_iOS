import Foundation
import SwiftData

@Model
final class ExerciseReference {
    var name: String
    var bodyPart: String
    var equipment: String
    var isCustom: Bool

    init(name: String, bodyPart: String, equipment: String, isCustom: Bool = false) {
        self.name = name
        self.bodyPart = bodyPart
        self.equipment = equipment
        self.isCustom = isCustom
    }
}
