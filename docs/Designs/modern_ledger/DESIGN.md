---
name: Modern Ledger
colors:
  surface: '#f2fbff'
  surface-dim: '#cedce3'
  surface-bright: '#f2fbff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e8f6fd'
  surface-container: '#e2f0f7'
  surface-container-high: '#dceaf1'
  surface-container-highest: '#d7e5eb'
  on-surface: '#101d22'
  on-surface-variant: '#404945'
  inverse-surface: '#253237'
  inverse-on-surface: '#e5f3fa'
  outline: '#707974'
  outline-variant: '#c0c9c3'
  surface-tint: '#376757'
  primary: '#144637'
  on-primary: '#ffffff'
  primary-container: '#2e5e4e'
  on-primary-container: '#a3d5c1'
  inverse-primary: '#9fd1bd'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#fdcb5b'
  on-secondary-container: '#735500'
  tertiary: '#7c1223'
  on-tertiary: '#ffffff'
  tertiary-container: '#9d2b38'
  on-tertiary-container: '#ffb9ba'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baeed9'
  primary-fixed-dim: '#9fd1bd'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#1e4f40'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f1bf51'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b4'
  on-tertiary-fixed: '#40000a'
  on-tertiary-fixed-variant: '#881c2a'
  background: '#f2fbff'
  on-background: '#101d22'
  surface-variant: '#d7e5eb'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  numeric-hero:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  numeric-table:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is conceived as a modern digital ledger: sober, serene, and grounded in administrative clarity. Tailored for Brazilian property owners and independent managers handling rental portfolios and tenant tracking, the interface deliberately rejects startup clichés—no decorative gradients, bubbly shapes, or cartoonish 3D assets.

The visual tone is calm, precise, and authoritative. It draws from archival ledgers, editorial accounting books, and functional Nordic minimalism. Information architecture emphasizes strong left-aligned layouts, generous whitespace to prevent cognitive fatigue, crisp 1px delineation lines, and immediate numeric legibility. Statuses carry consequence, rendered with restrained colors that convey reality rather than anxiety.

## Colors

The palette is strictly bounded, functional, and devoid of saturated glows.

- **Primary (`#2E5E4E`)**: Deep sober forest green. Represents primary calls to action, committed entries, and positive settlement ("Pago").
- **Secondary / Pending (`#C79A2E`)**: Warm ochre. Communicates open due dates, waiting states, and upcoming cycles ("Aguardando").
- **Tertiary / Overdue (`#A3303C`)**: Desaturated carmine. Indicates overdue debts and default alerts ("Atrasado").
- **Neutral / Text Primary (`#1E2B30`)**: Deep slate teal-black. Delivers high contrast for numbers and financial text without the harshness of pure black.
- **Canvas (`#F5F6F3`)**: Bone-tinted, warm paper background.
- **Surface (`#FFFFFF`)**: Pure white paper planes used for isolated functional cards and tables.
- **Divider & Borders (`#DDE2DD`)**: Muted hairline boundary used uniformly across all borders, tables, and card strokes.

Color is never used purely for decoration. Every chromatic element signals transactional state or direct user action.

## Typography

The type system pairs structural data legibility with humanized body reading:

- **Headlines, Financial Balances, and Numerics (`Space Grotesk`)**: Rendered in weights 600 and 700 with OpenType tabular figures (`font-variant-numeric: tabular-nums`) enabled universally. This ensures values, dates, and currency quantities (`R$ 0.000,00`) align flush vertically without rhythmic jumping.
- **Body, Inputs, and Metadata (`Atkinson Hyperlegible Next`)**: Engineered for absolute letterform clarity and cognitive comfort during long-form contract inspections, address registries, and tenant notes.

Strict discipline rules:
- Headings are left-aligned by default.
- Currency symbols (`R$`) share weight but sit tight against values.
- Monospaced numerals align to the right inside data columns, while corresponding row text aligns left.

## Layout & Spacing

The layout model is a left-grounded, generous fluid grid built for structured ledger panels and financial overview screens.

- **Grid Architecture**: 12-column grid on desktop (`> 1024px`) with `1.5rem` gutters and `2rem` outer margins. 8 columns on tablet (`768px - 1023px`), collapsing to a single-column stacked view on mobile (`< 768px`) with `1rem` outer margins.
- **Content Max-Width**: Bounded at `1280px` to maintain comfortable eye scanning across wide ledger rows without stretching content out of readability ranges.
- **Whitespace & Rhythm**: Built on an explicit 4px/8px stepping ladder. Spacing between panels and sections is expansive (`space-xl` / `2.5rem`), lending the application an unhurried, book-like demeanor. In contrast, internal table cells and list entries remain compact (`space-sm` to `space-md`) for dense operational utility.

