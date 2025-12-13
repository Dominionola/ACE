# ACE Project Style Guide

> [!NOTE]
> This document outlines the official design system for the ACE application. All new components and pages should adhere to these rules to maintain consistency.

## 1. Color Palette

The color system is built on a "Dark Academia" aesthetic, pairing warm cream tones with deep academic blues.

### Primary Colors
- **Ace Blue** (`var(--color-ace-blue)` / `#0A2342`): Primary text, headings, and main brand color. Deep and authoritative.
- **Ace Light** (`var(--color-ace-light)` / `#2C4A75`): Secondary accents, lighter text variants.
- **Ace Accent** (`var(--color-ace-accent)` / `#3B82F6`): Interactive elements, focus states.

### Background Colors
- **Cream 50** (`var(--color-cream-50)` / `#FDFBF7`): Main page background.
- **Cream 100** (`var(--color-cream-100)` / `#F7F4EC`): Secondary backgrounds, cards.
- **Cream 200** (`var(--color-cream-200)` / `#F0EAD6`): Accents, borders.
- **Cream 900** (`var(--color-cream-900)` / `#5C5446`): Contrast text on light backgrounds.

## 2. Typography

The typography pairs a classic serif for personality with a clean sans-serif for readability.

### Font Families
- **Serif** (`font-serif` / **Newsreader**): Used for Headings (H1-H4), quotes, and large display text.
  - *Usage*: `className="font-serif"`
- **Sans** (`font-sans` / **Inter**): Used for body text, UI labels, buttons, and navigation.
  - *Usage*: `className="font-sans"`

### Text Styles
- **Headings**: `font-serif text-ace-blue`.
  - H1: `text-5xl md:text-7xl`
  - H2: `text-4xl md:text-5xl`
  - H3: `text-2xl`
- **Body**: `font-sans text-ace-blue/70 leading-relaxed`.
- **Labels**: `font-sans text-xs font-bold uppercase tracking-widest`.
- **Italic Emphasis**: Use `italic` with `font-serif` for emphasis within headings.

## 3. UI Components

> [!TIP]
> **Component Library**: Use **shadcn/ui** as the base for all new interactive components. Customize the base components using the design tokens defined below (colors, fonts, rounded corners) to match the project's aesthetic.

### Buttons
- **Primary**: Rounded full, Ace Blue background, White text.
  ```tsx
  <button className="px-8 py-4 bg-ace-blue text-white rounded-full font-medium hover:bg-ace-light transition-all shadow-lg hover:shadow-xl">
    Action
  </button>
  ```
- **Secondary**: Rounded full, transparent background, border.
  ```tsx
  <button className="px-8 py-4 bg-transparent border border-ace-blue/20 text-ace-blue rounded-full font-medium hover:bg-ace-blue/5 transition-all">
    Secondary
  </button>
  ```

### Cards
- **Standard Card**: White background, rounded-3xl, subtle border, shadow on hover.
  ```tsx
  <div className="bg-white p-8 rounded-3xl border border-ace-blue/10 shadow-sm hover:shadow-xl transition-all duration-300">
    Content
  </div>
  ```

### Badges / Pills
- **Standard**: Rounded-full, light background, colored text.
  ```tsx
  <div className="px-3 py-1 bg-ace-blue/5 text-ace-blue text-xs font-bold rounded-full uppercase tracking-wide">
    Label
  </div>
  ```

## 4. Animations

The project uses a set of custom CSS animations defined in `globals.css`.

- **Fade In Up** (`animate-fade-in-up`): Slide up and fade in for main content.
- **Blob** (`animate-blob`): Slow, morphing background shapes.
- **Subtle Scale** (`animate-subtle-scale`): Slow breathing effect for background images.
- **Marquee** (`animate-marquee`): Continuous horizontal scrolling.
- **Float** (`animate-float`): Gentle vertical floating for cards/elements.

## 5. Layout Rules

- **Max Width**: `max-w-7xl mx-auto` for main containers.
- **Padding**: `px-6` horizontal padding for mobile responsiveness.
- **Section Spacing**: `py-24 md:py-32` for ample vertical breathing room.
- **Border Radius**: `rounded-3xl` for cards, `rounded-full` for buttons.

---

### Implementation Note
All styles are implemented via Tailwind CSS v4 in `app/globals.css`. Font families are loaded via `next/font/google` in `app/layout.tsx`.
