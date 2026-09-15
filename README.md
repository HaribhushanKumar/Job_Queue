# 🚀 Mini Job Queue Dashboard

A full-stack Job Queue Management application built with **React.js** on the frontend and **NestJS** on the backend, deployed live on Vercel and Render.

---

## 🌐 Live URLs & Links

- **Live Frontend (Vercel)**: [https://job-queue-beta.vercel.app/](https://job-queue-beta.vercel.app/)
- **Live Backend API (Render)**: [https://job-queue-5mzz.onrender.com/](https://job-queue-5mzz.onrender.com/)
- **GitHub Repository**: [https://github.com/HaribhushanKumar/Job_Queue.git](https://github.com/HaribhushanKumar/Job_Queue.git)

---

## 🏗️ Tech Stack & Structure

```
Job Queue/
├── backend/    # NestJS REST API & WebSockets Engine (SQLite + TypeORM)
├── frontend/   # React 18 + Vite + Tailwind CSS User Interface
└── README.md   # Project documentation & architectural decisions
```

---

## 🔌 API Endpoints

- `POST /jobs` — Create a job (`title`, `type`)
- `GET /jobs` — Retrieve all jobs (supports `?status=pending` and `?search=query`)
- `GET /jobs/stats` — Retrieve status counters summary
- `PATCH /jobs/:id/status` — Update status (`pending` → `running` → `completed` / `failed`)
- `DELETE /jobs/:id` — Delete a job

---

## 🧠 System Architecture & Concurrency Decisions

### 1. Where are state rules enforced?
State machine transition rules are enforced strictly inside the NestJS service layer (`backend/src/jobs/jobs.service.ts`). The React frontend provides visual cues, but true business invariants are guaranteed by the server.

### 2. What happens if someone bypasses the React application and calls the API directly?
The NestJS backend checks every status update against the allowed transition matrix (`pending` → `running` → `completed` or `failed`). Invalid transitions (such as `completed` → `running` or `failed` → `running`) return a `400 Bad Request` or `409 Conflict` error.

### 3. What happens when two requests arrive at nearly the same time? (Race Conditions)
If two users/tabs attempt to change a `pending` job to `running` simultaneously, the backend executes an **atomic SQL query**:
```sql
UPDATE jobs 
SET status = 'running', progress = 10 
WHERE id = :id AND status = 'pending';
```
- **First Request**: Updates 1 row and succeeds.
- **Second Request**: Finds 0 matching rows (since status is no longer `pending`), fails atomically, and receives a `409 Conflict` error.
- **Frontend UI**: Catches the conflict response and displays a non-intrusive warning alert to the user.

### 4. How to prevent invalid or inconsistent state?
By combining atomic SQL update statements with TypeORM transactions and real-time Socket.IO WebSockets so all connected browser clients sync state changes immediately without manual page reloads.

---

## 🎁 Bonus Production-Ready Improvement

### Real-Time Socket.IO WebSockets & Atomic State Guard
1. **Socket.IO Integration**: Pushes real-time events (`jobCreated`, `jobUpdated`, `jobDeleted`, `statsUpdated`) to open browser tabs, eliminating unnecessary HTTP polling.
2. **Atomic SQL State Guard**: Prevents background job double-execution across worker instances.

---

## 🚀 Local Setup

### 1. Start NestJS Backend
```bash
cd backend
npm install
npm run start:dev
```
*Backend runs on `http://localhost:3000`.*

### 2. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173/`.*
