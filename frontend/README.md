# Job Queue Frontend (React)

A clean user interface for managing job queues built with **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Socket.IO-client**.

## Features

- **Status Dashboard**: Live counters for Total, Pending, Running, Completed, and Failed jobs.
- **Queue Controls**: Status filter pills, search bar, and action triggers (`Start Worker`, `Complete`, `Fail`, `Delete`).
- **Real-Time WebSockets**: Instant updates across open browser tabs without page reloads.
- **Concurrency Alerts**: Displays warning alerts if concurrent state collisions occur.

## Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