## Elevation & Depth

This system avoids floating elevation, dropped ambient shadows, and blur filters. Depth is established through **low-contrast architectural outlines and physical canvas stacking**:

1. **Base Layer (`#F5F6F3`)**: The ground paper canvas where page containers sit.
2. **Surface Layer (`#FFFFFF`)**: Primary ledger cards, sheets, and popovers sit atop the canvas, framed exclusively by a crisp `1px solid #DDE2DD` perimeter.
3. **Internal Hierarchy**: Delineation within cards and tables uses horizontal 1px hairline rules (`#DDE2DD`).
4. **Modals & Overlays**: Modals utilize a flat `#FFFFFF` surface enclosed in a 1px `#DDE2DD` frame, positioned over a flat neutral wash overlay (`rgba(30, 43, 48, 0.4)`), avoiding blur or glow.

## Shapes

The geometry of the interface is sober and structured:

- **Panels, Sheets, and Cards**: Fixed at `12px` border radius (`rounded-lg`), producing clean rectangular structures that soften the canvas without appearing playful.
- **Buttons, Form Inputs, and Select Boxes**: Fixed at `8px` (`0.5rem`), aligning touch points with exact tactile predictability.
- **Timeline Blocks (Year Month Ruler)**: Fixed at `4px` (`0.25rem`) corner rounding for tight, stamp-like consistency.

## Components

### Buttons
- **Primary**: Solid background `#2E5E4E`, text `#FFFFFF`, border-radius `8px`, no shadow. Hover state shifts to a subtle dark tint (`#244B3E`). Active state inset minimal press.
- **Secondary (Outlined)**: Transparent background, `1px solid #DDE2DD`, text `#1E2B30`, border-radius `8px`. Hover swaps border color to `#2E5E4E` with text `#2E5E4E`.
- **Tertiary / Ghost**: Transparent background, text `#2E5E4E`, underlines only on hover.

### Form Inputs & Selects
- Background `#FFFFFF`, border `1px solid #DDE2DD`, border-radius `8px`, height `40px`.
- Typography: `14px` Atkinson Hyperlegible Next.
- Focus: Border switches to `1px solid #2E5E4E` with no outer glow rings.
- Error state: Border shifts to `1px solid #A3303C`.

### Ledger Cards & Panels
- Background `#FFFFFF`, border `1px solid #DDE2DD`, border-radius `12px`, padding `24px` (`space-lg`).
- Panel headers contain left-aligned section labels with an optional right-aligned tabular summary.
- Sub-divisions use horizontal rules: `1px solid #DDE2DD` stretching edge-to-edge.

### Month Ruler (Régua de Meses)
- Signature element for historical tenant tracking across a 12-month calendar cycle.
- Each month consists of a vertical pair:
  - **Tile**: A `24px × 24px` square with `4px` radius.
    - Paid: Filled `#2E5E4E` with white checkmark icon or solid square fill.
    - Pending: Filled `#C79A2E` or transparent with 2px dashed/solid `#C79A2E` border.
    - Overdue: Filled `#A3303C` with crisp white exclamation or accent mark.
    - Future / Inactive: `#F5F6F3` fill with `1px solid #DDE2DD`.
  - **Label**: Lowercase month initial below (`j`, `f`, `m`, `a`, `m`, `j`, `j`, `a`, `s`, `o`, `n`, `d`) set in Atkinson Hyperlegible Next, `11px`, color `#1E2B30` at 60% opacity.
- Must always be coupled with a textual status chip adjacent to the visual row for accessibility.

### Status Indicators & Badges
- Statuses are never communicated by color alone. Every badge pairs a 6px solid circular dot or colored container with explicit text: "Pago", "Aguardando", "Atrasado".
- Background is a pale tint (`5-10%` opacity of the respective status color) with `1px solid` border in the matching tone and solid text color.
- Radius: `4px`. Padding: `2px 8px`.

### Tables & List Rows
- Row height: `48px` to `56px`.
- Bottom border `1px solid #DDE2DD` separating every row. Alternating row stripes are avoided; the pure white ground maintains typographic order.
- Hover state: Background subtle shift to `#F5F6F3`.