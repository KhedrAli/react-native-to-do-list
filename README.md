# ✅ ToDoList99

A local-first task management mobile application built with **React Native**, **Expo**, and **TypeScript**, designed for fast daily task organization, instant offline persistence, and smooth **RTL (Arabic)** and **LTR (English)** support.

---

## ✨ Key Features

- **⚡ Local-First Persistence (`AsyncStorage`)**: All tasks, categories, and preferences are stored locally on the device for instant load times and full offline reliability without external database dependencies.
- **🎯 Priorities & Categories**: Organize tasks by priority levels and custom categories with dedicated modals (`AddTaskModal`, `QuickAddModal`, `IconPickerModal`) and structured cards (`TaskCard`).
- **🔁 Recurring Tasks**: Create repeating schedules effortlessly using built-in recurrence logic (`recurrence.ts`) and formatted dates (`dateFormat.ts`).
- **📊 Progress & Analytics**: Track completion milestones and productivity metrics across dedicated screens (`ProgressScreen`, `AnalyticsScreen`, `StatCharts.tsx`).
- **🌐 Bilingual & RTL Ready**: Switch seamlessly between English (LTR) and Arabic (RTL) via `LanguageContext` and translation dictionaries (`i18n/en.json`, `i18n/ar.json`), paired with customizable themes (`ThemeContext`, `themes.ts`).
- **📱 Clean Navigation & Safe Area Handling**: Structured navigation (`AppNavigator.tsx`) and safe-area guards (`safeAreaGuard.ts`) for consistent layouts across screen sizes.

---

## 🛠️ Tech Stack

- **Framework:** React Native + Expo
- **Language:** TypeScript
- **State & Context:** React Context API (`TaskContext`, `ThemeContext`, `LanguageContext`)
- **Local Storage:** `@react-native-async-storage/async-storage`
- **Localization:** Custom i18n JSON files (`en.json`, `ar.json`) with RTL support

---

## 📂 Project Structure

```text
ToDoList/
├── App.tsx
├── app.json
├── eas.json
└── src/
    ├── components/     # AddTaskModal, QuickAddModal, IconPickerModal, TaskCard, StatCharts
    ├── constants/      # categories.ts, icons.ts, themes.ts
    ├── context/        # LanguageContext.tsx, TaskContext.tsx, ThemeContext.tsx
    ├── i18n/           # ar.json, en.json
    ├── navigation/     # AppNavigator.tsx
    ├── screens/        # TasksScreen, ProgressScreen, AnalyticsScreen, SettingsScreen
    ├── types/          # task.ts
    └── utils/          # dateFormat.ts, recurrence.ts, safeAreaGuard.ts, storage.ts


Developed by Khedr Ali (@KhedrAli)
