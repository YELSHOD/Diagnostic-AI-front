# Frontend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `diagnostic-ai-front` into a coherent MVP observability frontend that works cleanly with the current backend flow: overview, container selection, live logs, realtime error awareness, and analysis.

**Architecture:** Keep the current React/Vite structure, but strengthen page composition, data-source boundaries, and product flow. REST pages should remain driven by React Query, websocket state should remain in Zustand, and pages should become clearer product surfaces rather than disconnected route demos.

**Tech Stack:** React 18, TypeScript, Vite, React Router, TanStack Query, Zustand, ECharts, TailwindCSS

---

### Task 1: Stabilize App Shell And Product Navigation

**Files:**
- Modify: `src/shared/ui/ShellLayout.tsx`
- Modify: `src/app/router.tsx`
- Create: `src/shared/ui/PageIntro.tsx`
- Test: manual browser verification via `npm run dev`

- [ ] **Step 1: Write the failing UX expectation**

Document the expected navigation behavior:

```md
- Sidebar labels match the actual MVP flow order
- Overview is the primary landing route
- AI Chat is visibly present but not positioned as a core MVP action
- Shared page intros make each screen explain its role in the workflow
```

- [ ] **Step 2: Run local app to verify current mismatch**

Run: `npm run dev`
Expected: App loads, but the shell still feels like a flat route list rather than a guided observability workflow.

- [ ] **Step 3: Write minimal implementation**

`src/shared/ui/PageIntro.tsx`

```tsx
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageIntro({ title, description, actions }: Props) {
  return (
    <div className="topbar" style={{ alignItems: "flex-start", gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <p style={{ margin: "8px 0 0", color: "var(--text-muted)", maxWidth: 720 }}>{description}</p>
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
```

`src/shared/ui/ShellLayout.tsx`

```tsx
const items = [
  ["/overview", "Overview"],
  ["/containers", "Containers"],
  ["/logs", "Live Logs"],
  ["/analysis", "Analysis"],
  ["/settings", "Settings"],
  ["/ai-chat", "AI Chat (Later)"]
] as const;
```

`src/app/router.tsx`

```tsx
{ index: true, element: <Navigate to="/overview" replace /> }
```

- [ ] **Step 4: Run local app to verify it passes**

Run: `npm run dev`
Expected: The app opens on Overview and the shell now communicates the intended MVP flow more clearly.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/ShellLayout.tsx src/app/router.tsx src/shared/ui/PageIntro.tsx
git commit -m "feat: clarify frontend mvp navigation flow"
```

### Task 2: Upgrade Overview Into A Real Entry Dashboard

**Files:**
- Modify: `src/pages/OverviewPage.tsx`
- Modify: `src/widgets/LineChart.tsx`
- Create: `src/shared/ui/StatTable.tsx`
- Test: manual browser verification via `npm run dev`

- [ ] **Step 1: Write the failing UX expectation**

```md
- Overview explains what the user is seeing
- Dashboard highlights current operational state
- Empty and loading states are explicit
- The page provides a path into Containers or Live Logs
```

- [ ] **Step 2: Run local app to verify current behavior**

Run: `npm run dev`
Expected: Overview renders data but still reads like a raw dashboard fragment instead of the first screen of a product flow.

- [ ] **Step 3: Write minimal implementation**

`src/pages/OverviewPage.tsx`

```tsx
import { Link } from "react-router-dom";
import { PageIntro } from "@shared/ui/PageIntro";

<PageIntro
  title="Overview"
  description="Start here to see current container activity, recent error volume, and the exception patterns your backend is already surfacing."
  actions={<Link className="button" to="/containers">Open Containers</Link>}
/>
```

Add explicit sections for:

```tsx
{analytics.isLoading ? <section className="card">Loading analytics...</section> : null}
{analytics.error ? <section className="card">Failed to load analytics.</section> : null}
{!analytics.isLoading && !analytics.error && errors.length === 0 ? (
  <section className="card">No recent error activity for the selected window.</section>
) : null}
```

- [ ] **Step 4: Run local app to verify it passes**

Run: `npm run dev`
Expected: Overview reads as an operational landing page and gives an obvious next step into investigation.

- [ ] **Step 5: Commit**

```bash
git add src/pages/OverviewPage.tsx src/widgets/LineChart.tsx src/shared/ui/StatTable.tsx
git commit -m "feat: turn overview into mvp dashboard entry"
```

### Task 3: Make Containers The Clear Investigation Launcher

**Files:**
- Modify: `src/pages/ContainersPage.tsx`
- Modify: `src/entities/container/api.ts`
- Create: `src/shared/ui/StatusPill.tsx`
- Test: manual browser verification via `npm run dev`

- [ ] **Step 1: Write the failing UX expectation**

```md
- Containers page explains that it is the source-selection screen
- Empty state is informative
- Loading and failure states are visible
- Main action is to open live logs for a chosen container
```

- [ ] **Step 2: Run local app to verify current behavior**

Run: `npm run dev`
Expected: The page works, but it still feels like a generic table instead of a clear investigation handoff screen.

- [ ] **Step 3: Write minimal implementation**

`src/pages/ContainersPage.tsx`

```tsx
import { PageIntro } from "@shared/ui/PageIntro";

