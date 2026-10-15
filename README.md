# Employee & Task Management System

MERN stack app for managing employees, assigning tasks to them and tracking workload on a dashboard.

- **Frontend:** React 18 (Vite), React Router, React-Bootstrap, Axios, React-Toastify
- **Backend:** Node.js, Express, MongoDB with Mongoose

All business rules are enforced in the backend. The frontend repeats the basic field validation only to give quicker feedback.

## Project structure

```
backend/
  scripts/seed.js        sample data for local testing
  src/
    config/              db connection
    constants/           departments, statuses, transitions, limits
    models/              Employee, Task, Counter (for TSK-xxx ids)
    validators/          request body validation
    services/            business logic (rules live here)
    controllers/         request/response handling
    routes/
    middlewares/         404 + error handler
    utils/               dates, pagination, csv, ApiError
    app.js / server.js   server.js is used locally / on Render
  api/index.js           Vercel serverless entry
frontend/
  src/
    api/                 axios client + one file per resource
    components/
      common/            reusable bits (pagination, badges, dialogs, form field...)
      layout/            navbar + layout
      employees/ tasks/ dashboard/
    hooks/               useFetch, useUrlFilters
    pages/               route level screens
    utils/               dates, validators, error helpers
    constants/
    styles/
```

## Setup

Requirements: Node 18+ and a MongoDB instance (local or MongoDB Atlas).

### Backend

```bash
cd backend
cp .env.example .env     # then edit the values
npm install
npm run seed             # optional - loads sample employees and tasks (clears existing data)
npm run dev              # http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

### Environment variables

**backend/.env**

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Port for the API | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/ems` |
| `CLIENT_URL` | Allowed CORS origin(s), comma separated | `http://localhost:5173` |
| `APP_TIMEZONE` | Timezone used to decide "today" for overdue | `Asia/Kolkata` |

**frontend/.env**

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_URL` | Backend base URL including `/api` | `http://localhost:5000/api` |

## Deployment

Both apps can be deployed from the same repo as two separate projects.

**Option A - everything on Vercel**

1. Backend: New Project -> import the repo -> Root Directory `backend`, Framework Preset `Other`. Add env variables `MONGODB_URI`, `CLIENT_URL` (frontend URL, can be added after step 2) and `APP_TIMEZONE`. `backend/api/index.js` is the serverless entry and `backend/vercel.json` sends every path to it, so the API is at `https://<backend>.vercel.app/api/...`.
2. Frontend: New Project -> same repo -> Root Directory `frontend`, Framework Preset `Vite`. Add `VITE_API_URL=https://<backend>.vercel.app/api`.
3. Put the frontend URL in the backend `CLIENT_URL` and redeploy the backend.

**Option B - backend on Render**

Web Service -> root directory `backend`, build `npm install`, start `npm start`, same env variables. Frontend on Vercel/Netlify as above (`public/_redirects` covers Netlify).

In MongoDB Atlas, Network Access must allow `0.0.0.0/0` because Vercel/Render don't have fixed IPs.

## API overview

Base URL: `/api`. List endpoints return `{ data, pagination: { page, limit, total, totalPages } }`.
Errors return `{ message, errors? }` where `errors` is a field -> message map.

### Employees

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/employees` | List. Query: `search` (name, email, ID), `department`, `status`, `sortBy` (`createdAt`, `name`, `employeeId`, `joiningDate`), `order`, `page`, `limit` |
| GET | `/employees/options` | Light list for the assign dropdown |
| GET | `/employees/:id` | Details |
| POST | `/employees` | Create |
| PUT | `/employees/:id` | Update |
| DELETE | `/employees/:id` | Delete (blocked while the employee has open tasks) |

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/tasks` | List. Query: `search` (title, employee name, task ID), `department`, `priority`, `status`, `dueFrom`, `dueTo`, `overdue=true`, `employee`, `sortBy` (`createdAt`, `dueDate`, `priority`, `title`), `order`, `page`, `limit` |
| GET | `/tasks/export` | CSV of **all** tasks matching the same filters (no pagination) |
| GET | `/tasks/:id` | Details |
| POST | `/tasks` | Create (always starts as `Todo`) |
| PUT | `/tasks/:id` | Edit fields. Rejects `status` / `completedDate` and Completed/Cancelled tasks |
| PUT | `/tasks/:id/status` | Change status `{ "status": "In Progress" }` |
| DELETE | `/tasks/:id` | Delete |

`department`, `priority` and `status` filters also accept comma separated values (`priority=High,Critical`). All filters are combined with AND.

### Dashboard

`GET /dashboard` - employee counts by status, task counts by status, overdue count and workload (active + overdue tasks per employee). Everything is calculated with aggregation queries on the server.

### Status codes

- `400` - invalid data or a broken business rule
- `404` - employee / task / route not found
- `409` - duplicate Employee ID or email

## Schema

**Employee**

