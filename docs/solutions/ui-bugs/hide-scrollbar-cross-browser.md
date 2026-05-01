---
title: Hide a scrollbar in all browsers (Firefox + WebKit)
category: ui-bugs
date: 2026-05-01
tags:
  - css
  - cross-browser
  - scrollbar
  - tailwind
  - webkit
  - firefox
component: FeedOverlay
problem_type: ui_bug
---

## Problem

A vertical bar appeared on the right edge of an `overflow-y-auto` container in Chrome/Safari, even though the inline style `scrollbarWidth: 'none'` was set. Against a black background it read as a thin black stripe, breaking the visual alignment of the surrounding grid.

## Root cause

`scrollbar-width: none` is a Firefox-only property. WebKit browsers (Chrome, Safari, Edge) ignore it and still render the platform scrollbar. To hide a scrollbar in WebKit you must target the `::-webkit-scrollbar` pseudo-element with `display: none` (or `width: 0`).

This is not surfaceable from inline `style={{}}` in React because pseudo-elements cannot be expressed via inline style. They require a real stylesheet rule.

## Solution

Add a global utility class that combines both rules, and apply it alongside the existing inline Firefox style.

`src/index.css`:

```css
@import "tailwindcss";

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
```

Component usage:

```tsx
<div
  className="flex-1 overflow-y-auto p-2.5 no-scrollbar"
  style={{ scrollbarWidth: 'none' }}  // Firefox
>
  {/* scrollable content */}
</div>
```

The `style` prop handles Firefox; the class handles WebKit. Both are needed for full cross-browser coverage.

## Prevention

- Whenever a layout requires a hidden scrollbar, reach for both `scrollbar-width: none` (Firefox) and `::-webkit-scrollbar { display: none }` (WebKit). One without the other will silently fail in roughly half your users' browsers.
- Don't try to express `::-webkit-scrollbar` via React inline `style` — pseudo-elements only work from a real stylesheet. Tailwind v4 keeps `index.css` lightweight, so adding a one-line utility class is the path of least resistance.
- When debugging "thin vertical artifacts" on dark backgrounds, suspect the scrollbar before suspecting borders, padding, or shadows.

## Verification

Open the page in both Firefox and a WebKit browser (Safari or Chrome). The scroll container should remain scrollable on hover/wheel, with no visible track or thumb in either browser.
