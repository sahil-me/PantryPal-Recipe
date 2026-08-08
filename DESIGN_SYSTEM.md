# Design System Specification — PantryPal (Haute Cuisine / Culinary Reserve)

## 1. Theme Philosophy
PantryPal embodies a "Haute Cuisine & Culinary Reserve" dark luxury aesthetic that evokes the atmosphere of an upscale, Michelin-starred restaurant menu. Built on deep obsidian and espresso backgrounds (`#121212`, `#161513`, `#1A1918`) accented with metallic champagne gold (`#D4AF37`) and warm amber highlights (`#E6A135`), the interface balances high-contrast typography, generous spatial rhythm, and tactile subtle borders.

---

## 2. Color Palette

| Color Token | CSS / Tailwind Class | HSL Value | Hex Equivalent | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas Background** | `bg-[#121212]` | `hsl(0, 0%, 7%)` | `#121212` | Primary dark viewport canvas background |
| **Surface Darker** | `bg-[#161513]` | `hsl(30, 7%, 8%)` | `#161513` | Top navigation header, sidebar container, footer |
| **Surface Dark** | `bg-[#1A1918]` | `hsl(30, 3%, 10%)` | `#1A1918` | Primary page container cards, modal dialogs, search panels |
| **Surface Card** | `bg-[#1E1D1B]` | `hsl(30, 4%, 11%)` | `#1E1D1B` | Recipe cards, search bars, active ingredient containers |
| **Surface Elevated** | `bg-[#23211E]` | `hsl(30, 5%, 13%)` | `#23211E` | Input fields, secondary buttons, suggestion dropdown rows |
| **Border Subtle** | `border-[#2A2724]` | `hsl(30, 8%, 15%)` | `#2A2724` | Default card borders, section dividers, container outlines |
| **Accent Gold Primary** | `text-[#D4AF37]` / `bg-[#D4AF37]` | `hsl(46, 65%, 53%)` | `#D4AF37` | Brand primary color, active badges, gradient endpoints |
| **Accent Gold Light** | `text-[#E5C158]` / `bg-[#E5C158]` | `hsl(46, 73%, 62%)` | `#E5C158` | Metallic CTA gradient highlight, active state glow |
| **Accent Gold Dark** | `bg-[#C5A028]` | `hsl(46, 66%, 46%)` | `#C5A028` | Metallic CTA gradient dark depth anchor |
| **Accent Gold Sparkle** | `text-[#F3C64F]` | `hsl(43, 88%, 63%)` | `#F3C64F` | Star icons, missing ingredient warning badges |
| **Accent Amber / Alert**| `text-[#E6A135]` / `border-[#E6A135]`| `hsl(37, 78%, 55%)` | `#E6A135` | Missing ingredient alerts, clear buttons, warnings |
| **Text Primary** | `text-[#F5F2EB]` | `hsl(40, 33%, 94%)` | `#F5F2EB` | Primary headings, titles, active text |
| **Text Secondary** | `text-[#C2BCB2]` | `hsl(38, 11%, 73%)` | `#C2BCB2` | Body copy, recipe descriptions, metadata |
| **Text Muted** | `text-[#A39C90]` | `hsl(36, 9%, 60%)` | `#A39C90` | Captions, placeholders, inactive icons |
| **Text Dark Muted** | `text-[#8A8275]` | `hsl(37, 8%, 50%)` | `#8A8275` | Category headers, disabled button labels |
| **Contrast Black** | `text-black` / `bg-black` | `hsl(0, 0%, 0%)` | `#000000` | Text on filled champagne gold buttons and badges |

---

## 3. Typography

### Font Families
- **Display / Heading Font**: `Playfair Display`, serif (`font-serif`) — Used for hero titles, page titles, section headers, recipe titles.
- **Body Font**: `Plus Jakarta Sans`, sans-serif (`font-sans`) — Used for navigation, body text, ingredient chips, button labels, metadata.

### Google Fonts Import
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Font Weights
- **Light (`300`)**: `font-light` — Recipe card long descriptions
- **Medium (`500`)**: `font-medium` — Standard body text, metadata, input placeholders
- **Semibold (`600`)**: `font-semibold` — Navigation links, ingredient chip labels
- **Bold (`700`)**: `font-bold` — Titles, buttons, badge text
- **Extrabold (`800`)**: `font-extrabold` — Primary CTA buttons, match percentages

