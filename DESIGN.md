---
name: Inso Code Visual System
version: 1.0.0
tokens:
  colors:
    primary:
      value: "#000000"
      description: "Default primary accent color for active buttons and actions."
    primary-dark:
      value: "#ffffff"
      description: "Default primary accent color for active buttons in dark mode."
    background:
      value: "#F4F4F6"
      description: "App body background color."
    background-dark:
      value: "#0d1117"
      description: "App body background color in dark mode."
    card:
      value: "#ffffff"
      description: "Surface panels and containers color."
    card-dark:
      value: "#161b22"
      description: "Surface panels and containers color in dark mode."
    border:
      value: "rgba(229, 231, 235, 0.5)"
      description: "Standard thin gray borders."
    border-dark:
      value: "#1f2937"
      description: "Standard thin borders in dark mode."
    text-muted:
      value: "#9ca3af"
      description: "Muted placeholder and metadata text."
  typography:
    font-family: "Inter, system-ui, -apple-system, sans-serif"
    sizes:
      title: "1.875rem"
      body: "0.875rem"
      code: "0.75rem"
      metadata: "0.625rem"
  spacing:
    container-padding: "1.5rem"
    item-gap: "0.75rem"
  shapes:
    radius-panel: "1.5rem"
    radius-button: "0.75rem"
---

# DESIGN.md — Inso Code Visual System Contract

This document acts as the visual system contract and design token repository for the Inso Code platform. All frontend user interfaces (chat windows, settings dashboards, file managers, and serverless center panes) must map their styling configurations to the tokens defined in the YAML front matter.

## Overview
Inso Code targets a clean, minimal, premium design aesthetic. We enforce:
*   **Curated Palettes**: Lean heavily on pure contrast ratios, using crisp off-whites, solid black accents, and deep charcoal slate grays instead of saturated, generic primary colors.
*   **Rounded Geometry**: Card surfaces and interactive dialog buttons must have unified rounded shapes (radii of `24px` for panels and `12px` for buttons) to convey modern premium quality.
*   **Micro-Animations**: Hover actions must transition smoothly over `200ms` with active fade-in slides to make the interface feel alive.

## Colors
We enforce high-contrast layouts supporting a native system-aware light/dark mode switch. Ensure standard borders utilize translucent alphas (`rgba(..., 0.5)`) to blend seamlessly with parent layouts.

## Typography
Our primary font face is `Inter` (or browser fallback sans-serif), scaled to compact developer layouts. Monospace code snippets use standard code sizing (`12px`) for optimal screen space utilization.

## Components
### Buttons
*   Should use shape token `shapes.radius-button` (`12px`).
*   Active state matches `colors.primary`.
*   Support smooth background/text color transitions on hover.

### Scrollbars
*   Keep scrollbar sizing narrow and border-free.
*   Thumb colors should blend with the background using transparent grey fills.
