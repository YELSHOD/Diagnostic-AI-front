# Frontend Demo-Ready Plan

## Current Status

Completed:
- product shell and navigation polished
- overview, containers, live logs, analysis, settings, and AI chat presentation improved
- localization added for `RU / KZ / EN`
- sidebar collapse, theme toggle, header/footer, profile menu, and motion polish implemented
- frontend build verified successfully during the current wave

Next planned wave:
- add real authentication flow connected to backend
- replace placeholder profile menu state with backend-driven user identity
- add `Login`, `Register`, and `Account / Учетные данные` pages
- protect main routes behind session state
- wire logout and current-user loading into header/profile menu

Auth should now be treated as the next major frontend milestone after the demo-ready shell polish.

## Execution Principle
Polish the existing MVP in-place. Do not invent new backend dependencies. Keep the current route map, but raise the product quality and presentation level.

## Task 1: Strengthen the product shell
- Refine the sidebar heading and supporting copy so the app feels like an observability product, not a route list.
- Add a compact product subtitle or system framing in the shell.
- Make the current route context more obvious.
- Review spacing and first-screen composition for desktop and laptop demo use.

## Task 2: Upgrade Overview into a presentation dashboard
- Improve KPI card labeling and supporting copy.
- Add clearer section framing for trends and top problem summaries.
- Improve empty and error states so they still look intentional on a quiet system.
- Add stronger CTA flow toward Containers and Live Logs.

## Task 3: Polish Containers for selection and handoff
- Improve status readability.
- Add supporting metadata or explanatory text where useful.
- Make the “open live logs” handoff feel like the obvious next step.
- Ensure the empty state explains why no containers may appear.

## Task 4: Improve Live Logs as the main investigation screen
- Strengthen the selected-container context.
- Improve filter layout and visual grouping.
- Make stream state more legible.
- Improve latest error presentation so it reads like an incident card, not just raw text.
- Add clearer empty states when no container is selected or no logs have arrived yet.

## Task 5: Improve Analysis readability
- Keep the current realtime-backed scope.
- Make summary cards and table framing easier to present.
- Add stronger explanatory copy about what the page does and does not represent yet.
- Improve the no-data experience.

## Task 6: Stage AI Chat deliberately
- Keep the route visible.
- Make the page visually intentional as a future feature.
- Show what questions it will answer later.
- Link the page back into the current working flow.

## Task 7: Finish Settings for cross-device local work
- Keep API/WS configuration obvious.
- Preserve reset defaults.
- Improve copy to reflect working from multiple machines and changing local ports.
- Ensure the page is useful for real demo setup, not just internal development.

## Task 8: Final review and next notes
- Run a full frontend build.
- Capture any remaining UI debt or backend dependencies in notes.
- Leave a clean checkpoint for the later migration/database phase.

## Next Phase: Frontend Auth

### Task 9: Add auth state and token handling
- store `accessToken`, `refreshToken`, `currentUser`, and auth status
- attach bearer token to backend API requests
- clear session when refresh fails

### Task 10: Add auth pages
- `LoginPage`
- `RegisterPage`
- `AccountPage`

### Task 11: Protect routes
- keep login/register public
- protect the main shell routes
- redirect unauthenticated users to login

### Task 12: Connect profile menu and account page
- replace placeholder profile summary with backend user data
- replace generic menu action with `Учетные данные`
- support account update and password change

## Verification
- `npm run build`
- manual visual sanity review of the main pages if needed later