### Text Sizes & Scale
| Level | Mobile Size | Desktop Size | Tailwind Classes |
| :--- | :--- | :--- | :--- |
| **Hero Display** | 36px (`4xl`) | 72px (`7xl`) | `text-4xl sm:text-6xl md:text-7xl font-serif font-bold` |
| **Page Title (H1)** | 24px (`2xl`) | 30px (`3xl`) | `text-2xl sm:text-3xl font-serif font-bold` |
| **Section Header (H2)**| 20px (`xl`) | 24px (`2xl`) | `text-xl sm:text-2xl font-serif font-bold` |
| **Card Heading (H3)** | 16px (`base`) | 18px (`lg`) | `text-base sm:text-lg font-serif font-bold` |
| **Subheading (H4)** | 14px (`sm`) | 16px (`base`) | `text-sm sm:text-base font-serif font-bold` |
| **Body Text** | 12px (`xs`) | 14px (`sm`) | `text-xs sm:text-sm text-[#C2BCB2] font-sans` |
| **Captions / Micro** | 10px / 11px | 11px / 12px | `text-[10px]` or `text-[11px] text-[#A39C90]` |

---

## 4. Border Radius

- **Base Radius Token**: `rounded-2xl` (16px) — Universal standard for UI containers, inputs, and recipe cards.

| Radius Token | Value | Tailwind Class | Usage Context |
| :--- | :--- | :--- | :--- |
| **Pill / Badge** | `9999px` | `rounded-full` | Match badges, status indicators, category overlays |
| **Container / Card**| `24px` / `28px` | `rounded-3xl` / `rounded-[28px]` | Main page sections, hero preview panels, modal dialogs |
| **Standard Card** | `16px` | `rounded-2xl` | Recipe cards, search bar containers, user info cards |
| **Button / Chip** | `12px` | `rounded-xl` | Primary/secondary buttons, ingredient chips, dropdown items |
| **Small Tag** | `8px` | `rounded-lg` | Scale multipliers (`1x`, `2x`), count pills |

---

## 5. Shadows

| Shadow Token | Tailwind Class | CSS Value | Usage Context |
| :--- | :--- | :--- | :--- |
| **Modal Depth** | `shadow-2xl` | `0 25px 50px -12px rgba(0, 0, 0, 0.7)` | Modal windows, elevated hero card overlays |
| **Hover Lift** | `shadow-xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.5)` | Recipe cards on hover state, elevated search panels |
| **Container Depth**| `shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.4)` | Sidebar containers, secondary card sections |
| **Element Shadow** | `shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.3)` | Input bars, standard buttons, badge chips |
| **Gold Glow CTA** | `shadow-[#D4AF37]/15` | `0 10px 25px -5px rgba(212, 175, 55, 0.15)` | Primary metallic gold CTA button emphasis |

---

## 6. Gradients

- **Metallic Gold Horizontal CTA**:
  `bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028]`
  *Usage: Primary action buttons ("Find Recipes", "Get Started Free", "Add Missing")*
- **Metallic Gold Diagonal Logo / Avatar**:
  `bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028]`
  *Usage: Brand icon avatars, user initials, 100% match badges*
- **Compact Metallic Gold Button / Active Item**:
  `bg-gradient-to-r from-[#D4AF37] to-[#C5A028]`
  *Usage: Active sidebar navigation, category filter tabs, modal done buttons*
- **Hero Dark Overlay Gradient**:
  `bg-gradient-to-b from-black/75 via-[#121212]/90 to-[#121212]`
  *Usage: Full-width background image dark overlay for optimal text contrast*
- **Ambient Radial Glow**:
  `bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent`
  *Usage: Subtle background warmth behind luxury headers and CTA banners*

---

## 7. Button Specifications

### Size Variants
- **Large CTA**: Height 56px (`py-4 px-9`), text size `text-sm` / `text-base`, `font-extrabold`, `rounded-2xl`
- **Medium Standard**: Height 44px (`py-3.5 px-6`), text size `text-xs` / `text-sm`, `font-extrabold`, `rounded-2xl`
- **Small Action**: Height 36px (`py-2.5 px-4`), text size `text-xs`, `font-bold`, `rounded-xl`
- **Micro / Badge**: Height 28px (`py-1 px-2.5`), text size `text-[10px]` / `text-[11px]`, `font-bold`, `rounded-lg`

### Style Variants
- **Primary Metallic Gold**:
  `bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black hover:brightness-110 font-extrabold rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15`
- **Secondary Dark Outline**:
  `bg-[#1E1D1B] hover:bg-[#23211E] text-[#F5F2EB] hover:text-[#D4AF37] border border-[#2A2724] hover:border-[#D4AF37] font-bold rounded-2xl transition-all cursor-pointer`
- **Ghost Gold Accent**:
  `bg-[#1E1D1B] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] font-bold rounded-xl transition-all cursor-pointer`