<PageIntro
  title="Containers"
  description="Choose the running service you want to inspect. This page is the handoff point into the live log stream."
/>
```

Add explicit empty state:

```tsx
{!isLoading && !error && (data?.length ?? 0) === 0 ? (
  <div className="card">No matching containers are visible from the backend right now.</div>
) : null}
```

- [ ] **Step 4: Run local app to verify it passes**

Run: `npm run dev`
Expected: Containers page clearly communicates selection and handoff into live logs.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ContainersPage.tsx src/entities/container/api.ts src/shared/ui/StatusPill.tsx
git commit -m "feat: make containers page a clear log entry point"
```

### Task 4: Promote Live Logs Into The Main Working Screen

**Files:**
- Modify: `src/pages/LiveLogsPage.tsx`
- Modify: `src/features/realtime/store.ts`
- Modify: `src/features/realtime/useLogsSocket.ts`
- Create: `src/shared/ui/ConnectionBadge.tsx`
- Test: manual browser verification via `npm run dev`

- [ ] **Step 1: Write the failing UX expectation**

```md
- Live Logs clearly communicates selected container context
- No-container state tells the user exactly what to do next
- Connection state is obvious
- Latest error event is visually separated from general logs
- Stream can be reset when switching containers
```

- [ ] **Step 2: Run local app to verify current mismatch**

Run: `npm run dev`
Expected: Logs stream works, but page-level context and transition behavior are still too raw for a polished MVP.

- [ ] **Step 3: Write minimal implementation**

Add store behavior:

```tsx
setContainer: (selectedContainerId) => set({ selectedContainerId }),
clearStream: () => set({ logs: [], errors: [], clusters: {} })
```

In `useLogsSocket`, reset stream when container changes before reconnecting:

```tsx
const setContainer = useRealtimeStore((s) => s.setContainer);
const clearStream = useRealtimeStore((s) => s.clearStream);

useEffect(() => {
  setContainer(containerId);
  clearStream();
}, [containerId, setContainer, clearStream]);
```

In `LiveLogsPage`, add intro and action guidance:

```tsx
<PageIntro
  title="Live Logs"
  description={containerId
    ? "Watch the selected container in real time and inspect the latest structured error event."
    : "Pick a container first, then this page becomes the primary live investigation screen."}
/>
```

- [ ] **Step 4: Run local app to verify it passes**

Run: `npm run dev`
Expected: The logs page feels like the central operating surface of the MVP.

- [ ] **Step 5: Commit**

```bash
git add src/pages/LiveLogsPage.tsx src/features/realtime/store.ts src/features/realtime/useLogsSocket.ts src/shared/ui/ConnectionBadge.tsx
git commit -m "feat: promote live logs into primary investigation screen"
```

### Task 5: Reframe Analysis As Honest Current-State Cluster Insight

**Files:**
- Modify: `src/pages/AnalysisPage.tsx`
- Modify: `src/shared/types/api.ts`
- Create: `src/shared/ui/InfoPanel.tsx`
- Test: manual browser verification via `npm run dev`

- [ ] **Step 1: Write the failing UX expectation**

```md
- Analysis page clearly states that it reflects realtime cluster updates
- Empty state explains why the page may be empty
- The page does not imply historical incidents or AI diagnosis exist yet
```

- [ ] **Step 2: Run local app to verify current mismatch**

Run: `npm run dev`
Expected: Analysis currently feels closer to a technical store dump than a confident MVP analysis screen.

- [ ] **Step 3: Write minimal implementation**

`src/pages/AnalysisPage.tsx`

```tsx
import { PageIntro } from "@shared/ui/PageIntro";

<PageIntro
  title="Analysis"
  description="This screen summarizes cluster updates already received in real time from the backend. Historical incidents and AI diagnosis details will arrive in a later backend wave."
/>
```

Add empty state:

```tsx
{rows.length === 0 ? (
  <section className="card">No cluster updates have been observed yet. Open Live Logs and wait for error activity.</section>
) : null}
```

- [ ] **Step 4: Run local app to verify it passes**

