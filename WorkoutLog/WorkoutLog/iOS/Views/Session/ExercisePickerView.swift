import SwiftUI

struct ExercisePickerView: View {
    let dataService: DataService
    let onSelect: (String, ActivityType) -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var selectedCategory: String?
    @State private var searchText = ""
    @State private var customName = ""
    @State private var showCustomForm = false

    private let categoryOrder = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Abs", "Cardio"]

    private var exercisesByCategory: [String: [ExerciseReference]] {
        dataService.exercisesByBodyPart()
    }

    private var filteredExercises: [ExerciseReference] {
        let all = dataService.allExercises()
        guard !searchText.isEmpty else { return all }
        return all.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        NavigationStack {
            Group {
                if !searchText.isEmpty {
                    searchResultsList
                } else if let category = selectedCategory {
                    exerciseList(for: category)
                } else {
                    categoryList
                }
            }
            .navigationTitle(navigationTitle)
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, prompt: "Search exercises")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .bottomBar) {
                    Button("Add Custom Exercise") {
                        showCustomForm = true
                    }
                }
            }
            .alert("Custom Exercise", isPresented: $showCustomForm) {
                TextField("Exercise name", text: $customName)
                Button("Add") {
                    let name = customName.trimmingCharacters(in: .whitespaces)
                    if !name.isEmpty {
                        let bodyPart = selectedCategory ?? "Other"
                        dataService.addCustomExercise(name: name, bodyPart: bodyPart, equipment: "Other")
                        let type: ActivityType = bodyPart == "Cardio" ? .cardio : .strength
                        onSelect(name, type)
                        dismiss()
                    }
                    customName = ""
                }
                Button("Cancel", role: .cancel) { customName = "" }
            }
        }
    }

    // MARK: - Category List

    private var categoryList: some View {
        List {
            ForEach(categoryOrder, id: \.self) { category in
                let count = exercisesByCategory[category]?.count ?? 0
                Button {
                    selectedCategory = category
                } label: {
                    HStack {
                        Image(systemName: categoryIcon(category))
                            .foregroundStyle(categoryColor(category))
                            .frame(width: 28)
                        Text(category)
                        Spacer()
                        Text("\(count)")
                            .foregroundStyle(.secondary)
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                }
                .foregroundStyle(.primary)
            }
        }
    }

    // MARK: - Exercise List for Category

    private func exerciseList(for category: String) -> some View {
        List {
            let exercises = (exercisesByCategory[category] ?? []).sorted { $0.name < $1.name }
            ForEach(exercises) { exercise in
                Button {
                    let type: ActivityType = category == "Cardio" ? .cardio : .strength
                    onSelect(exercise.name, type)
                    dismiss()
                } label: {
                    HStack {
                        Text(exercise.name)
                        Spacer()
                        Text(exercise.equipment)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(.secondary.opacity(0.12))
                            .clipShape(Capsule())
                    }
                }
                .foregroundStyle(.primary)
            }
        }
        .toolbar {
            ToolbarItem(placement: .navigation) {
                Button {
                    selectedCategory = nil
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text("Categories")
                    }
                }
            }
        }
    }

    // MARK: - Search Results

    private var searchResultsList: some View {
        List {
            ForEach(filteredExercises) { exercise in
                Button {
                    let type: ActivityType = exercise.bodyPart == "Cardio" ? .cardio : .strength
                    onSelect(exercise.name, type)
                    dismiss()
                } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(exercise.name)
                        HStack(spacing: 8) {
                            Text(exercise.bodyPart)
                            Text("·")
                            Text(exercise.equipment)
                        }
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    }
                }
                .foregroundStyle(.primary)
            }

            if filteredExercises.isEmpty {
                ContentUnavailableView("No exercises found", systemImage: "magnifyingglass",
                    description: Text("Try a different search or add a custom exercise."))
            }
        }
    }

    // MARK: - Helpers

    private var navigationTitle: String {
        if !searchText.isEmpty { return "Search" }
        return selectedCategory ?? "Select Exercise"
    }

    private func categoryIcon(_ category: String) -> String {
        switch category {
        case "Chest": return "figure.highintensity.intervaltraining"
        case "Back": return "figure.climbing"
        case "Shoulders": return "figure.arms.open"
        case "Biceps": return "dumbbell.fill"
        case "Triceps": return "figure.strengthtraining.functional"
        case "Legs": return "figure.squat"
        case "Abs": return "figure.flexibility"
        case "Cardio": return "heart.fill"
        default: return "dumbbell"
        }
    }

    private func categoryColor(_ category: String) -> Color {
        switch category {
        case "Chest": return .red
        case "Back": return .blue
        case "Shoulders": return .orange
        case "Biceps": return .purple
        case "Triceps": return .pink
        case "Legs": return .green
        case "Abs": return .yellow
        case "Cardio": return .cyan
        default: return .gray
        }
    }
}
