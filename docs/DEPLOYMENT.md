# 🚀 Deployment Guide

This guide explains how to deploy the Bank Saving System using **Railway** for the backend and **Cloudflare Pages** for the frontend.

## 1. Backend Deployment (Railway)

### Steps:
1.  **Login to Railway**: Go to [railway.app](https://railway.app/).
2.  **Create New Project**: Click "New Project" -> "Deploy from GitHub repo".
3.  **Select Repository**: Choose your `bank-saving-system` repository.
4.  **Configure Root Directory**:
    *   Railway should detect the monorepo. Set the **Root Directory** to `backend`.
5.  **Add Persistent Volume (Optional but Recommended)**:
    *   By default, Railway file systems are ephemeral. To keep your SQLite data:
    *   Go to **Settings** -> **Volumes** -> **Add Volume**.
    *   Mount path: `/data`.
6.  **Set Environment Variables**:
    *   `PORT`: `8000`
    *   `NODE_ENV`: `production`
    *   `DATABASE_PATH`: `/data/database.sqlite` (if using a volume) or `./database.sqlite` (ephemeral)
    *   `FRONTEND_URL`: `https://your-app.pages.dev` (Your Cloudflare Pages URL)
7.  **Deploy**: Railway will build and deploy your backend. Copy the generated domain (e.g., `https://backend-production.up.railway.app`).

---

## 2. Frontend Deployment (Cloudflare Pages)

### Steps:
1.  **Login to Cloudflare**: Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  **Workers & Pages**: Navigate to "Workers & Pages" -> "Create application" -> "Pages" -> "Connect to Git".
3.  **Select Repository**: Choose your `bank-saving-system` repository.
4.  **Configure Build Settings**:
    *   **Project Name**: `bank-save` (or your choice).
    *   **Framework Preset**: `Vite`.
    *   **Build Command**: `npm run build`
    *   **Build Output Directory**: `dist`
    *   **Root Directory**: `frontend`
5.  **Set Environment Variables**:
    *   `VITE_API_URL`: `https://your-backend.up.railway.app/api` (The Railway URL you copied earlier).
6.  **Deploy**: Click "Save and Deploy".

### SPA Routing:
The project includes a `frontend/public/_redirects` file which Cloudflare Pages uses to handle client-side routing. This ensures that refreshing the page on `/customers` or `/accounts` doesn't result in a 404.

---

## 3. Summary of URLs

| Service | Provider | URL Example |
|---------|----------|-------------|
| **Frontend** | Cloudflare Pages | `https://bank-save.pages.dev` |
| **Backend API** | Railway | `https://backend-production.up.railway.app` |
| **API Docs** | Railway | `https://backend-production.up.railway.app/api-docs` |