| Field | Type | Notes |
| --- | --- | --- |
| employeeId | String | unique, stored uppercase |
| fullName | String | |
| email | String | unique, trimmed + lowercased |
| phone | String | 10-15 digits, optional `+` |
| department | String | Development / Design / QA / HR / Sales |
| role | String | |
| joiningDate | Date | not in the future |
| status | String | Active / Inactive / On Leave |
| skills | [String] | |
| leaveStart, leaveEnd | Date | only kept when status is On Leave, otherwise null |
| activeTaskCount | Number | Todo + In Progress tasks, maintained by the task service |

**Task**

| Field | Type | Notes |
| --- | --- | --- |
| taskId | String | auto, `TSK-001`, `TSK-002`... (counter collection) |
| title, description | String | |
| employee | ObjectId -> Employee | |
| employeeSnapshot | Object | employeeId, fullName, email, department, role, removed |
| department | String | |
| priority | String | Low / Medium / High / Critical (+ `priorityRank` 1-4 for sorting) |
| status | String | Todo / In Progress / Completed / Cancelled |
| startDate, dueDate | Date | due >= start |
| completedDate | Date | set by the server only |
| createdAt, updatedAt | Date | mongoose timestamps |

`isOverdue` and `nextStatuses` are virtuals added to every task response, so the list, the details page and the CSV all use the same logic.

### Employee -> Task relationship

One employee has many tasks. A task stores the employee `_id` as a reference **and** a small snapshot of the employee details. The snapshot is what the UI shows, which also makes "search by employee name" a simple query on the task collection (no join needed). When an employee is updated, the snapshot on their tasks is refreshed.

### How employee deletion works

- If the employee has any Todo / In Progress task the delete is rejected with a 400 and a message telling how many open tasks they have.
- Otherwise the employee document is removed and their old (Completed / Cancelled) tasks are kept. Those tasks get `employeeSnapshot.removed = true`, so they still show the name, ID, email and role, marked as "(removed)" instead of a broken link.
- The delete query also checks `activeTaskCount: 0`, so a task assigned at the same moment can't slip through.

## Assumptions

- Dates like start, due, joining and leave are date-only values (stored as UTC midnight). "Today" for the overdue rule is calculated in `APP_TIMEZONE`.
- A task is overdue when today > due date and status is Todo or In Progress. A task due today is not overdue yet.
- The task's department is chosen separately; the form pre-fills it from the employee but it doesn't have to match.
- Changing an employee to Inactive / On Leave doesn't touch tasks already assigned to them. The rules apply to new assignments (and to edits that change the employee or the start date).
- The leave check is only about the task's start date, as described in the brief.
- Any task can be deleted. Deleting an active task frees the employee's slot.
- No authentication, as per the brief.

## Questions from the assignment

**1. Where do you validate status transitions and why?**
In the backend, in `taskService.updateTaskStatus`, using the `STATUS_TRANSITIONS` map in `constants`. The normal edit endpoint refuses any `status` field, so `PUT /tasks/:id/status` is the only way to change it. The frontend just shows `nextStatuses` that the API returns. The UI can be bypassed (Postman, curl, an old tab), so the server has to be the one that decides. The status update is also conditional on the current status (`findOneAndUpdate({ _id, status: current })`) so two clicks at the same time can't both apply.

**2. Why does Completed Date come from the backend?**
Because it's a fact recorded by the system, not user input. If the client sent it, it could be wrong (wrong clock/timezone) or simply faked. The server sets `completedDate = new Date()` at the moment the status becomes Completed and ignores/rejects it from the request body.

**3. How do you block inactive / on-leave assignment?**
On create, and on edit when the employee or start date changes, the service loads the employee and checks: Inactive -> always 400. On Leave -> 400 if `leaveStart <= startDate <= leaveEnd` (inclusive). The dropdown also disables inactive employees and shows the leave dates, but that's only a hint.

**4. Why are filtering and pagination on the backend?**
Loading every task into the browser doesn't scale - the payload and memory grow with the data, and the page gets slow. MongoDB can use indexes and only return the 10 rows needed plus a total count. It also keeps the logic in one place, so the list, the export and the dashboard agree with each other (e.g. "overdue" means the same thing everywhere).

**5. Why do filters live in the URL?**
So the view can be refreshed, bookmarked, shared, or opened in a new tab and look exactly the same. Back/forward buttons also work as expected. `useUrlFilters` reads the query string as the single source of truth and the list fetches whenever it changes.

**6. What can go wrong if two requests assign a 4th active task at the same time?**
With a plain "count, then insert" approach both requests can read 2 active tasks, both pass the check, and the employee ends up with 4. This is a classic race condition. To avoid it, each employee has an `activeTaskCount` and assigning a task first runs a single atomic update:
`findOneAndUpdate({ _id, activeTaskCount: { $lt: 3 } }, { $inc: { activeTaskCount: 1 } })`.
MongoDB applies this per document atomically, so only the requests that actually got a slot continue - the others get the "already has 3 active tasks" error. The slot is released when the task is completed, cancelled, deleted, reassigned, or if creating the task fails. I tested this by sending 6 parallel create requests for one employee: 3 succeeded, 3 got 400. A multi-document transaction (replica set) would be another option.
