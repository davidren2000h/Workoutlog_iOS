3/31/2026 Reqeust to Copilot
The current exercise icons are not accurate.
I want to assign a more representative icon for each muscle group:
Chest → bench press icon
Back → pull-up icon
Biceps → dumbbell curl icon
Triceps → triceps extension or pushdown icon
Legs → squat or leg press icon
Abs → sit-up or crunch icon
Please update the icon mapping so each exercise category shows a clear and intuitive icon.
Use a consistent icon style (e.g. SF Symbols or a single icon set), and make sure the icons render correctly in the UI.
4/1/2026 Copilot Response
The icons are SF Symbols — they're built into iOS, not separate image files. No assets to add. They're defined in the categoryIcon() function in ExercisePickerView.swift:174-186:
case "Chest": return "figure.highintensity.intervaltraining"
case "Back": return "figure.climbing"
case "Shoulders": return "figure.arms.open"
case "Biceps": return "dumbbell.fill"
case "Triceps": return "figure.strengthtraining.functional"
case "Legs": return "figure.squat"
case "Abs": return "figure.flexibility"
case "Cardio": return "heart.fill"
case "Chest": return "figure.highintensity.intervaltraining"case "Back": return "figure.climbing"case "Shoulders": return "figure.arms.open"case "Biceps": return "dumbbell.fill"case "Triceps": return "figure.strengthtraining.functional"case "Legs": return "figure.squat"case "Abs": return "figure.flexibility"case "Cardio": return "heart.fill"
You can browse and verify all available SF Symbols using Apple's free SF Symbols app on your Mac (download from developer.apple.com/sf-symbols). Are any of them not rendering on your device? If so, some names may need to be adjusted based on your iOS deployment target.
