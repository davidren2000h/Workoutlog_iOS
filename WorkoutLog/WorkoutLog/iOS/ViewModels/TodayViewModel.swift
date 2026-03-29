import Foundation
import SwiftData
import Combine

@MainActor
final class TodayViewModel: ObservableObject {
    @Published var activeSessions: [Session] = []
    @Published var completedSessions: [Session] = []

    let dataService: DataService

    init(dataService: DataService) {
        self.dataService = dataService
        loadSessions()
    }

    func loadSessions() {
        let today = Self.todayString()
        let sessions = dataService.sessionsForDate(today)
        activeSessions = sessions.filter { $0.isActive }
        completedSessions = sessions.filter { !$0.isActive }
    }

    func createBlankSession() -> Session {
        let session = dataService.createSession(date: Self.todayString())
        loadSessions()
        return session
    }

    func deleteSession(_ session: Session) {
        dataService.deleteSession(session)
        loadSessions()
    }

    private static func todayString() -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: .now)
    }
}
