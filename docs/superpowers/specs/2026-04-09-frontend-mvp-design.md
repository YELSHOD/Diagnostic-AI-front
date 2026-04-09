# Frontend MVP Design For Diagnostic AI Front

## Goal

Turn the current `diagnostic-ai-front` project into a coherent MVP frontend for the existing `DiagnosticServiceAI` backend, focused on observability workflows: overview, container selection, live logs, and cluster/error analysis.

## Current Frontend Snapshot

The frontend already has a strong starting point:

- Vite + React + TypeScript
- React Router for page navigation
- TanStack Query for REST data fetching
- Zustand for realtime and settings state
- ECharts for analytics visualization
- Tailwind + custom CSS tokens for styling

Current routes:

- `OverviewPage`
- `ContainersPage`
- `LiveLogsPage`
- `AnalysisPage`
- `AiChatPage`
- `SettingsPage`

Current backend integrations already present:

- `GET /api/projects`
- `GET /api/analytics`
- `WS /ws/logs?containerId=...`

This means the frontend is not a blank project. It is already a meaningful skeleton with partial real integration.

## MVP Scope

This MVP should focus only on what the current backend can support reliably.

In scope:

- Overview dashboard
- Containers list
- Live logs page
- Realtime error display
- Realtime cluster updates
- Analysis page backed by current realtime state
- Settings for local API/WS endpoints

Out of scope for this MVP:

- Real AI chat backend integration
- Dedicated cluster details page
- Incident history page
- AI diagnosis detail screens
- Full investigation workflow over historical incidents

## Product Flow

The frontend should feel like one product, not separate pages.

Target user flow:

1. User lands on `Overview`
2. User sees current system state and recent operational picture
3. User navigates to `Containers`
4. User chooses a running container/service
5. User enters `Live Logs`
6. User watches live logs and latest error event
7. User moves to `Analysis` to inspect current cluster state

This flow should become the backbone of the MVP.

## Page-Level Design

### 1. Overview

Purpose:
Provide a quick operational snapshot.

Should show:

- active containers count
- total errors in recent time window
- top exception types
- top clusters
- errors-per-minute chart

Requirements:

- service filter should remain lightweight and fast
- empty analytics state should be explicit
- loading and failure states should be visually clear
- the page should provide navigation cues into `Containers` and `Live Logs`

### 2. Containers

Purpose:
Act as the selection point for log investigation.

Should show:

- container name
- image
- runtime status
- created timestamp
- primary action to open live logs

Requirements:

- loading, failure, and empty states must be present
- action to open logs must feel like the main CTA
- container cards/table rows should clearly communicate what is selectable

### 3. Live Logs

Purpose:
Be the primary investigation screen in the MVP.

Should show:

- websocket connection state
- live log stream
- text filter
- level filter
- latest error event summary

Requirements:

- no-container-selected state must be friendly and actionable
- connected/disconnected state must be obvious
- log stream must remain readable at high volume
- error summary should remain visually distinct from regular logs
- cluster updates received over websocket should continue feeding shared realtime state

### 4. Analysis

Purpose:
Summarize the current cluster picture using data already available in the frontend realtime store.

Should show:

- cluster key
- service
- count
- new/not new status
- first seen
- last seen

Requirements:

- this page must be honest about its data source
- it should not pretend to show historical incidents or AI diagnosis if backend endpoints do not exist yet
- it should include clear explanatory empty states when no cluster updates have been received yet

### 5. Settings

Purpose:
Support local development and runtime configuration.

Should show:

- API base URL
- WS base URL
- reconnect min/max values

Requirements:

- settings must be easy to edit locally
- values should persist in local state/store
- reset-to-default behavior would be useful in the next implementation wave

### 6. AI Chat

Purpose:
Remain visible as a future product direction without pretending to be complete.

Requirements:

- present it as a planned feature
- explain that backend chat endpoint is not connected yet
- avoid making the page feel broken or misleading

## Data Model Boundaries

The frontend should clearly separate REST-driven and realtime-driven data.

### REST-backed

- containers list
- analytics response for overview

### WebSocket-backed

- live logs
- latest error events
- cluster updates
- connected/disconnected realtime state

### Deferred / Not Yet Backed

- incident lists
- cluster detail history
- AI diagnosis detail retrieval
- AI chat answers

This separation is important so the frontend does not mix sources incorrectly or overpromise data fidelity.

## Architectural Direction

The existing folder structure is already good enough to continue with:

- `app` for bootstrapping and routing
- `entities` for backend-facing domain APIs
- `features` for stateful user-facing logic like realtime and settings
- `pages` for route composition
- `shared` for clients, types, helpers, and reusable UI
- `widgets` for reusable data visualization

Recommended refinement:

- keep REST query code under `entities/*/api.ts`
- keep websocket lifecycle and event normalization under `features/realtime`
- avoid moving backend contracts directly into pages
- keep pages responsible for composition, not for protocol details

## UX Priorities

This MVP is for a serious observability-style product, not a generic admin dashboard.

Priority outcomes:

- fast comprehension
- obvious navigation
- readable logs
- clear operational status
- visible distinction between normal flow and error flow

The frontend should feel credible for a thesis demo:

- not overloaded
- not fake-AI-heavy
- not full of dead-end pages
- not visually generic if refinements are made later

## Gaps Identified In Current Frontend

The current project is structurally promising, but these gaps remain:

- pages are not yet tied together into one strong product narrative
- `AnalysisPage` is currently too close to an internal debug view
- `AiChatPage` is a placeholder and should be presented more intentionally
- page-level empty/loading/error states are not yet consistently treated as first-class UX
- there is no explicit MVP boundary written down in the frontend project yet

## Recommended Implementation Order

1. Stabilize navigation and page relationships
2. Improve Overview and Containers as entry points
3. Promote Live Logs into the main working screen
4. Reframe Analysis as current cluster intelligence, not fake historical analytics
5. Reposition AI Chat as future capability
6. Polish settings and environment usability

## Success Criteria

This frontend MVP is successful when:

- it works cleanly with the current backend endpoints
- the user can move from overview to live investigation without confusion
- the logs page feels like the central operating surface
- the analysis page truthfully reflects current backend capabilities
- unfinished AI features are represented honestly, not awkwardly
- the app looks like an intentional product demo rather than disconnected prototype screens

## Next Step

After approval of this design, the next step is to create a detailed implementation plan for `diagnostic-ai-front` describing which files to change, in what order, and how to verify the MVP improvements.
