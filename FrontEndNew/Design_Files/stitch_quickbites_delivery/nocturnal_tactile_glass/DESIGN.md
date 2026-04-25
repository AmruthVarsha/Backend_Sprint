---
name: Nocturnal Tactile Glass
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#e1bfb5'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#a98a80'
  outline-variant: '#594139'
  surface-tint: '#ffb59d'
  primary: '#ffb59d'
  on-primary: '#5d1900'
  primary-container: '#ff6b35'
  on-primary-container: '#5f1900'
  inverse-primary: '#ab3500'
  secondary: '#44e2cd'
  on-secondary: '#003731'
  secondary-container: '#03c6b2'
  on-secondary-container: '#004d44'
  tertiary: '#b9c8de'
  on-tertiary: '#233143'
  tertiary-container: '#8c9bb0'
  on-tertiary-container: '#243344'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#832600'
  secondary-fixed: '#62fae3'
  secondary-fixed-dim: '#3cddc7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin: 24px
---

## Brand & Style
This design system captures a sophisticated, late-night culinary aesthetic. It blends the depth of **Glassmorphism** with the physical intuition of **Neomorphism**, creating a UI that feels like etched glass floating over a dark obsidian surface. The personality is premium, appetizing, and highly tactile. It targets a modern audience that appreciates high-end craft and sensory feedback in digital interfaces. By combining high-blur translucency with soft, extruded shadow-work, the interface achieves a "squishy" yet glass-like quality that makes every interaction feel intentional and high-quality.

## Colors
The palette is rooted in a deep slate and neutral-black foundation to provide maximum contrast for the vibrant **Orange-Red (#FF6B35)** primary accent. This primary color is used sparingly for critical actions and brand moments to ensure it feels "hot" and appetizing. 

The neutral scale utilizes a cool-toned slate to maintain a modern, premium feel. Success and secondary states leverage a muted teal to avoid clashing with the warmth of the primary orange. Backgrounds are tiered: a "Deep" base for the canvas and a slightly lighter "Surface" for containers, which allows for the neomorphic shadow effects to manifest.

## Typography
This design system utilizes **Plus Jakarta Sans** exclusively to maintain a friendly, approachable, yet geometric tone. Headlines feature tighter letter-spacing and heavier weights to feel impactful against the glass textures. Body text is set with generous line-height to ensure legibility against dark, blurred backgrounds. All labels and functional text use medium or semi-bold weights to prevent "bleeding" into the dark UI shadows.

## Layout & Spacing
The layout follows a **fluid grid** logic with a 12-column structure for desktop and a 4-column structure for mobile. Spacing is governed by an 8px rhythmic unit. Because neomorphic elements require visual "breathing room" to showcase their dual shadows (light and dark), the design system mandates generous padding within cards and containers (minimum `md` spacing) to prevent shadows from overlapping adjacent text.

## Elevation & Depth
Depth is achieved through a hybrid of two techniques:
1.  **Neomorphic Base:** Elements "push" out of the slate background using a dual shadow: a bottom-right shadow (Black, 40% opacity) and a top-left highlight (#1E293B, 50% opacity). This creates a molded, plastic feel.
2.  **Glass overlays:** Floating elements (like modals or navigation bars) use high-blur backdrop filters (20px - 40px) with a very low-opacity white tint (3%) and a thin 0.5px white inner-border. 

Stacked items should appear to be layers of frosted glass resting on molded plastic surfaces.

## Shapes
The shape language is consistently **Rounded**. Standard components use a 0.5rem radius, while larger cards and glass panels use 1rem to 1.5rem. This softness is essential for the neomorphic effect; sharp corners break the "molded" illusion. Buttons and high-frequency interaction points should lean towards the higher end of the roundedness scale to feel "squishy" and tactile.

## Components
-   **Buttons:** Primary buttons use the #FF6B35 orange-red with a subtle inner-glow at the top edge. Secondary buttons should be glass panels with a high blur and thin slate border.
-   **Chips:** Tiny glass bubbles with 12px padding. When active, they take on the primary color with a soft glow effect (drop shadow matching the button color at 30% opacity).
-   **Cards:** Neomorphic containers with `rounded-lg`. Content inside cards should be placed on a "sunken" inner-well (inverted neomorphic shadow) to create hierarchy.
-   **Inputs:** Inset shadows to make the fields look carved into the surface. Use a 1px orange-red border only when the field is focused.
-   **Lists:** Divided by soft gradients rather than hard lines, or placed within individual neomorphic "cells" for a more tactile vertical scroll.
-   **Checkboxes/Radios:** Circular and highly tactile; when checked, they should appear to "click" inward with an inner-glow of the primary orange.