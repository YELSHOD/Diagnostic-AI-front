# Frontend Demo-Ready Design

## Goal
Turn `diagnostic-ai-front` from a solid MVP into a demo-ready observability frontend for the dissertation project without waiting for new backend features.

## Product Positioning
The frontend should present the project as a compact local-first observability system:
- overview of the system state
- list of visible containers/services
- live logs and latest error inspection
- current cluster analysis
- clear path for future AI functionality

This is not the phase for building full incident drill-downs or a real AI chat experience. The objective is a confident, coherent product shell that matches the backend that exists today.

## Demo-Ready Definition
The frontend is considered demo-ready when:
- the navigation feels like a single workflow, not isolated pages
- every page has strong loading, error, and empty states
- the user can move naturally from system overview to live investigation
- the live logs experience feels intentional and informative
- future features are visible but not misleading
- the interface looks presentation-worthy rather than purely developer-oriented

## Target UX Flow
1. `Overview`
Shows the health and current error landscape.
Primary action pushes the user toward containers and active investigation.

2. `Containers`
Acts as the decision screen for what to inspect.
Primary action opens the chosen container in live logs.

3. `Live Logs`
Becomes the main operational screen.
Should clearly show selected target, connection state, filter state, log stream, and latest detected error.

4. `Analysis`
Summarizes the cluster view that currently comes from realtime updates.
Must be honest about current backend limits while still feeling useful.

5. `Settings`
Supports local development and demo setup from different machines or ports.

6. `AI Chat`
Remains visible but explicitly marked as upcoming so it supports the story of the product without pretending to be complete.

## Design Priorities
- Strong hierarchy in page headers and actions
- Cleaner transitions between pages
- Better readability of operational information
- Fewer “raw admin panel” vibes
- Honest communication about what is live now vs. planned next

## Remaining Frontend Gaps
- The shell is functional but still visually plain for a dissertation demo.
- `Overview` could surface stronger callouts and summary cards.
- `Containers` is usable but can do a better job showing status and guiding the next action.
- `Live Logs` needs a more polished investigation layout and clearer stream feedback.
- `Analysis` should feel more like a readable summary page than a temporary table.
- `AI Chat` should look intentionally staged for the next wave.
- `Settings` is useful but still minimal.

## Non-Goals For This Wave
- Full incidents UI
- Real AI chat backend integration
- Persisted diagnosis explorer
- Large-scale frontend architecture changes
- Backend contract redesign

## Outcome
After this wave, the frontend should be ready to show as a cohesive `mini-Elastic + AI-ready` dissertation product, while staying truthful to the backend that currently exists.
