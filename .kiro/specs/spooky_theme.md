---
title: Halloween Spooky Theme
status: implemented
priority: medium
---

# Halloween Spooky Theme

## Overview
A festive Halloween-themed UI with spooky animations, dark aesthetics, and playful interactions.

## Theme Features

### Color Palette
- Primary: Dark slate (#0f172a, #1e293b)
- Accent: Orange (#f97316, #ea580c)
- Highlights: Purple (#a855f7, #9333ea)
- Text: White/Slate for contrast

### Visual Elements
- 🎃 Pumpkin icons
- 👻 Ghost animations
- 🦇 Bat decorations
- 🕷️ Spider web patterns
- 💀 Skull motifs

### Animations
```css
/* Floating ghosts */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Glowing effects */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px orange; }
  50% { box-shadow: 0 0 20px orange; }
}

/* Spooky shake */
@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
```

### Interactive Elements
- Hover effects with glow
- Click animations with shake
- Smooth transitions
- Particle effects on actions

## Implementation

### CSS Classes
```css
.hw-bg-card - Spooky card background
.hw-border - Orange/purple borders
.hw-btn-primary - Glowing primary button
.hw-btn-secondary - Ghost secondary button
.hw-input - Dark themed inputs
.hw-text-glow - Glowing text effect
```

### Components
- `src/app/globals.css` - Theme styles
- All components use `hw-*` classes

## Toggle Feature
- Theme switcher in header
- Persists in localStorage
- Smooth transition between themes
- Default: Spooky theme enabled

## Future Enhancements
- More seasonal themes (Christmas, Diwali)
- Custom theme builder
- Theme marketplace
- Animated backgrounds
- Sound effects
