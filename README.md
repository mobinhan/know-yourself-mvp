# Know Yourself MVP

Know Yourself is an AI-powered Human Design companion built around a deterministic chart engine, verified source evidence, interpretation, and a warm conversational experience.

## Current website

This repository contains the V22 website build as the initial deployable front-end artifact.

The front-end expects the Know Yourself API routes used by the V22 build for chart creation, birthplace/timezone resolution, transit/today calculations, knowledge retrieval, and contextual questions.

## Build and live app

Lovable is the primary web-app build and live-preview environment for this project. GitHub stores source and checkpoints; GitHub Actions runs regression tests; Supabase provides backend/data services.

Vercel is not part of the project workflow. Do not add Vercel deployment configuration or rely on Vercel for the live app. A separate deployment platform may be introduced later only by an explicit project decision.

Do not add secrets or API credentials to this repository.
