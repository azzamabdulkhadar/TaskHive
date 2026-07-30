# TaskHive - Interview Guide

## Project Overview

TaskHive is a full-stack CRM (Customer Relationship Management) web application that helps users manage their leads/enquiries, schedule events, and organize notes — all in one place. It features a role-based protected dashboard with a clean, responsive UI.

---

## UI & Functionality Explanation

### Pages & Flow

1. **Login Page** — A centered card-based form with email and password fields. Shows alert messages for invalid credentials. Redirects authenticated users to the dashboard.

2. **Signup Page** — A registration form collecting name, email, password, phone, date of birth, and gender. Validates password confirmation before submission.

3. **Dashboard (Leads/Enquiries)** — A table view displaying all leads with options to add, edit, and delete enquiries. Uses a modal form for creating/editing entries.

4. **Notes Page** — A card-based layout where users can create, view, and delete personal notes. Each note has a title and description.

5. **Events Page** — A calendar/list view for scheduling events with date, time, and description. Supports CRUD operations through a modal.

### Navigation & Layout

- A persistent **Header** with navigation links (Dashboard, Notes, Events) and a logout button.
- **Protected Routes** — Only authenticated users can access internal pages. Unauthenticated users are redirected to login.
- **Main Layout** wraps all authenticated pages with the header and consistent structure.

### Key UI Decisions

- Used **Ant Design (antd)** component library for consistent, professional UI components (Cards, Forms, Tables, Modals, DatePickers).
- **CSS Modules** for component-scoped styling — prevents class name conflicts.
- Responsive card-based design for login/signup pages.

---

## Technical Architecture

### Frontend (React + Vite)

| Aspect | Choice |
|--------|--------|
| Framework | React 18 with Vite |
| Routing | React Router DOM v6 (nested routes) |
| State Management | Redux Toolkit |
| HTTP Client | Axios |
| UI Library | Ant Design (antd) |
| Styling | CSS Modules |

### Backend (Node.js + Express)

| Aspect | Choice |
|--------|--------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB with Mongoose ODM |
| Architecture | MVC pattern (Model → DAO → Controller → Router) |
| File Upload | Multer |
| Environment Config | dotenv |

### Architecture Pattern

```
Client (React) → Axios HTTP → Express Router → Controller → DAO → Mongoose Model → MongoDB
```

The backend follows a **layered architecture**:
- **Router** — Defines API endpoints and maps them to controllers
- **Controller** — Handles request/response logic
- **DAO (Data Access Object)** — Contains database query logic, separated from business logic
- **Model** — Mongoose schema definitions

---

## Important Code Concepts to Know

### 1. Protected Routes (Frontend)

Used React Router's `<Outlet>` pattern with a wrapper component that checks Redux state. If no user session exists, it redirects to login. This prevents unauthorized access without a full page reload.

### 2. Redux Toolkit for Session Management

A `sessionSlice` manages login/logout state. On successful login, user data is stored in Redux. On logout or page refresh, state resets (no persistence to localStorage in current version).

### 3. DAO Pattern (Backend)

Instead of writing database queries directly in controllers, a separate DAO layer handles all Mongoose operations. This makes the code testable and swappable — you could replace MongoDB with another database by only changing the DAO layer.

### 4. Nested Routes with Layout

React Router's nested route structure allows the `MainLayout` (header + sidebar) to wrap all authenticated pages using `<Outlet>`, avoiding repetition.

### 5. Multer for File Uploads

Configured disk storage with unique filenames using timestamps. Files are served statically from the `/uploads` directory.

### 6. Environment Variables

Database URL and port are stored in `.env` and loaded via `dotenv` — keeps sensitive configuration out of source code.

---

## Potential Interview Q&A

**Q: Why did you choose the DAO pattern instead of writing queries in controllers?**
A: Separation of concerns. The controller handles HTTP logic (request parsing, response formatting), while the DAO handles database operations. This makes unit testing easier and allows swapping the database layer without touching controller logic.

**Q: How does authentication work in your app?**
A: On login, the backend queries MongoDB for a matching email and password. If found, user data is returned and stored in Redux state on the frontend. Protected routes check this Redux state — if it's null, the user is redirected to login.

**Q: Why CSS Modules over regular CSS or styled-components?**
A: CSS Modules scope styles to individual components automatically, preventing class name collisions without the runtime overhead of CSS-in-JS libraries. They also keep styling in familiar CSS syntax.

**Q: How would you improve this project?**
A: Add JWT-based authentication with refresh tokens, hash passwords with bcrypt, persist sessions in localStorage or cookies, add input validation/sanitization on the backend, implement pagination for large datasets, and add role-based access control.

**Q: Why Vite instead of Create React App?**
A: Vite offers significantly faster dev server startup and hot module replacement because it uses native ES modules. CRA uses Webpack which bundles everything upfront, making it slower for development.

**Q: Explain the data flow when a user creates a new lead.**
A: User fills the modal form → React dispatches an Axios POST request to `/lead` → Express router forwards to `leadController.saveLead` → Controller extracts body and calls `LeadDAO.saveLead(data)` → DAO calls `LeadModel.create()` → Mongoose validates against schema and inserts into MongoDB → Response flows back up the chain to the frontend.

**Q: What is the purpose of `useSelector` and `useDispatch` in your project?**
A: `useSelector` reads data from the Redux store (e.g., checking if a user is logged in). `useDispatch` sends actions to the store (e.g., dispatching `login(userData)` after successful authentication).

**Q: How do you handle CORS in this project?**
A: The backend uses the `cors` middleware with a wildcard (`"*"`), allowing requests from any origin. In production, this should be restricted to the frontend's domain only.

---

## Quick Stats

- **4 main features**: Authentication, Leads/Enquiries, Notes, Events
- **Full CRUD** on all entities (Create, Read, Update, Delete)
- **RESTful API** design with proper HTTP methods (GET, POST, PUT, DELETE)
- **Component-based** frontend architecture with reusable modals and layouts