- **Warning / Clear Action**:
  `bg-[#23211E] hover:bg-[#E6A135]/20 text-[#E6A135] border border-[#E6A135]/40 font-bold rounded-2xl transition-all cursor-pointer`

### Focus & Disabled States
- **Focus State**: `focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40`
- **Disabled State**: `bg-[#2A2724] text-[#8A8275] cursor-not-allowed shadow-none border-transparent`

---

## 8. Card Specifications

- **Base Container Card**:
  `bg-[#1A1918] rounded-3xl border border-[#2A2724] p-6 shadow-xl space-y-6`
- **Interactive Recipe Card**:
  `bg-[#1E1D1B] rounded-2xl border border-[#2A2724] hover:border-[#D4AF37] shadow-md hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300 overflow-hidden flex flex-col group h-full`
- **Info / Alert Banner Card**:
  `p-4 bg-[#1E1D1B] border border-[#D4AF37]/30 rounded-2xl space-y-1`
- **Modal Window Container**:
  `w-full max-w-md bg-[#1A1918] rounded-[28px] shadow-2xl border border-[#2A2724]`

---

## 9. Input Specifications

- **Height**: 48px (`py-3.5`)
- **Base Input Style**:
  `w-full pl-11 pr-24 py-3.5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl text-sm text-[#F5F2EB] placeholder-[#8A8275] font-medium shadow-md`
- **Focus State**:
  `focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none transition-all`
- **Icon Attachment**: Left-aligned icon positioned at `left-4` with `text-[#A39C90]`

---

## 10. Badge / Tag Specifications

- **100% Chef Match Badge**:
  `bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold border border-[#D4AF37] px-3 py-1 rounded-full text-xs shadow-lg`
- **Partial Match Badge**:
  `bg-[#2A2724]/90 text-[#F3C64F] border border-[#E6A135]/50 backdrop-blur-md px-3 py-1 rounded-full text-xs`
- **Category Overlay Pill**:
  `bg-black/80 text-[#D4AF37] border border-[#D4AF37]/30 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase`
- **Active Ingredient Chip**:
  `bg-[#2A2724] border border-[#D4AF37]/50 text-[#F5F2EB] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2`
- **Catalog Suggestion Chip**:
  `bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37]/40 text-[#F5F2EB] text-xs px-3 py-1.5 rounded-xl`

---

## 11. Icon Containers

- **Large Brand Avatar**:
  `w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center font-bold shadow-md`
- **Header / Sidebar Logo**:
  `w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black flex items-center justify-center font-bold shadow-lg`
- **Small Header Badge Icon**:
  `w-8 h-8 rounded-xl bg-[#1E1D1B] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center`
- **Floating Heart Circle**:
  `p-2.5 rounded-full bg-black/60 text-[#C2BCB2] hover:text-[#D4AF37] backdrop-blur-md shadow-md transition-all`

---

## 12. Animations

- **Page Fade-In**:
  `animate-in fade-in duration-200`
- **Modal Zoom Entrance**:
  `animate-in fade-in zoom-in-95 duration-200`
- **Dropdown Slide Entrance**:
  `animate-in slide-in-from-top-2 duration-150`
- **Card Hover Scale**:
  `group-hover:scale-105 transition-transform duration-500`
- **Loading / Pulse Indicators**:
  `animate-pulse`, `animate-spin`

---

## 13. Spacing and Layout

### Container Width Constraints
- **Results & Favorites View**: `max-w-7xl` (1280px)
- **Pantry & Landing Hero**: `max-w-5xl` (1024px)
- **Recipe Detail View**: `max-w-4xl` (896px)
- **Auth & Account Views**: `max-w-md` (448px) / `max-w-3xl` (768px)

### Section Spacing
- **Landing Page Section Padding**: `py-24` (96px)
- **View Container Padding**: `py-8` (32px) desktop / `py-6` (24px) mobile
- **Card Inner Padding**: `p-6` (24px) standard / `p-4` (16px) compact
- **Grid Gaps**: `gap-6` (24px) for card grids, `gap-4` (16px) for form layouts, `gap-2` (8px) for tag groups

---

## 14. Hover and Interactive States

- **Recipe Card Hover**:
  Border transitions to `#D4AF37`, image scales `1.05x`, shadow lifts with `#D4AF37`/5 glow.
- **Metallic Gold CTA Hover**:
  Brightness increases by 10% (`hover:brightness-110`), gold drop shadow deepens.
- **Dark Surface Hover**:
  Background shifts from `#1E1D1B` to `#23211E`, border highlights to `#D4AF37`/40.
- **Interactive Text Selection**:
  `selection:bg-[#D4AF37]/30` — Golden highlight on user text selections.