Run: `npm run dev`
Expected: Analysis becomes a truthful and useful current-state screen instead of an awkward placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AnalysisPage.tsx src/shared/types/api.ts src/shared/ui/InfoPanel.tsx
git commit -m "feat: reframe analysis around realtime cluster insight"
```

### Task 6: Make AI Chat An Intentional Future Feature

**Files:**
- Modify: `src/pages/AiChatPage.tsx`
- Test: manual browser verification via `npm run dev`

- [ ] **Step 1: Write the failing UX expectation**

```md
- AI Chat no longer feels broken
- The page clearly says the backend endpoint is not available yet
- The screen still fits the product narrative instead of feeling abandoned
```

- [ ] **Step 2: Run local app to verify current mismatch**

Run: `npm run dev`
Expected: Chat page currently reads as a raw placeholder interaction.

- [ ] **Step 3: Write minimal implementation**

Replace the mock chat feel with a deliberate coming-soon screen:

```tsx
<section className="card" style={{ minHeight: 420 }}>
  <h2 style={{ marginTop: 0 }}>AI Chat Is Planned</h2>
  <p style={{ color: "var(--text-muted)" }}>
    This frontend is already ready for the chat surface, but the backend chat endpoint is not connected yet.
    The next wave will let you ask questions across logs, clusters, incidents, and analytics.
  </p>
</section>
```

- [ ] **Step 4: Run local app to verify it passes**

Run: `npm run dev`
Expected: AI Chat feels intentionally deferred rather than unfinished.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AiChatPage.tsx
git commit -m "feat: reposition ai chat as planned capability"
```

### Task 7: Polish Settings And Local Runtime Usability

**Files:**
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/features/settings/store.ts`
- Modify: `src/features/settings/SettingsPanel.tsx`
- Test: manual browser verification via `npm run dev`

- [ ] **Step 1: Write the failing UX expectation**

```md
- Settings explain why they matter
- Defaults are obvious
- Reset path exists for local development
```

- [ ] **Step 2: Run local app to verify current mismatch**

Run: `npm run dev`
Expected: Settings work technically but do not yet communicate their role well enough for a polished MVP.

- [ ] **Step 3: Write minimal implementation**

Add store defaults and reset action:

```tsx
reset: () => set({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:8080",
  reconnectMinMs: 800,
  reconnectMaxMs: 10000
})
```

Add Settings intro and reset button:

```tsx
<PageIntro
  title="Settings"
  description="These values let you point the UI at your local backend and control websocket reconnect behavior during development."
  actions={<button className="button" onClick={reset}>Reset Defaults</button>}
/>
```

- [ ] **Step 4: Run local app to verify it passes**

Run: `npm run dev`
Expected: Settings become easier to understand and recover when local config drifts.

- [ ] **Step 5: Commit**

```bash
git add src/pages/SettingsPage.tsx src/features/settings/store.ts src/features/settings/SettingsPanel.tsx
git commit -m "feat: polish settings for local mvp usage"
```

### Task 8: Final MVP Verification And Frontend Notes

**Files:**
- Create: `docs/superpowers/specs/2026-04-09-frontend-next-wave-notes.md`
- Test: full app verification via `npm run build`

- [ ] **Step 1: Write the failing documentation expectation**

```md
- What the MVP now supports
- Which pages are strong enough for demo flow
- Which backend endpoints are still missing for next wave
- What to build next after MVP polish
```

- [ ] **Step 2: Run build to surface remaining failures**

Run: `npm run build`
Expected: FAIL until all prior tasks are complete and the app builds cleanly.

- [ ] **Step 3: Write minimal implementation**

`docs/superpowers/specs/2026-04-09-frontend-next-wave-notes.md`

```md
# Frontend Next Wave Notes

## MVP Now Covers

- overview dashboard
- containers selection
- live logs workflow
- realtime error awareness
- realtime cluster summary
- local runtime settings

## Demo Flow

- Overview -> Containers -> Live Logs -> Analysis

## Still Missing From Backend

- clusters REST endpoint
- incidents detail endpoint
- AI diagnosis detail endpoint
- chat endpoint

## Next Wave

1. cluster details page
2. incident drill-down
3. AI diagnosis view
4. AI chat integration
```

- [ ] **Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS, proving the MVP frontend compiles cleanly after the planned changes.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-04-09-frontend-next-wave-notes.md
git commit -m "docs: add frontend next wave notes"
```

## Self-Review

### Spec coverage

- MVP flow from overview to investigation is covered by Tasks 1 through 5.
- Honest handling of unfinished AI capability is covered by Task 6.
- Local runtime usability is covered by Task 7.
- Forward-looking MVP notes are covered by Task 8.

### Placeholder scan

- No unfinished placeholders remain.
- Each task includes files, verification commands, concrete implementation direction, and commit steps.

### Type consistency

- REST data remains under `entities/*/api.ts`.
- Realtime behavior remains under `features/realtime`.
- Route composition remains page-level.
- The plan preserves the existing frontend structure instead of introducing unrelated architecture churn.
