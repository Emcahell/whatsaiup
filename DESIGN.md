---
name: Organic Pixel
colors:
  surface: '#fafaf3'
  surface-dim: '#dbdad4'
  surface-bright: '#fafaf3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ed'
  surface-container: '#efeee7'
  surface-container-high: '#e9e8e2'
  surface-container-highest: '#e3e3dc'
  on-surface: '#1b1c18'
  on-surface-variant: '#434843'
  inverse-surface: '#30312c'
  inverse-on-surface: '#f2f1ea'
  outline: '#737873'
  outline-variant: '#c3c8c1'
  surface-tint: '#4f6354'
  primary: '#384b3d'
  on-primary: '#ffffff'
  primary-container: '#4f6354'
  on-primary-container: '#c8decb'
  inverse-primary: '#b6ccba'
  secondary: '#4f6354'
  on-secondary: '#ffffff'
  secondary-container: '#d1e8d5'
  on-secondary-container: '#55695a'
  tertiary: '#4c4634'
  on-tertiary: '#ffffff'
  tertiary-container: '#645e4a'
  on-tertiary-container: '#e1d8bf'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e8d5'
  primary-fixed-dim: '#b6ccba'
  on-primary-fixed: '#0d1f14'
  on-primary-fixed-variant: '#384b3d'
  secondary-fixed: '#d1e8d5'
  secondary-fixed-dim: '#b6ccba'
  on-secondary-fixed: '#0c1f14'
  on-secondary-fixed-variant: '#374b3d'
  tertiary-fixed: '#ece2c9'
  tertiary-fixed-dim: '#cfc6ae'
  on-tertiary-fixed: '#201b0c'
  on-tertiary-fixed-variant: '#4c4634'
  background: '#fafaf3'
  on-background: '#1b1c18'
  surface-variant: '#e3e3dc'
typography:
  display-lg:
    fontFamily: Roboto Flex
    fontSize: 44px
    fontWeight: '600'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Roboto Flex
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  title-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 20px
  gutter-mobile: 12px
---

## Brand & Style

This design system is rooted in the **Modern Corporate** aesthetic with heavy influence from Material You’s "Personal" philosophy. The brand personality is calm, professional, and inherently intuitive, prioritizing user comfort through soft color transitions and generous whitespace. It aims to evoke a sense of organic technology—digital interfaces that feel as approachable and tactile as physical objects. 

The visual language focuses on high-quality typography, a harmonized natural palette, and a "squircle-first" geometry. It targets users who appreciate a focused, clutter-free environment that feels premium yet friendly.

## Colors

The palette is a sophisticated blend of botanical greens and mineral neutrals. 
- **Primary:** A deep Sage used for primary actions and high-emphasis text.
- **Secondary:** A soft Mint used for container backgrounds and tonal buttons.
- **Tertiary:** A warm Sand/Beige for subtle highlights and surface variations.
- **Neutral:** A warm-white "Paper" tone for the main background to reduce eye strain.

Color application should follow a tonal logic: rather than high-contrast blacks, use deep greens for text to maintain the "calm" brand pillar. Backgrounds should utilize subtle shifts between the neutral and surface-sage tones to define content areas.

## Typography

This design system utilizes **Roboto Flex** for headlines to mimic the adaptive nature of Pixel interfaces, providing a clean, slightly mechanical but friendly structure. **Inter** is used for all functional body and label text due to its exceptional legibility at small sizes and its systematic, neutral character.

- Use variable weights in Roboto Flex to create clear hierarchy.
- Body text should always use a slightly softened color (Deep Sage-Gray) rather than pure #000000 to maintain the "organic" feel.
- Maintain generous line heights to ensure a breezy, professional reading experience.

## Layout & Spacing

The system employs a **Fluid Grid** model designed specifically for mobile breakpoints. The foundational rhythm is based on a 4px baseline grid.

- **Margins:** 20px side margins provide a breathing room that feels more spacious than standard 16px margins.
- **Vertical Spacing:** Content blocks are separated by 24px (lg) or 32px (xl) to emphasize the minimalist, clean mood.
- **Internal Padding:** Cards and containers use 16px (md) or 20px padding to ensure touch targets are accessible and content feels uncrowded.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** supplemented by **Ambient Shadows**. Instead of traditional drop shadows, use diffused, low-opacity shadows with a slight tint of the primary Sage color to prevent the UI from looking "dirty."

- **Level 0 (Surface):** The neutral beige/white background.
- **Level 1 (Card):** Surface-sage background with no shadow, defined by a subtle 1px inner stroke or a slight color shift.
- **Level 2 (Floating):** Primary background with a soft, 12px blur shadow (4% opacity) used for elevated cards or navigation bars.
- **Level 3 (Overlay):** Used for modals and menus, featuring a more pronounced shadow and a background blur (12px) on the elements behind it.

## Shapes

The shape language is defined by large, friendly radii. The system avoids sharp corners entirely to maintain its "calm and intuitive" persona.

- **Standard Components:** 16px (1rem) radius (e.g., small cards, input fields).
- **Large Components:** 28px (1.75rem) radius (e.g., main feature cards, modals).
- **Interactive Elements:** Fully pill-shaped for buttons and chips to signify clickability.
- **Iconography:** Use **Material Symbols (Rounded)** with a weight of 300 to match the clean typography.

## Components

### Buttons
- **Primary:** Pill-shaped, Primary Sage background with white text. High-emphasis.
- **Secondary:** Pill-shaped, Mint background with Primary Sage text. Low-emphasis.
- **Tertiary:** Text-only with an icon, used for less frequent actions.

### Input Fields
- Filled style using a very light Sage tint and a 16px corner radius.
- The active state is indicated by a 2px Primary Sage bottom border and a subtle scale animation of the label.

### Cards
- Container backgrounds should use the Secondary or Neutral tones.
- Radius is fixed at 24px for main cards. 
- Use subtle shadows only when the card needs to be the primary focus of the screen.

### Chips
- Used for filtering and tags. Pill-shaped, 32px height. 
- Selected state: Primary Sage background. 
- Unselected state: Thin Sage stroke with transparent background.

### Navigation
- A bottom navigation bar using a glassmorphism effect (80% opacity with backdrop blur) to allow content to peek through while scrolling.
- Active states use a "pill" highlight behind the icon, consistent with the Pixel interface.