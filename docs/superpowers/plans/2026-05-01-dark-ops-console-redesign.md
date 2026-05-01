# Dark Ops Console Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Stand Owner into a modern dark ops console while preserving current reservation behavior.

**Architecture:** Keep the Nuxt 3 SPA and current composables/API routes. Replace visual structure and styling in page/components, using Tailwind tokens and PrimeVue dark overrides. Business logic stays in `useStands`, `useApi`, and `useUser`.

**Tech Stack:** Nuxt 3, Vue 3 Composition API, PrimeVue 4, Tailwind CSS, Supabase-backed Nuxt server routes.

---

## File Structure

- Modify `tailwind.config.js`: add approved palette aliases, shadows, and dark UI surface tokens.
- Modify `app.vue`: global background, typography, PrimeVue dark overrides.
- Modify `pages/index.vue`: new dashboard shell, top bar, summary metrics, controls, responsive layout.
- Modify `components/UserProfile.vue`: compact dark profile/logout control.
- Modify `components/StandGroup.vue`: section layout, filters, responsive grid.
- Modify `components/StandCard.vue`: dark card states, actions, modal styling.
- Modify `pages/login.vue`: dark auth screen.
- Modify `pages/register.vue`: dark auth screen.
- Optional modify `README.md`: update architecture note after UI work if time permits.

---

### Task 1: Design Tokens And Global Shell

**Files:**
- Modify: `tailwind.config.js`
- Modify: `app.vue`

- [ ] **Step 1: Add palette tokens**

Update `tailwind.config.js` `theme.extend.colors` with:

```js
brand: {
  ink: "#2F4454",
  wine: "#2E151B",
  pink: "#DA7B93",
  teal: "#376E6F",
  forest: "#1C3334",
},
surface: {
  950: "#071012",
  900: "#0B171A",
  850: "#101F23",
  800: "#14282B",
  700: "#1E363A",
},
```

Keep existing `primary`, `stand-free`, and `stand-occupied` tokens for compatibility.

- [ ] **Step 2: Add global dark base styles**

In `app.vue`, set `body` background to a dark palette gradient and text to light neutral. Update PrimeVue input/dialog/toast overrides to dark surfaces:

