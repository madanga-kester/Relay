# Relay / Ownerboard Design System

**Status:** Active visual reference  
**Last updated:** 2026-10-06

## 1. Design principles

### Clean

Use clear hierarchy, generous spacing, restrained borders, and focused content. Avoid decorative complexity that competes with marketplace actions.

### Simple

Each screen should make the next useful action obvious. Prefer familiar controls, concise labels, and progressive disclosure for secondary details.

### Productive

Users should be able to scan campaign status, budgets, applications, placements, and performance quickly. Tables, filters, status chips, and detail drawers should support operational work rather than decoration.

### Consistent

Advertiser, Community Owner, and Admin workspaces share the same visual language. Admin can be denser and more operational, but must still feel like the same marketplace.

### Trustworthy

Financial values, status transitions, confirmation dialogs, and error messages should be explicit. Never use visual polish to hide uncertainty or failed operations.

## 2. Color palette

These values mirror the existing user-facing application theme in `client/src/index.css`.

### Light theme

| Token | Value | Use |
|---|---:|---|
| Canvas | `#f7f5f0` | Page background |
| Surface | `#ffffff` | Cards, panels, sidebar |
| Surface soft | `#fcfbf8` | Secondary surfaces, input areas |
| Ink | `#132238` | Headings, primary text |
| Muted | `#718092` | Supporting text |
| Muted deep | `#4e5e70` | Secondary emphasis |
| Border | `#e8e8e3` | Default dividers and borders |
| Border dark | `#dcded9` | Stronger control borders |
| Coral | `#ff6b4a` | Primary action and attention |
| Coral dark | `#e85535` | Hover/strong coral text |
| Coral soft | `#fff0ec` | Coral backgrounds |
| Moss | `#287c67` | Positive/active/success state |
| Moss soft | `#e9f5ef` | Positive backgrounds |
| Lilac | `#6f68b5` | Secondary accent/category |
| Lilac soft | `#eeecff` | Secondary accent backgrounds |
| Sand | `#f3e9d8` | Warm supporting surfaces |

### Dark theme

| Token | Value | Use |
|---|---:|---|
| Canvas | `#0e1724` | Page background |
| Surface | `#152235` | Cards and panels |
| Surface soft | `#1b2a3d` | Secondary surfaces |
| Ink | `#f4f7fb` | Primary text |
| Muted | `#a5b2c0` | Supporting text |
| Muted deep | `#c3ced9` | Secondary emphasis |
| Border | `rgba(255,255,255,.10)` | Default dark divider |
| Border dark | `rgba(255,255,255,.16)` | Stronger dark border |
| Coral soft | `rgba(255,107,74,.14)` | Coral dark-theme background |
| Moss soft | `rgba(40,124,103,.19)` | Positive dark-theme background |
| Lilac soft | `rgba(111,104,181,.20)` | Secondary dark-theme background |

Coral is the primary action color, not the only color. Moss communicates healthy/active states; lilac communicates secondary categories; dark navy/ink provides contrast and structure.

## 3. Typography

- Primary UI font: **DM Sans**.
- Display/major page heading font: **Fraunces** where the existing workspace uses a editorial heading.
- Body text should be compact but readable, generally 12–14px for dense workspace content.
- Page headings may use responsive sizing between 34px and 48px.
- Use weight 700–900 for actions, labels, and status emphasis.
- Keep line height around 1.45–1.7 for body copy.
- Use letter spacing sparingly; uppercase labels may use `.09em`–`.14em`.

## 4. UI components

### Navigation

- Static desktop sidebar with clear section labels.
- Active item uses Coral Soft background and primary text.
- Sidebar should remain visually connected to the page canvas.
- Mobile layouts may collapse navigation, but must retain access to every route.

### Top bar

- Sticky or static according to workspace needs.
- Contains context, notifications, profile, and search where applicable.
- Use subtle bottom borders rather than heavy shadows.

### Cards

- Light cards use white surfaces, 1px borders, and restrained shadow.
- Dark cards use Navy surfaces and low-opacity white borders.
- Standard radii: 11px controls, 17px medium cards, 24px major panels.
- Avoid excessive card nesting and avoid outlining every KPI when a clean surface is enough.

### Buttons

- Primary: Coral background with white text.
- Secondary: transparent or Surface Soft with Border Dark.
- Destructive: use a clear danger treatment and confirmation dialog.
- Buttons must have disabled, hover, focus, and loading/error feedback where relevant.

### Status badges

- Active/verified/success: Moss and Moss Soft.
- Attention/pending: Coral or warm accent with readable contrast.
- Secondary/in-review/category: Lilac and Lilac Soft.
- Dark theme badges must retain contrast and not rely on color alone.

### Tables and filters

- Use compact headers, consistent alignment, and visible empty states.
- Keep tables horizontally usable on narrow screens; do not create unnecessary page overflow.
- Filters should be composable and resettable.

### Drawers and dialogs

- Use dialogs for destructive or sensitive actions.
- Use detail drawers for entity inspection when preserving list context helps.
- Keep mobile dialogs inside the viewport with scrollable content.

## 5. Layout and responsive behavior

- Desktop workspace: static sidebar plus scrollable main content.
- Main content should use a constrained readable width while allowing data tables to expand.
- Tablet: reduce columns and preserve action access.
- Mobile: stack cards, make filters wrap, and allow tables to scroll within their container.
- Do not hide critical controls merely to make a layout appear clean.
- Avoid accidental horizontal overflow.

## 6. Interaction and accessibility

- Use semantic headings in order.
- Every form field needs a visible or programmatic label.
- Keyboard focus must be visible.
- Status changes should provide live or inline feedback.
- Confirmation copy must explain the exact consequence.
- Never use color as the only status signal.
- Preserve reduced-motion preferences when adding transitions.

## 7. Content style

- Use plain, direct language.
- Explain financial and lifecycle consequences clearly.
- Prefer “Community Owner” and “Campaign Owner” consistently.
- Avoid vague errors such as “Something went wrong” when a safe specific explanation is available.
