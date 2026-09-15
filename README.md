# Job Queue Management System

A full-stack Job Queue Management application built with **NestJS** (Backend) and **React** (Frontend).

## 📁 Repository Architecture

```
Job Queue/
├── backend/    # NestJS REST & WebSockets Backend (SQLite + TypeORM)
├── frontend/   # React 18 + Vite + Tailwind CSS Frontend
└── README.md   # Setup and architectural design decisions
```

---

## 🌐 Live Deployment Guide (Vercel + Render)

### 1. Deploy Backend on Render
1. Create a free account at [Render](https://render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository containing the `Job Queue` folder.
4. Set the following parameters:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main.js`
5. Click **Deploy Web Service**.
6. Once deployed, copy your live backend URL (e.g. `https://job-queue-backend.onrender.com`).

---

### 2. Deploy Frontend on Vercel
1. Create a free account at [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project** and import your GitHub repository.
3. Set the following parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Your Render live backend URL (e.g. `https://job-queue-backend.onrender.com`)
5. Click **Deploy**.
6. Open your live Vercel URL to access the Job Queue Dashboard!

---

## 🛠️ Local Development & Features

### Backend (NestJS)
- Persistent database storage using **SQLite** with TypeORM.
- Strict **State Machine Workflow Rules**: `pending` → `running` → `completed` or `failed`.
- **Atomic Concurrency Protection**: Prevents race conditions when multiple users/tabs attempt to change a job's status simultaneously.
- **Real-time WebSockets**: Uses Socket.IO to broadcast state changes instantly to connected clients.

### Frontend (React)
- **Status Dashboard**: Live counters for `Total`, `Pending`, `Running`, `Completed`, and `Failed` jobs.
- **Filter & Search**: Filter job list by status pills or search by title/category.
- **Job Creation Modal**: Create new jobs with predefined category presets.
- **Status Action Triggers**: Start background workers, complete, fail, or delete jobs.
- **Real-time Sync & Error Handling**: Displays conflict warning alerts when concurrent state collisions occur.

---

## 🔌 API Endpoints

- `POST /jobs` — Create a new job (`title`, `type`)
- `GET /jobs` — Retrieve all jobs (supports `?status=pending` and `?search=query`)
- `GET /jobs/stats` — Retrieve status counters
- `PATCH /jobs/:id/status` — Update job status (`pending` → `running` → `completed` / `failed`)
- `POST /jobs/:id/run` — Trigger simulated worker execution
- `DELETE /jobs/:id` — Delete a job

---

## 🧠 System Architecture & Design Questions

### 1. Where should state rules be enforced?
State machine transition rules are enforced strictly inside the backend service layer (`backend/src/jobs/jobs.service.ts`). The React frontend provides visual cues, but the NestJS backend guarantees data integrity.

### 2. What happens if someone bypasses the React application and calls the API directly?
Even if a user makes direct HTTP requests via `curl` or Postman, the backend validates every request against allowed transition rules:
- Allowed: `pending` → `running`, `running` → `completed` or `failed`.
- Forbidden: `completed` → `running`, `failed` → `running`, or `pending` → `completed`.
Invalid requests return a `400 Bad Request` or `409 Conflict` error.

### 3. What happens when two requests arrive at nearly the same time? (Race Condition Safety)
If two users/tabs attempt to change the status of the same job at the exact same moment:
The backend executes an atomic database update statement:
```sql
UPDATE jobs 
SET status = 'running', progress = 10 
WHERE id = :id AND status = 'pending';
```
- **First Request**: Updates 1 row and succeeds.
- **Second Request**: Finds 0 matching rows (because status is no longer `pending`), fails atomically, and receives a `409 Conflict` response.
- **UI Handling**: The frontend catches the 409 error and displays a non-intrusive warning alert to the user.

### 4. How would you prevent an invalid or inconsistent state?
By combining atomic SQL update queries with TypeORM transactions and real-time Socket.IO WebSocket broadcasts. Whenever a job changes state, all connected tabs update automatically without needing manual page reloads.

---

## 🎁 Bonus Production-Ready Improvement

### Real-Time Socket.IO WebSockets & Atomic SQL Guard
In production environments, background jobs are processed asynchronously.
1. **Socket.IO Integration**: Eliminates continuous HTTP polling by pushing live state events (`jobCreated`, `jobUpdated`, `jobDeleted`, `statsUpdated`) directly to open browser tabs.
2. **Atomic SQL State Guard**: Guarantees that no background job can be double-processed by concurrent worker instances.

---

## 🚀 Running Locally

### 1. Start NestJS Backend
```bash
cd backend
npm install
npm run start:dev
```
*Backend runs on `http://localhost:3000` (APIs available at both `/jobs` and `/api/jobs`).*

### 2. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173/`.*
