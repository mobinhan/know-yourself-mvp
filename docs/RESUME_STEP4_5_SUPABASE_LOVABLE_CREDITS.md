# Know Yourself (KY) Resume Checkpoint — Step 4/5 Live App Integration

Checkpoint date: 2026-10-12

## Resume instruction
Resume directly at the unresolved integration task: connect the existing Lovable app's runtime to the existing Supabase backend for authenticated persistence and continuity. Do not restart prior validation, rebuild the engine, create a new backend, or publish.

## Existing Lovable app
- Name: My Design Decoder (Know Yourself / Human Design Navigator)
- Project ID: `483abb3e-5e1f-49ef-8e5c-1d1f8df3e207`
- Editor: https://lovable.dev/projects/483abb3e-5e1f-49ef-8e5c-1d1f8df3e207
- Preview: https://id-preview--483abb3e-5e1f-49ef-8e5c-1d1f8df3e207.lovable.app
- Latest reported Lovable commit: `3f9841966f0b8af00c80b5b26ca8ff37106834f4`
- Last known project is not published. Do not publish without separate permission.
- Workspace: 3P Dating (user has confirmed this is their only Lovable workspace).

## Existing Supabase backend (already accessible via Supabase tools)
- Project ref: `djtpqqjenmcsrdcguttk`
- URL: https://djtpqqjenmcsrdcguttk.supabase.co
- Status: ACTIVE_HEALTHY
- Existing Edge Function: `user-data-api`, ACTIVE, version 5, `verify_jwt=true`.
- Existing RLS-protected tables include `ky_profiles`, `ky_user_preferences`, `ky_charts`, `ky_conversations`, `ky_conversation_turns`, `ky_user_memories`, `ky_saved_insights`, `ky_transit_snapshots`, and knowledge tables.
- These tables currently reported zero rows.
- The user was right that the backend already exists and can be accessed by the connected Supabase tools. Do not ask them to create another Supabase project or workspace.
- Lovable's linked Supabase organization modal listed `Payday`; this does not by itself prove the app runtime is connected. Do not remove or modify that organization without need.
- Public publishable key is available through Supabase project key management. Never expose/use any service-role key in client code. Prefer a secure environment variable/config approach for the public key if supported.

## Step 4 status — Live reasoning
The latest Lovable agent turn added:
- `src/lib/hd/ask-context.ts`
- `src/lib/hd/ask-context.test.ts`
- Modified `src/routes/api/ask.ts`
Reported by Lovable: 23 tests passed, including four new tests, and typecheck clean. No live AI response was confirmed.
The Ask prompt now treats deterministic facts as read-only, separates natal facts from temporary transit-completed channels/centres, and refuses to invent exact lifecycle dates.
Solar Return dates are computed in the current app's context builder. Saturn Return, Uranus Opposition, Chiron Return, and nodal cycles are explicitly unavailable until exact deterministic computations exist.
Important: this is a minimal app-local adapter, not proof that the full canonical repository 3Framework modules have been wired into the Lovable runtime.

## Step 5 status — Persistence / continuity
Not yet implemented in the Lovable runtime. The current `src/routes/api/health.ts` still reports persistence unavailable, and inspected app files did not show an active Supabase client or a call to `user-data-api`.
The existing Edge Function already requires a valid Bearer token, validates the current user, and has user-scoped routes including profile/preferences/charts; inspect its full source for the exact conversations and conversation-turn routes before coding. Do not guess unsupported endpoints.
Needed:
1. Add/use the official Supabase JS client in the existing app with the project URL and public publishable key only.
2. Implement passwordless email sign-in (magic link/OTP) and persisted auth session; keep guest mode fully usable without persistence.
3. Call `https://djtpqqjenmcsrdcguttk.supabase.co/functions/v1/user-data-api` with the authenticated user's access token and public key.
4. Inspect the current Edge Function's actual route handlers and use existing supported routes/schema; no duplicate tables or schema changes.
5. Save and restore conversation turns with sufficient chart/profile context; query only the authenticated user's records.
6. Apply preferences/personalization only when the user has explicitly consented; do not silently save inferred sensitive details.
7. Health/status must distinguish configured, authenticated, and persistence round-trip success; never report writes as successful without checking errors.
8. Add small integration tests and run build/typecheck when feasible. Do not run broad validation as a substitute for implementation.

## Current hard blocker
On 2026-10-12, a direct attempt to send the next implementation request through Lovable returned:
`Your workspace is out of credits, so Lovable can't send this message. Add credits or update your plan on the payments page, then retry.`
Billing link returned by Lovable: https://lovable.dev/settings/billing
No Step 5 edits were made by that blocked attempt. No publish/deploy occurred.

## Resume workflow
- Continue on the existing project `483abb3e-5e1f-49ef-8e5c-1d1f8df3e207` after Lovable credits are available.
- First inspect current project files/commit and full Edge Function routes (read-only).
- Then implement Step 5 in the existing app using the existing Supabase project and function.
- Do not create a new project, duplicate tables, modify `main` wholesale, use unapproved deployment, or use Vercel.
- Preserve current UI and deterministic chart engine. Keep GitHub source of truth and use isolated feature branch for canonical repository changes.
- The user explicitly requested saving this checkpoint so a new chat can resume specifically at this part.

## Resume verification — 2026-10-14
- Re-checked the live Lovable project read-only. Latest project commit is b3fda8a71ebb4b85c2c463b32a545d38490c46b2 (2026-10-13, “Moved transit out of chat dock”), newer than the prior checkpoint commit. Recent edits also include “Pinned Ask box at bottom”; these are UI changes, not the blocked persistence increment.
- Current src/routes/api/health.ts still returns persistence unavailable with reason “No database connected; charts are not stored.”; current package.json does not include @supabase/supabase-js. This confirms Step 5 is still not wired in the existing Lovable runtime.
- The latest project agent turn is finished. No new implementation request was sent during this resume because the last confirmed blocker is exhausted Lovable workspace credits. No edits, publish, or deployment were made in this session.
- Next action remains: after credits are restored, continue in the same Lovable project with authenticated email OTP/magic-link, guest-safe mode, existing Supabase user-data-api integration, honest persistence health, and focused tests. Do not create a new project/backend or publish.
