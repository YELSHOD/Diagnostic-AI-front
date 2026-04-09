# Frontend Next Wave Notes

## What Is Stabilized
- The frontend now follows a clear MVP monitoring path: `Overview -> Containers -> Live Logs -> Analysis`.
- Shared page intros clarify the purpose of each screen and connect the flow with explicit actions.
- `Overview` handles loading, error, and empty states more honestly against the current backend.
- `Containers` is framed as the handoff into live investigation rather than a detached list page.
- `Live Logs` resets stream state when the selected container changes, so logs and cluster updates do not bleed across sessions.
- `Analysis` only shows the realtime cluster read model that the backend currently emits.
- `AI Chat` is intentionally marked as a planned feature instead of a fake interactive screen.
- `Settings` now supports quick local reconfiguration and a reset-to-default path for demos.

## Current Stop Point
- The frontend MVP is aligned with the backend that exists today.
- Build verification passes with `npm run build`.
- The remaining technical debt is mostly around scale and deeper data models, not around the basic user flow.

## Known Gaps
- `Analysis` still depends on websocket-derived state because there is no persisted cluster/incidents read API yet.
- The bundle is large and should be split later if performance becomes a concern.
- `AI Chat` still needs backend endpoints and a true conversation state model.
- There is no dedicated incidents detail page or cluster drill-down screen yet.
- Error filtering in `Live Logs` is still lightweight and can become richer.

## Recommended Next Backend Contracts
- `GET /api/clusters`
- `GET /api/clusters/{clusterKey}`
- `GET /api/clusters/{clusterKey}/incidents`
- `GET /api/clusters/{clusterKey}/ai-diagnosis`
- `POST /api/chat`

## Recommended Next Frontend Wave
1. Add persisted cluster and incident views once the backend read models exist.
2. Introduce route-level code splitting to reduce the heavy initial bundle.
3. Add filters for log level, exception type, and service on the analysis side.
4. Build a real AI chat page once the chat backend is exposed.
5. Add cluster detail and incident timeline pages for deeper investigation during demos.
