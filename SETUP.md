# Graphix TechHire — Theme System & Dashboard Redesign

Replaces the flat white UI with a full design system, working dark mode,
and dashboards that show real pipeline state.

---

## 1. Install (4 steps)

### Step 1 — Replace `src/index.css`
Copy the whole of `src/styles/theme.css` over your existing `src/index.css`.
This is the only stylesheet you need; it already contains the Tailwind directives.

### Step 2 — Enable class-based dark mode in `tailwind.config.js`
```js
export default {
  darkMode: 'class',                 // <- add this line
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

### Step 3 — Wrap the app in `src/main.tsx`
```tsx
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
```

### Step 4 — Stop the white flash on reload
Paste this in `index.html` inside `<head>`, before any stylesheet.
It applies the saved theme before React mounts, so a dark-mode user
never sees a white flash on refresh.

```html
<script>
  (function () {
    var t = localStorage.getItem('graphix-theme') || 'system';
    var dark = t === 'dark' ||
      (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  })();
</script>
```

---

## 2. Files and where they go

| File | Destination | Action |
|---|---|---|
| `styles/theme.css` | `src/index.css` | replace |
| `context/ThemeContext.tsx` | `src/context/` | new |
| `components/ThemeToggle.tsx` | `src/components/` | new |
| `components/Dash.tsx` | `src/components/` | new |
| `layouts/AppLayout.tsx` | `src/layouts/` | replace |
| `pages/shared/SettingsPage.tsx` | `src/pages/shared/` | replaces the "under active development" stub |
| `pages/admin/AdminDashboard.tsx` | `src/pages/admin/` | replace |
| `pages/student/StudentDashboard.tsx` | `src/pages/student/` | replace |

Route the settings page for every role:
```tsx
import SettingsPage from './pages/shared/SettingsPage';

<Route path="/admin/settings"     element={<SettingsPage />} />
<Route path="/student/settings"   element={<SettingsPage />} />
<Route path="/recruiter/settings" element={<SettingsPage />} />
<Route path="/trainer/settings"   element={<SettingsPage />} />
```

---

## 3. Converting your remaining pages

Every page you already built keeps working — but to make it dark-aware,
swap hardcoded Tailwind colours for the semantic classes:

| Replace | With |
|---|---|
| `bg-white` | `surface` |
| `bg-slate-50` / `bg-gray-50` | `surface-2` |
| `text-slate-900` | `t-primary` |
| `text-slate-500` / `text-gray-500` | `t-secondary` |
| `text-slate-400` | `t-tertiary` |
| `border-slate-100` | `style={{ borderColor: 'var(--border)' }}` |
| a status pill | `<Stage status={x.status} />` |
| a stat card | `<Stat label value icon accent />` |
| a card + header | `<Panel title>…</Panel>` |
| "no data" text | `<Empty icon title body action />` |

Anything using `surface`, `t-primary`, `field`, `btn`, `stage`, or `note-*`
switches themes automatically — no `dark:` variants needed anywhere.

---

## 4. Design decisions worth knowing

**Colour means something.** The pipeline spectrum runs grey → blue → indigo
→ violet → green, fixed in that order. A recruiter learns the hues once and
can then read a candidate list without reading any words. `<Stage>` is the
only place that mapping lives, so it can never drift between pages.

**Each role owns a hue.** Student indigo, recruiter cyan, admin emerald,
super admin slate, trainer amber. The sidebar brand mark, the active nav
item and the avatar all pull from the same pair, so a user always knows
which account they are in.

**Gradients are used sparingly.** They appear on role identity, the one hero
figure per screen, and the primary button. Stat tiles get a 1px coloured edge
instead of a full wash, so a row of four stays readable rather than shouting.

**Dark mode is not an inversion.** Surfaces lift through four warm-tinted
depths (`#080B16` → `#1F2740`), brand colours brighten to hold contrast,
and feedback colours desaturate so red and amber don't glare on a dark panel.

**Motion is limited to one entrance per route change.** No per-card hover
choreography. `prefers-reduced-motion` is respected globally.

**Numbers use tabular figures.** The `.tnum` class keeps digits the same width
so figures in tables and stat cards line up vertically down a column.

---

## 5. Still missing (unchanged from before)

These backend endpoints are called by the new UI. Until they exist those
panels show their empty state rather than erroring:

```
GET   /api/v1/notifications/unread-count
GET   /api/v1/notifications?size=6
PATCH /api/v1/users/me
POST  /api/v1/auth/change-password
POST  /api/v1/auth/logout-all
PATCH /api/v1/users/notification-preferences
GET   /api/v1/admin/applications/recent
```
