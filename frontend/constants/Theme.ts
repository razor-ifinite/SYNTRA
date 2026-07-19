export const SYNTRA_THEME = {
  colors: {
    // Backgrounds
    background:     '#FFFFFF', // Pure White — main app canvas
    backgroundAlt:  '#F5F5F5', // Light Grey — used on auth screens top section

    // Surface
    surface:        '#7C3AED', // Brand Purple — cards, panels, sheets

    // Brand
    primary:        '#7C3AED', // Purple — primary buttons, active tab, CTA
    primaryDark:    '#5B21B6', // Darker Purple — pressed states on buttons

    // Text
    textPrimary:    '#000000', // Black — main text on white backgrounds
    textOnPurple:   '#FFFFFF', // White — text on purple surfaces
    textOnLight:    '#000000', // Black — text on white backgrounds
    textMuted:      '#A0A0A0', // Muted grey — placeholders, subtitles

    // Semantic
    success:        '#FFFFFF', // Flat Gold — completed milestones/goals (Now White)
    danger:         '#EF4444', // Flat Red — failures, overdue, alerts

    // Borders & Dividers
    border:         '#2D2D2D', // Subtle dark border on black backgrounds
    borderPurple:   '#9F67FF', // Light purple border on purple surfaces

    // Pure
    white:          '#FFFFFF',
    black:          '#000000',
  }
} as const;
