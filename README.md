# Simple To-Do List App

A lightweight, responsive To-Do List application built with pure HTML, CSS, and modern JavaScript, featuring a butter yellow palette, Open Sans typography, and an app-like bottom navigation bar.

## Features

- **Clean Minimalist Home Screen**: An uncluttered main view displaying only your task overview, status filters, and grouped task cards, free of inline search and calendar bars.
- **Bottom Navigation Bar**: A fixed mobile-friendly bottom bar featuring:
  - 🏠 **Home** (Left): Resets all active filters and scrolls smoothly to the top.
  - 📅 **Calendar**: Opens the date filtering dialog with presets (*Today*, *Tomorrow*, *Upcoming*, *Overdue*) or specific date picker.
  - ➕ **Create Task** (Center): Prominently elevated circular button to quickly add new tasks.
  - 🔍 **Search**: Opens a dedicated search dialog to quickly find tasks by title, date, or status.
  - ☰ **Menu** (Right): Opens the slide-in navigation drawer with date views and task management actions.
- **Single Card Grouping**: Each date category (e.g. *Today*, *Tomorrow*, *Upcoming*, *Overdue*) is presented as **one single butter yellow card** with multiple tasks organized inside as checklist rows.
- **Interactive Checklists**: Checkboxes with mint green checkmarks and strikethrough styling inspired by modern task boards.
- **Progress Tracking**: Card headers show completed vs. total counts (e.g. *3 of 9 Tasks*).
- **Task Statuses**: Organize tasks by `Unfinished`, `Paused`, and `Completed`.
- **Counters**: View total task count as well as breakdown by status in real-time.
- **Quick Status Filters**: One-tap filter pills (`All`, `Unfinished`, `Paused`, `Completed`).
- **Edit & Quick-Change**: Modify task titles, due dates, or switch statuses on the fly.
- **Delete Confirmation**: Confirmation prompt before deleting any task.
- **Local Persistence**: Stored via `localStorage` in the browser — persists across refreshes.
- **Mobile-Responsive**: Fully optimized for mobile screens, tablets, and desktops.
- **Zero Dependencies**: Runs directly in any modern web browser without a server or backend.

## Getting Started

Simply open `index.html` in your web browser.
