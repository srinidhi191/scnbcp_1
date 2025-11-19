SCNBCP — Deployment guide
==========================

This repository contains two apps:

- apps/api — Node + Express API (TypeScript)
- apps/web — React + Vite frontend (TypeScript)

This document shows recommended, low-effort ways to deploy both apps and get a public deploy link. I provide Render.com instructions (recommended) plus a Vercel/static alternative for the frontend.

Prerequisites
-------------

- A GitHub repo containing this project (recommended).
- Accounts on Render (https://render.com) and/or Vercel/Netlify (optional).
- Production environment variables (see below):
  - MONGO_URI (or MONGO_URL) — MongoDB connection string
  - JWT_SECRET — a strong secret for signing JWTs
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS — (optional) for email sending
  - CLIENT_URL — frontend URL (useful for CORS)

Option A — Deploy both API and frontend to Render (recommended)
----------------------------------------------------------------

Render is simple for full-stack apps: create a web service for the API (using Dockerfile) and a static site for the frontend.

1. Push your repo to GitHub (if not already).
2. Sign in to https://render.com and connect your GitHub account.
3. Create the API service:
   - Click New → Web Service.
   - Choose the repo and branch (main).
   - Environment: Docker.
   - Dockerfile path: `apps/api/Dockerfile` (this repo includes one).
   - Build and start commands: Render will use the Dockerfile's image; no extra commands needed.
   - Set environment variables in Render (MONGO_URI, JWT_SECRET, SMTP_* etc.).
   - Set the port to 4000 if Render asks (the Dockerfile exposes 4000). If using a managed environment Render will map the service port.
   - Create the service. Render will build the Docker image, run `npm run build` inside the builder stage, and start the container.

4. Create the frontend static site:
   - Click New → Static Site.
   - Choose the same repo and branch.
   - Root: `apps/web` (or leave default and set build commands).
   - Build command: `npm ci && npm run build` (Render will run it in `apps/web` if you set the root).
   - Publish directory: `apps/web/dist`.
   - Set environment var `VITE_API_BASE` or `VITE_APP_API_URL` if you need to point the frontend to the API (this project uses `http://127.0.0.1:4000` by default; override to the Render API URL e.g., `https://scnbcp-api.onrender.com`).
   - Create the static site — you'll get a public URL like `https://scnbcp-web.onrender.com`.

After both services are live you'll have two public links: one for the API and one for the frontend. In Render you can point frontend configuration (env) to the API project's URL so the frontend talks to the deployed API.

Option B — Frontend on Vercel / Netlify, API on Render/Other
----------------------------------------------------------------

1. Deploy API as in Option A.
2. Deploy frontend to Vercel:
   - Sign in to https://vercel.com and import the repo.
   - When prompted, set the root directory to `apps/web`.
   - Build command: `npm ci && npm run build`.
   - Output directory: `dist`.
   - Set an Environment Variable (in Vercel project settings) to point to the API, e.g. `VITE_API_BASE=https://scnbcp-api.onrender.com` (match the variable name used in your frontend to build the correct baseURL).
   - Deploy — Vercel will give you a public URL.

Notes / Tips
------------

- Socket.io considerations: The API uses socket.io. Render's Docker-based web service will support WebSocket traffic. Serverless platforms like Vercel functions are not suitable for long-lived socket.io servers — use Render/Render's Docker, Fly.io, or other container host for the API.
- File uploads: The API stores uploaded files in `apps/api/uploads` (disk). On most platform containers the filesystem is ephemeral — for production you should configure persistent storage (Render Disk or use an S3-compatible object store and update the upload code to push files to S3). For quick testing, you can use the ephemeral disk but beware files will not persist across restarts.
- Environment variables: Do NOT commit production secrets. Set them in the hosting provider's dashboard (Render/Vercel/Netlify).
- CORS / CLIENT_URL: Ensure the API `CLIENT_URL` env or CORS settings include the deployed frontend origin.

Automating with GitHub Actions (optional)
---------------------------------------

If you prefer automatic deployment via GitHub Actions you'll need to set provider tokens as repository secrets (for Render/Vercel/Netlify) and write workflows that call provider APIs or use official actions. I can add a workflow template for Vercel/Netlify if you want; you will still need to add secrets (API keys) in the repo settings.

What I added to this repo to ease deployment
--------------------------------------------

- `apps/api/Dockerfile` — multi-stage Dockerfile to build and run the API.
- `apps/api/.dockerignore` — to speed up Docker builds and avoid leaking secrets.

Next steps I can take for you
----------------------------

- Create a `render.yaml` to fully automate Render service creation (I can do that, but you'll still need to connect Render + GitHub and provide secrets).
- Add a GitHub Actions workflow that builds the frontend and deploys it to GitHub Pages (quick), or a workflow to call Vercel/Netlify/Render APIs (requires API tokens as secrets).
- Replace local-disk uploads with S3-compatible storage and add required env/config (recommended for production).

Tell me which of the Next steps you'd like me to do and I'll implement it (I can add a Render YAML or a GitHub Actions workflow template next). If you want me to attempt an automated deploy, tell me which provider to target and I will prepare the workflow and instructions for required secrets.
