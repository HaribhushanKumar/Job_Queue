# Job Queue Backend (NestJS)

A robust backend engine for managing job queues built with **NestJS**, **SQLite**, **TypeORM**, and **Socket.IO WebSockets**.

## APIs

- `POST /jobs` — Create a job (`title`, `type`)
- `GET /jobs` — List all jobs (supports `?status=pending` and `?search=query`)
- `GET /jobs/stats` — Status counters summary
- `PATCH /jobs/:id/status` — Safely change status with state machine & concurrency check
- `POST /jobs/:id/run` — Trigger simulated worker execution
- `DELETE /jobs/:id` — Delete job record

## Run Locally

```bash
# Install dependencies
npm install

# Start in dev mode
npm run start:dev
```