```css
body {
  margin: 0;
  padding: 0;
  background:
    radial-gradient(circle at 20% 0%, rgba(218, 123, 147, 0.16), transparent 32rem),
    radial-gradient(circle at 90% 10%, rgba(55, 110, 111, 0.18), transparent 30rem),
    #071012;
  color: #edf7f8;
  line-height: 1.6;
}

.p-dialog {
  background: #0b171a;
  color: #edf7f8;
  border: 1px solid rgba(218, 123, 147, 0.22);
}

.p-dialog-header,
.p-dialog-content {
  background: #0b171a;
  color: #edf7f8;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

Expected: build passes. Existing `caniuse-lite` warning may remain.

---

### Task 2: Dashboard Layout

**Files:**
- Modify: `pages/index.vue`
- Modify: `components/UserProfile.vue`

- [ ] **Step 1: Replace light shell**

Change root dashboard container to dark shell:

```vue
<div class="min-h-screen bg-surface-950 text-slate-100">
```

Use a sticky top bar with product title, concise subtitle, connection state, and `UserProfile`.

- [ ] **Step 2: Add summary metrics**

Keep `statistics` computed. Render compact metric tiles for:

- Total
- Free
- Occupied
- Mine

Use current `userStands.length` for Mine.

- [ ] **Step 3: Preserve group visibility**

Keep `groupVisibility`, `isGroupVisible`, and `toggleGroup`. Restyle hide/show actions as compact controls, not large floating buttons.

- [ ] **Step 4: Restyle UserProfile**

Update `components/UserProfile.vue` to dark compact profile:

- avatar circle using `brand-pink`.
- name and email on dark translucent surface.
- logout as icon/text button.

- [ ] **Step 5: Verify dashboard compiles**

Run: `npm run build`

Expected: build passes.

---

### Task 3: Stand Group Controls

**Files:**
- Modify: `components/StandGroup.vue`

- [ ] **Step 1: Restyle group container**

Replace bright white group card with dark translucent panel:

```css
.stand-group {
  @apply bg-surface-900/75 backdrop-blur-xl rounded-2xl border border-white/10 p-5;
}
```

- [ ] **Step 2: Keep filters functional**

Preserve:

- `searchQuery`
- `statusFilter`
- `filteredStands`
- Frontend/Backend group title
- emitted events

Restyle search input and radio group as segmented dark controls.

- [ ] **Step 3: Improve responsive grid**

Use stable card tracks:

```css
.stands-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
}
```

- [ ] **Step 4: Verify search/filter UI**

Run dev server and check:

- search text field accepts input.
- all/free/occupied filter switches visible cards.
- mobile width does not overflow.

---

### Task 4: Stand Card Redesign

**Files:**
- Modify: `components/StandCard.vue`

- [ ] **Step 1: Preserve all props and emits**

Keep:

```js
const props = defineProps({
  stand: { type: Object, required: true },
  allowCommentEdit: { type: Boolean, default: false },
});
```

Keep emits:

```js
const emit = defineEmits([
  "occupy",
  "release",
  "task-url-updated",
  "task-url-removed",
  "ended-at-updated",
  "ended-at-removed",
  "comment-change",
]);
```

- [ ] **Step 2: Redesign card states**

Use three visual states:

- free: teal border, clear "Свободен", primary "Занять".
- occupied by other: wine/pink border, owner/task/time/comment visible, disabled action.
- occupied by current user: highlighted pink accent, edit controls, "Освободить".

- [ ] **Step 3: Keep modal behavior**

Do not change:

- `submitTaskUrl`
- `submitEndedAt`
- `unsetTaskUrl`
- `unsetEndedAt`
- `submitComment`
- `removeComment`

Only restyle modal content and buttons.

- [ ] **Step 4: Remove touched debug log**

Remove this line if editing nearby code:

```js
console.log("endedAtInput.value", endedAtInput.value.toISOString());
```

- [ ] **Step 5: Verify card actions manually**

In browser, confirm:

- free cards show reserve action.
- current-user cards show release/edit actions.
- other-user cards do not allow release.
- URL validation still rejects invalid URL.
- end time validation still rejects past time.

---

### Task 5: Auth Screens

**Files:**
- Modify: `pages/login.vue`
- Modify: `pages/register.vue`

- [ ] **Step 1: Apply dark palette**

Use same background as app shell, centered dark panel, pink primary action.

- [ ] **Step 2: Preserve auth logic**

Do not change:

- `login(email.value, password.value)`
- `register(name.value, email.value, password.value)`
- redirect behavior.

- [ ] **Step 3: Remove register debug log**

Remove:

```js
console.log(e);
```

- [ ] **Step 4: Verify routes**

Open:

- `/login`
- `/register`
- `/`

Expected:

- logged-out users redirect to `/login`.
- auth forms render without overflow on mobile.

---

### Task 6: Browser QA And Polish

**Files:**
- Modify touched UI files only as needed.

- [ ] **Step 1: Run build**

Run: `npm run build`

Expected: build passes.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`

Expected: local Nuxt URL is available.

- [ ] **Step 3: Verify desktop**

Open app in browser at desktop width. Check:

- header readable.
- metrics visible.
- filters visible.
- cards aligned.
- modals readable.

- [ ] **Step 4: Verify mobile**

Set mobile width. Check:

- no horizontal overflow.
- cards stack cleanly.
- buttons fit.
- auth forms fit.

- [ ] **Step 5: Final cleanup**

Run:

```bash
git status --short
```

Expected: only intended UI files and docs changed.

---

## Self-Review

Spec coverage:

- Visual palette covered in Task 1.
- Dashboard shell covered in Task 2.
- Group controls covered in Task 3.
- Stand card states and modals covered in Task 4.
- Auth screens covered in Task 5.
- Verification covered in Task 6.

Placeholder scan:

- No TBD/TODO placeholders.

Scope:

- Single UI redesign plan. No backend/auth/schema changes.
