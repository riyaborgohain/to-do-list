# Simple To-Do List App

A lightweight, responsive To-Do List application built with pure HTML, CSS, and modern JavaScript, featuring a soft `#F3F1D9` card palette, stroke-free minimalist design, Open Sans typography, and a mobile bottom navigation bar.

## Features

- **Soft `#F3F1D9` Palette**: Warm pastel card aesthetic (`#F3F1D9`) without harsh stroke outlines for a seamless modern look.
- **Clean Header**: Minimalist title bar with live task counters, keeping all menu access conveniently housed in the bottom navigation.
- **Bottom Navigation Bar**: Fixed mobile-friendly bottom bar featuring:
  - 🏠 **Home** (Left): Resets active filters and smoothly scrolls to top.
  - 📅 **Calendar**: Date filtering dialog with presets (*Today*, *Tomorrow*, *Upcoming*, *Overdue*) or specific date picker.
  - ➕ **Create Task** (Center): Elevated circular button to quickly add new tasks.
  - 🔍 **Search**: Dedicated search modal to find tasks in real-time by title, date, or status.
  - ☰ **Menu** (Right): Slide-in navigation drawer with date views and task management actions.
- **Single Card Grouping**: Each date category (e.g. *Today*, *Tomorrow*, *Upcoming*, *Overdue*) is presented as **one single card** with multiple tasks organized inside as checklist rows.
- **Interactive Checklists**: Checkboxes with mint green checkmarks and strikethrough styling.
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
