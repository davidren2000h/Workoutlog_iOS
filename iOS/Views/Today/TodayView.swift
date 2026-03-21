import SwiftUI

struct TodayView: View {
    @StateObject private var viewModel: TodayViewModel
    @State private var selectedSession: Session?

    init(dataService: DataService) {
        _viewModel = StateObject(wrappedValue: TodayViewModel(dataService: dataService))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Header
                Text("Today")
                    .font(.largeTitle.bold())
                Text(Date.now, format: .dateTime.weekday(.wide).month(.wide).day())
                    .foregroundStyle(.secondary)
                    .font(.subheadline)

                // Active sessions
                ForEach(viewModel.activeSessions) { session in
                    activeSessionCard(session)
                }

                // Completed sessions
                if !viewModel.completedSessions.isEmpty {
                    Text("Completed")
                        .font(.headline)
                        .foregroundStyle(.secondary)
                        .padding(.top, 8)

                    ForEach(viewModel.completedSessions) { session in
                        completedSessionCard(session)
                    }
                }

                // Empty state
                if viewModel.activeSessions.isEmpty && viewModel.completedSessions.isEmpty {
                    VStack(spacing: 8) {
                        Text("No workouts today")
                            .font(.title3.bold())
                        Text("Start a new workout to get going!")
                            .foregroundStyle(.secondary)
                            .font(.subheadline)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
                }

                // Start button
                Button {
                    selectedSession = viewModel.createBlankSession()
                } label: {
                    Text("Start Blank Workout")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
            .padding()
        }
        .navigationDestination(item: $selectedSession) { session in
            SessionDetailView(session: session, dataService: viewModel.dataService)
        }
        .onAppear {
            viewModel.loadSessions()
        }
    }

    // MARK: - Cards

    private func activeSessionCard(_ session: Session) -> some View {
        Button {
            selectedSession = session
        } label: {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("In Progress")
                        .font(.subheadline.bold())
                        .foregroundStyle(.green)
                    Spacer()
                    Text("\(session.activities.count) exercises")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                ForEach(session.sortedActivities) { activity in
                    HStack {
                        Text(activity.title)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        if activity.type == .strength {
                            let done = activity.strengthSets.filter(\.isCompleted).count
                            let total = activity.strengthSets.count
                            Text("· \(done)/\(total) sets")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
    }

    private func completedSessionCard(_ session: Session) -> some View {
        HStack {
            Button {
                selectedSession = session
            } label: {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(session.sortedActivities.map(\.title).joined(separator: ", "))
                            .font(.subheadline.bold())
                            .lineLimit(1)
                        Spacer()
                        if let duration = session.duration {
                            Text(DurationFormatter.format(duration))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    Text("\(session.activities.count) exercises")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .buttonStyle(.plain)

            Spacer()

            Button(role: .destructive) {
                viewModel.deleteSession(session)
            } label: {
                Text("Delete")
                    .font(.caption)
            }
            .buttonStyle(.borderless)
        }
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

}
