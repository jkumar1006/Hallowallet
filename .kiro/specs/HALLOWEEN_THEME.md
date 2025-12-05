# 🎃 Halloween Theme Feature

## Overview
Hallowallet now includes a spooky Halloween theme that can be toggled on/off throughout the entire application!

## Features

### Theme Toggle
- Located in the top navigation bar
- Click the toggle button to switch between Normal Mode 🌙 and Spooky Mode 🎃
- Theme preference is saved in localStorage and persists across sessions

### Halloween Theme Includes:

**Visual Effects:**
- Dark purple and orange gradient backgrounds
- Glowing orange and purple accents
- Floating spooky decorations (👻 🦇 🎃 🕷️ 💀)
- Smooth animations and transitions
- Glowing text effects on interactive elements

**Color Palette:**
- Primary: Orange (#ff6b35)
- Secondary: Purple (#9b4dca)
- Accent: Yellow (#ffd23f)
- Dark backgrounds with purple/orange gradients

**Themed Components:**
- All buttons get orange/purple gradients
- Input fields have purple borders with orange focus states
- Cards and panels have semi-transparent purple backgrounds
- Sidebar and navigation bars adapt to the theme
- Modal dialogs (like Add Expense) are fully themed

### CSS Classes
The theme uses custom CSS classes that automatically apply when Halloween mode is active:

- `.hw-bg-primary` - Orange gradient background
- `.hw-bg-secondary` - Purple gradient background
- `.hw-bg-card` - Semi-transparent purple card background
- `.hw-border` - Purple border
- `.hw-text-accent` - Yellow accent text
- `.hw-text-primary` - Orange text
- `.hw-btn-primary` - Orange gradient button
- `.hw-btn-secondary` - Purple outlined button
- `.hw-input` - Themed input fields

### Implementation
The theme is controlled by the `SpookyProvider` context in `src/lib/spookyTheme.tsx` and applies the `.halloween-theme` class to the root element when active. All theme-specific styles are defined in `src/app/globals.css`.

## Usage
Simply click the theme toggle button in the top navigation bar to switch between themes. The setting is automatically saved and will be remembered on your next visit!

Enjoy the spooky experience! 👻🎃
