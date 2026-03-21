import SwiftUI
import SwiftData

@main
struct WorkoutLogApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Session.self, Activity.self, StrengthSet.self])
    }
}

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        NavigationStack {
            TodayView(dataService: DataService(modelContext: modelContext))
        }
    }
}
