# Dark Ops Console Redesign Design

## Goal

Redesign Stand Owner into a dark, modern, highly usable internal tool for reserving test stands. Keep current business behavior unchanged: users log in, see stand availability, reserve or release their own stands, add task links, set release time, and add comments.

## Product Context

The app is used by a development team to signal which test environments are currently occupied. Speed and clarity matter more than feature expansion. The interface should make stand availability obvious at a glance and make the main action, "reserve a free stand", fast.

## Approved Visual Direction

Use the approved "A. Ops console" direction with the reference palette from the supplied image.

Palette:

- Ink blue: `#2F4454`
- Deep wine: `#2E151B`
- Dusty pink accent: `#DA7B93`
- Teal: `#376E6F`
- Dark green: `#1C3334`

Design character:

- Dark Material-style internal console.
- Google-like polish: clean hierarchy, generous but efficient spacing, soft elevation, clear interactive states.
- Dense enough for daily work, but visually calmer than the current card-heavy light UI.
- Avoid decorative blobs, heavy gradients, or marketing-style composition.

## Primary Screen

Dashboard remains first screen after login.

Layout:

- Sticky top bar with product name, short status summary, and user profile/logout.
- Left rail or compact side panel for global filters and group visibility.
- Main content with search, status filters, Frontend/Backend switching or grouped sections.
- Stand cards arranged in responsive grid.
- Mobile collapses to top controls plus single-column cards.

Key dashboard elements:

- Availability summary: free, occupied, optionally "mine" and "ending soon".
- Search by stand name, owner email, task URL text, or comment when data is loaded client-side.
- Status filter: all, free, occupied, mine.
- Group controls: Frontend/Backend visibility preserved from current UX.

## Stand Card

Each stand card must expose current functionality without requiring extra navigation.

Free stand:

- Name and type.
- Clear "Свободен" state.
- Primary action: "Занять".

Occupied by another user:

- Name and type.
- Owner email.
- Task URL if present.
- End time if present.
- Comment if present.
- Disabled/secondary occupied state. No release action.

Occupied by current user:

- Name and type.
- "Ваш стенд" state.
- Editable task URL.
- Editable release time.
- Editable comment.
- Primary/clear release action.

Interaction model:

- Keep current modals for task URL, release time, and comment, but restyle them dark.
- Inline summary stays readable after modal save.
- Toast messages stay, restyled for dark theme.

## Auth Screens

Keep auth simple. No security redesign.

Login/register should match dashboard design:

- Dark background from approved palette.
- Compact centered panel.
- Same accent, input, button, focus states.
- Current fields and validation remain.

## Architecture

Keep existing Nuxt 3 SPA architecture.

No data or API behavior changes required:

- `pages/` remains route layer.
- `composables/useStands.js`, `useApi.js`, `useUser.js` keep current responsibilities.
- `server/api/*` unchanged unless visual work exposes a small response-shape bug.
- Supabase schema unchanged.

UI refactor should introduce small view helpers/components only when they reduce component size and improve readability. Business logic stays in existing composables.

## Files Expected To Change

- `app.vue`: global dark shell, typography, PrimeVue overrides.
- `tailwind.config.js`: palette tokens, shadows, radii, animations.
- `pages/index.vue`: dashboard layout, filters, top bar, group controls.
- `pages/login.vue`: dark auth UI.
- `pages/register.vue`: dark auth UI.
- `components/UserProfile.vue`: compact dark user menu/profile.
- `components/StandGroup.vue`: dark section/group layout, search/filter display.
- `components/StandCard.vue`: redesigned card states and modal styling.
- `components/AutoReleaseTimer.vue`: either restyle or leave hidden if current UX keeps it hidden.

Optional helper components:

- `components/StatusPill.vue`
- `components/MetricTile.vue`

Only add helpers if they reduce duplication.

## Error Handling

Keep current toast and API error behavior. Improve presentation:

- Connection error becomes a compact dark alert.
- Loading state uses skeleton-like panels or a centered spinner matching the new theme.
- Empty states stay brief and utilitarian.

## Testing And Verification

No test runner exists. Verification will use:

- `npm run build`.
- Browser check at desktop and mobile widths.
- Manual workflow check:
  - login screen renders.
  - dashboard renders.
  - search/filter controls do not break layout.
  - stand card states are readable.
  - task URL modal opens and validates URL.
  - release time modal opens and rejects past time.
  - comment modal opens.

## Non-Goals

- Do not replace simple auth.
- Do not change Supabase schema.
- Do not add roles, admin mode, or permissions.
- Do not change reservation rules.
- Do not implement real-time subscriptions.
- Do not redesign backend APIs.

## Known Small Improvements Worth Including

- Update README later; current README still describes old Express/in-memory architecture.
- Keep auto-release behavior unchanged unless separately requested. Current interval code is disabled.
- Avoid logging noisy debug output in UI components if touched during redesign.
