---
name: Nocturnal Tactile Glass
colors:
  surface: '#0c160e'
  surface-dim: '#0c160e'
  surface-bright: '#323c32'
  surface-container-lowest: '#071009'
  surface-container-low: '#141e16'
  surface-container: '#18221a'
  surface-container-high: '#222c24'
  surface-container-highest: '#2d372e'
  on-surface: '#dae6d8'
  on-surface-variant: '#b9cbb9'
  inverse-surface: '#dae6d8'
  inverse-on-surface: '#29332a'
  outline: '#849585'
  outline-variant: '#3b4b3d'
  surface-tint: '#00e479'
  primary: '#f1ffef'
  on-primary: '#003919'
  primary-container: '#00ff88'
  on-primary-container: '#007139'
  inverse-primary: '#006d37'
  secondary: '#ffb1c7'
  on-secondary: '#650032'
  secondary-container: '#ff4994'
  on-secondary-container: '#59002b'
  tertiary: '#fffaf7'
  on-tertiary: '#3d2f00'
  tertiary-container: '#ffdb79'
  on-tertiary-container: '#795f01'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#60ff99'
  primary-fixed-dim: '#00e479'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#ffd9e2'
  secondary-fixed-dim: '#ffb1c7'
  on-secondary-fixed: '#3e001d'
  on-secondary-fixed-variant: '#8e0049'
  tertiary-fixed: '#ffe08d'
  tertiary-fixed-dim: '#e5c364'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#0c160e'
  on-background: '#dae6d8'
  surface-variant: '#2d372e'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 32px
  gutter: 24px
  card-padding: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built for the high-intensity environment of a modern restaurant kitchen and management suite. It adopts a **Nocturnal Tactile Glass** aesthetic, blending the futuristic allure of neon-lit cities with the physical reassurance of glass and soft-touch surfaces.

The visual language communicates speed, precision, and high-tech efficiency. By utilizing a dark, "void-like" background, the interface minimizes eye strain during late-night shifts while allowing neon accents to highlight mission-critical data. The brand personality is energetic yet professional, evoking the feeling of a sophisticated flight deck for culinary operations. This design system bridges the gap between digital interface and physical tool through subtle neomorphic depth and heavy backdrop blurs.

## Colors

This design system utilizes a high-contrast palette optimized for OLED displays. The foundation is a deep nocturnal gradient that provides immense depth for the glass layers to sit upon.

- **Primary Neon Green:** Used for growth metrics, "Ready" states, and primary action triggers. It signifies "Go" and system health.
- **Secondary Neon Pink:** Reserved for urgent alerts, live orders, and promotional highlights.
- **Surface Strategy:** Backgrounds are never flat; they transition from a near-black center to a slightly lifted dark grey at the edges. UI surfaces are semi-transparent, allowing the background gradient to bleed through, creating a unified atmospheric feel.

## Typography

The design system relies on the **Inter** font family for its exceptional legibility and neutral, systematic character. By pairing bold, tight-tracked headings with clean, airy body text, the system ensures that restaurant partners can scan order details and revenue figures instantly.

Headings should be treated as "anchors" on the page, using heavy weights to establish hierarchy against the vibrant neon accents. For smaller labels and metadata, an uppercase stylistic set with increased letter spacing is recommended to maintain clarity even at lower brightness levels.

## Layout & Spacing

The layout follows a **fluid grid** model optimized for dashboard density. It uses a 12-column system that allows modules to stack or expand based on the urgency of the information (e.g., the "Live Orders" feed may span 8 columns, while "Daily Stats" spans 4).

Spacing follows a strict 8px rhythmic scale. Generous internal padding (24px) within glass cards ensures that the neomorphic shadows and 40px backdrop blur have enough room to breathe without crowding the content. Use the "stack" variables to maintain consistent vertical rhythm between text blocks and interactive elements.

## Elevation & Depth

Depth in this design system is achieved through a hybrid of **Glassmorphism** and **Neomorphism**. This creates a "Tactile Glass" effect where elements feel like physical panes of glass hovering over a dark surface.

- **Glass Layers:** Every card uses a 5% white opacity fill with a 40px backdrop blur filter. This obscures the background just enough to make the card content legible without losing the sense of transparency.
- **Borders:** A 10% white opacity border acts as a "rim light," defining the edge of the glass pane.
- **Shadows:** Cards utilize a neomorphic outset shadow—a combination of a dark shadow (black, 40% opacity) on the bottom-right and a subtle highlight shadow (white, 5% opacity) on the top-left—to simulate a physical lift from the dashboard floor.

## Shapes

The shape language balances friendliness with technical precision. 

- **Structural Elements:** Main dashboard cards and large containers use a generous 24px corner radius. This high degree of roundness softens the high-contrast neon aesthetic and emphasizes the "liquid glass" look.
- **Interactive Elements:** Buttons, input fields, and chips use a tighter 12px radius. This differentiation creates a clear visual distinction between static layout containers and clickable interface components.

## Components

The components within this design system are designed to pop against the dark background while maintaining a premium, tactile feel.

- **Buttons:** Primary buttons use a solid #00ff88 fill with black text for maximum contrast. Secondary buttons should use the 10% white border with neon text.
- **Glass Cards:** The primary organizational unit. Must include the 40px blur and the neomorphic outset shadow.
- **Input Fields:** Unlike cards, inputs are "sunken" into the surface. Use a neomorphic **inset** shadow to create a carved-out effect, with #1a1a1a as the base and 12px roundness.
- **Neon Chips:** Used for status indicators (e.g., "New Order," "Delivering"). These should use a low-opacity version of the neon colors (15% opacity) with a 1px solid neon border.
- **Icons:** Use Material Symbols Outlined. Icons should inherit the color of their context—either the muted body text color or the vibrant neon accent color when used as status indicators.
- **Progress Bars:** Use #00ff88 with an outer glow (drop shadow with 0 spread and high blur) to simulate a glowing neon tube.