# Diagnostic Observability UI

React + TypeScript frontend for your `DiagnosticServiceAI` backend.

## Stack
- React 18 + Vite + TypeScript
- React Router
- TanStack Query
- Zustand
- ECharts
- TailwindCSS (with custom CSS tokens)

## Architecture
- `src/app`: app bootstrapping, router, providers, global styles
- `src/pages`: route pages (`Overview`, `Containers`, `Live Logs`, `Analysis`, `AI Chat`, `Settings`)
- `src/widgets`: reusable visual widgets (charts)
- `src/features`: business features (`realtime`, `settings`)
- `src/entities`: API-facing domain modules (`container`, `analytics`)
- `src/shared`: shared types, clients, base UI components

## Backend Integration
- `GET /api/projects`
- `GET /api/analytics?from=&to=&service=`
- `WS /ws/logs?containerId=`

AI chat endpoint is intentionally pluggable and currently shows fallback response:
`AI chat backend endpoint is not connected yet`.

## Run
1. `cd C:\Users\yelsh\VsCodeProjects\diagnostic-observability-ui`
2. `copy .env.example .env`
3. `npm install`
4. `npm run dev`

## Env
- `VITE_API_BASE_URL=http://localhost:8080`
- `VITE_WS_BASE_URL=ws://localhost:8080`

## Recommended next backend endpoints
1. `GET /api/clusters`
2. `GET /api/clusters/{clusterKey}/incidents`
3. `GET /api/clusters/{clusterKey}/ai-diagnosis`
4. `POST /api/chat`
