# Kanban Bug Tracker — Backend

A Node.js + Express + MongoDB REST API powering a Kanban-style bug tracking application. Handles authentication, project management, and bug lifecycle (create, assign, update, close) with role-based edit permissions.

## Tech stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT (JSON Web Tokens), passed via `Authorization: Bearer <token>` header
- **Password hashing**: bcryptjs
- **Dev tooling**: nodemon

## Project structure

```
kanban-bug-tracker-backend/
├── config/
│   └── connection-mongoose.js               # MongoDB connection
├── models/
│   ├── UserModel.js
│   ├── ProjectModel.js
│   └── BugModel.js
├── middleware/
│   └── auth.js             # IsLoginUser — verifies JWT from Authorization header
├── controllers/
│   ├── UserController.js
│   ├── ProjectController.js
│   └── BugController.js
├── routes/
│   ├── userRoutes.js
│   ├── projectRoutes.js
│   └── bugRoutes.js
├── .env.example
├── .gitignore
├── package.json
└── server.js / app.js
```

## Setup

```bash
git clone <this-repo>
cd kanban-bug-tracker-backend
npm install
cp .env.example .env   # fill in your own values
npm run dev             # starts with nodemon
```

### Environment variables (`.env`)

```
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/kanban_bug_tracker
JWT_KEY=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

> **MongoDB Atlas users**: whitelist your IP under Network Access, or use `0.0.0.0/0` for local development (not recommended for production).

## Data model

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| password | String | bcrypt hash, excluded from API responses |
| role | String | `user` \| `admin` (platform-level, not project-level) |
| createdAt / updatedAt | Date | via `timestamps: true` |

### Project
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| description | String | |
| createdBy | ObjectId → User | the project owner |
| createdAt / updatedAt | Date | |

> Project-level roles (e.g. lead vs. developer) are assigned by whoever creates a project, not self-selected at registration. A person can be lead on one project and a regular contributor on another.

### Bug
| Field | Type | Notes |
|---|---|---|
| title | String | required |
| description | String | |
| status | String | enum: `Pending`, `In Progress`, `Resolved`, `Closed` — default `Pending` |
| priority | String | enum: `Low`, `Medium`, `High`, `Critical` — default `Medium` |
| projectId | ObjectId → Project | required |
| assignedBy | ObjectId → User | the reporter — set automatically from the logged-in user, never from the client |
| assignedTo | ObjectId → User | who the bug is assigned to |
| seenBy | [ObjectId → User] | tracks who has "seen" the bug's current state — powers the unread bug count |
| createdAt / updatedAt | Date | |

## Authentication

- JWT is issued on register/login and returned in the JSON response body (`token` field) — the frontend stores it and attaches it as `Authorization: Bearer <token>` on every protected request.
- The `IsLoginUser` middleware reads the token from the `Authorization` header (not cookies), verifies it, loads the user, and attaches it to `req.user`.
- Protected routes are guarded with this middleware; unauthenticated requests receive `401`.

## Permission model

**Projects**: only the project's `createdBy` user can edit or delete it.

**Bugs**: two tiers of edit access —
- **Reporter** (`assignedBy` matches the logged-in user): can edit every field — title, description, status, priority, project, reassignment.
- **Assignee** (`assignedTo` matches the logged-in user): can only change `status`. Any other field in the request body is silently ignored server-side, not just hidden client-side.
- Anyone who is neither reporter nor assignee receives `403` on update/delete attempts.
- **Delete** is restricted to the reporter (`assignedBy`) only.

## Unread bug tracking (`seenBy`)

Each bug tracks which involved users have "seen" its current state:

- On creation, `seenBy` starts empty (unseen by both reporter and assignee).
- Whenever one party updates the bug, they are added to `seenBy`; the *other* party is removed from it — this is what drives their unread badge count in the UI.
- If a bug's status becomes `Closed`, both the reporter and assignee are marked as having seen it, since there's nothing further to notify either party about.
- `GET /bug/unread-count` returns how many bugs involving the current user have their ID missing from `seenBy`.
- `PUT /bug/:id/seen` explicitly marks a bug as seen by the current user (called when they open it or interact with its status).

## API reference

All protected routes require `Authorization: Bearer <token>`.

### Auth — `/user`
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create a new account |
| POST | `/login` | Authenticate, returns `token` + `user` |
| GET | `/alluser` | List all users (for assignment dropdowns) |

### Projects — `/project`
| Method | Path | Description |
|---|---|---|
| POST | `/create` | Create a project (creator becomes owner) |
| GET | `/AllProject` | List projects created by the logged-in user |
| GET | `/:id` | Get a single project |
| PUT | `/update/:id` | Update a project (owner only) |
| DELETE | `/delete/:id` | Delete a project (owner only) |

### Bugs — `/bug`
| Method | Path | Description |
|---|---|---|
| POST | `/create` | File a new bug on a project |
| GET | `/AllBugs` | Bugs the user reported or is assigned to, across all projects |
| GET | `/project/:projectId` | Bugs on one project, scoped to the logged-in user's involvement |
| GET | `/getonebug/:id` | Get a single bug (includes `canEditAll` flag for the frontend) |
| PUT | `/update/:id` | Update a bug (full form for reporter, status-only for assignee) |
| PUT | `/:id/seen` | Mark a bug as seen by the current user |
| GET | `/unread-count` | Count of unseen bugs involving the current user |
| GET | `/search?query=` | Search the user's own bugs by title/description |
| DELETE | `/delete/:id` | Delete a bug (reporter only) |

> **Route ordering note**: literal paths like `/unread-count` must be registered *before* wildcard routes like `/:id` in the router file, or Express will incorrectly try to match `"unread-count"` as an `:id` parameter.

## Response shape

All endpoints return a consistent envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "...": "endpoint-specific data"
}
```

Errors follow the same shape with `success: false` and an appropriate HTTP status code (`400`/`401`/`403`/`404`/`500`).