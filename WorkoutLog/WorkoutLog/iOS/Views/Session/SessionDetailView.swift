import SwiftUI

struct SessionDetailView: View {
    @StateObject private var viewModel: SessionViewModel
    @State private var showExercisePicker = false
    @State private var exerciseName = ""
    @Environment(\.dismiss) private var dismiss

    init(session: Session, dataService: DataService) {
        _viewModel = StateObject(wrappedValue: SessionViewModel(session: session, dataService: dataService))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Timer / Status
                if viewModel.isActive {
                    Text("Started \(viewModel.session.startTime, format: .dateTime.hour().minute())")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity)
                } else if let duration = viewModel.session.duration {
                    Text("Completed · \(DurationFormatter.format(duration))")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity)
                }

                // Activities
                ForEach(viewModel.sortedActivities) { activity in
                    activityCard(activity)
                }

                // Add Exercise
                if viewModel.isActive {
                    Button {
                        showExercisePicker = true
                    } label: {
                        Text("Add Exercise")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                }

                // Notes
                VStack(alignment: .leading, spacing: 4) {
                    Text("Notes")
                        .font(.subheadline.bold())
                    TextField("Session notes...", text: Binding(
                        get: { viewModel.session.notes },
                        set: { viewModel.updateNotes($0) }
                    ), axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(3...6)
                }
                .padding()
                .background(.regularMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .padding()
        }
        .navigationTitle("Workout")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if viewModel.isActive {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Finish") {
                        viewModel.finishSession()
                    }
                    .bold()
                    .foregroundStyle(.green)
                }
            }
        }
        .alert("Add Exercise", isPresented: $showExercisePicker) {
            TextField("Exercise name", text: $exerciseName)
            Button("Add") {
                let name = exerciseName.trimmingCharacters(in: .whitespaces)
                if !name.isEmpty {
                    viewModel.addActivity(title: name)
                }
                exerciseName = ""
            }
            Button("Cancel", role: .cancel) {
                exerciseName = ""
            }
        }
    }

    // MARK: - Activity Card

    private func activityCard(_ activity: Activity) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                Text(activity.title)
                    .font(.headline)
                Text("Strength")
                    .font(.caption)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(.blue.opacity(0.15))
                    .clipShape(Capsule())
                Spacer()
                if viewModel.isActive {
                    Button(role: .destructive) {
                        viewModel.deleteActivity(activity)
                    } label: {
                        Image(systemName: "xmark")
                            .font(.caption)
                    }
                    .buttonStyle(.borderless)
                }
            }

            // Column headers
            HStack {
                Text("#")
                    .frame(width: 24)
                Text("Weight")
                    .frame(width: 70)
                Text("Reps")
                    .frame(width: 70)
                Spacer()
            }
            .font(.caption)
            .foregroundStyle(.secondary)

            // Sets
            ForEach(activity.sortedSets) { set in
                setRow(set, in: activity)
            }

            // Effort level
            effortSelector(activity)

            // Add Set
            if viewModel.isActive {
                Button {
                    viewModel.addSet(to: activity)
                } label: {
                    Label("Add Set", systemImage: "plus")
                        .font(.subheadline)
                }
                .buttonStyle(.borderless)
            }
        }
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Set Row

    private func setRow(_ set: StrengthSet, in activity: Activity) -> some View {
        HStack {
            Text("\(set.setIndex + 1)")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .frame(width: 24)

            TextField("0", value: Binding(
                get: { set.weight },
                set: { viewModel.updateSet(set, weight: $0) }
            ), format: .number)
            .textFieldStyle(.roundedBorder)
            .keyboardType(.decimalPad)
            .frame(width: 70)

            TextField("0", value: Binding(
                get: { set.reps },
                set: { viewModel.updateSet(set, reps: $0) }
            ), format: .number)
            .textFieldStyle(.roundedBorder)
            .keyboardType(.numberPad)
            .frame(width: 70)

            Button {
                viewModel.updateSet(set, isCompleted: !set.isCompleted)
            } label: {
                Image(systemName: set.isCompleted ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(set.isCompleted ? .green : .secondary)
            }
            .buttonStyle(.borderless)

            Spacer()

            if viewModel.isActive {
                Button(role: .destructive) {
                    viewModel.deleteSet(set)
                } label: {
                    Image(systemName: "trash")
                        .font(.caption)
                }
                .buttonStyle(.borderless)
            }
        }
    }

    // MARK: - Effort Selector

    private func effortSelector(_ activity: Activity) -> some View {
        HStack {
            Text("Effort")
                .font(.caption)
                .foregroundStyle(.secondary)
            effortButton(activity: activity, level: 1, label: "Easy")
            effortButton(activity: activity, level: 2, label: "Medium")
            effortButton(activity: activity, level: 3, label: "Hard")
        }
        .padding(.top, 4)
    }

    // MARK: - Helpers

    private func effortButton(activity: Activity, level: Int, label: String) -> some View {
        let isSelected = activity.strengthSets.first?.rpe == level
        return Button {
            viewModel.setEffort(for: activity, level: level)
        } label: {
            Text(label)
                .font(.caption)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(isSelected ? effortColor(level).opacity(0.2) : .clear)
                .clipShape(Capsule())
                .overlay(Capsule().stroke(effortColor(level), lineWidth: 1))
        }
        .buttonStyle(.borderless)
        .foregroundStyle(effortColor(level))
    }

    private func effortColor(_ level: Int) -> Color {
        switch level {
        case 1: .green
        case 2: .orange
        case 3: .red
        default: .secondary
        }
    }

}
