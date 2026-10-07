# 🐝 TaskHive – Smart Productivity & CRM App

<p align="center">
  <a href="https://www.mongodb.com/mern-stack" target="_blank">
    <img src="https://img.shields.io/badge/MERN-Stack-green" />
  </a>
  <a href="https://react.dev/" target="_blank">
    <img src="https://img.shields.io/badge/React-19-blue" />
  </a>
  <a href="https://nodejs.org/en/docs" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-Backend-brightgreen" />
  </a>
  <a href="https://expressjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/Express-5-black" />
  </a>
  <a href="https://www.mongodb.com/docs/" target="_blank">
    <img src="https://img.shields.io/badge/MongoDB-Database-green" />
  </a>
  <a href="https://redux-toolkit.js.org/" target="_blank">
    <img src="https://img.shields.io/badge/Redux-Toolkit-purple" />
  </a>
</p>

A full-stack **productivity and CRM web application** built on the MERN stack.  
TaskHive gives users a unified workspace to manage notes, track events on a calendar, and handle enquiries/leads — all behind secure authentication and a responsive modern UI.

---

## 🌍 Live Demo

> 🚧 Coming Soon (Deploying on Render / Vercel)

---

## 🧠 What is TaskHive?

TaskHive is a multi-module productivity tool where users can:

- **Register & log in** securely with hashed passwords
- **Write and manage notes** with optional file attachments
- **Schedule & track events** on a date-based calendar view
- **Manage enquiries / leads** — contacts categorised by type (visit, meeting, enquiry, delivery, etc.)
- Navigate everything through a clean, sidebar-driven layout

---

## 📸 Screenshots

### 📝 Notes
![Notes Screen](./screenshots/notes-screen.png)

### 📅 Events Calendar
![Events Screen](./screenshots/events-screen.png)

### 📋 Enquiry / Lead Management
![Enquiry Screen](./screenshots/tasks-screen.png)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Authentication | Secure register & login with JWT |
| 📝 Notes Module | Create, edit, delete notes; supports file attachment uploads |
| 📅 Events Module | Schedule events by date with descriptions |
| 📋 Leads / Enquiries | Full CRM-style contact management with type classification |
| 🛡️ Protected Routes | All user pages require a valid session |
| 📁 File Uploads | Multer-powered file storage served as static assets |
| 🗃️ Per-User Data | All notes, events, and leads are scoped to the logged-in user |
| 📱 Responsive UI | Built with Ant Design + Bootstrap |

---

## 🏗️ Architecture

### Backend — MVC Pattern

```
backend/
├── controller/     # Business logic (UserController, NoteController, EventController, LeadController)
├── dao/            # Data Access Objects — DB query layer
├── model/          # Mongoose schemas (User, Note, Event, Lead)
├── router/         # Express route definitions
└── index.js        # App entry: Express setup, MongoDB connection, middleware
```

### Frontend — Component-based React

```
client/src/
├── components/
│   ├── header/           # Top navigation bar
│   ├── main-layout/      # Sidebar + Outlet wrapper (Ant Design Layout)
│   ├── protected-route/  # Auth guard component
│   ├── notes-modal/      # Add/edit note modal
│   ├── event-modal/      # Add/edit event modal
│   └── enquiry-modal/    # Add/edit lead/enquiry modal
├── containers/
│   ├── login/            # Login page
│   ├── signup/           # Registration page
│   ├── dashboard/        # Home dashboard
│   ├── notes/            # Notes list view
│   └── event/            # Events calendar view
├── redux/
│   ├── store.jsx         # Redux store
│   └── slices/
│       └── sessionSlice  # Auth session state
└── App.jsx               # Router definition
```

### Application Flow

```
React (Vite)  →  Axios  →  Express.js  →  Mongoose  →  MongoDB
     ↑                          ↓
  Redux Store          JWT / Multer middleware
```

---

## 🛠️ Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 6 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| Redux Toolkit | 2 | Global state management |
| React Redux | 9 | React ↔ Redux bindings |
| Ant Design | 5 | UI component library |
| Bootstrap / React-Bootstrap | 5 | Layout & utility styles |
| Axios | 1 | HTTP client |

### Backend
| Library | Version | Purpose |
|---|---|---|
| Express | 5 | HTTP server & routing |
| Mongoose | 8 | MongoDB ODM |
| dotenv | 16 | Environment variable management |
| cors | 2 | Cross-origin request handling |
| multer | 2 | File upload middleware |
| nodemon | 3 | Dev auto-restart |
| dayjs | 1 | Date utility |

### Database
- **MongoDB** (local `mongodb://localhost:27017` or Atlas)

---

## 📂 Full Project Structure

```
TaskHive/
│
├── backend/
│   ├── controller/
│   │   ├── userController.js
│   │   ├── noteController.js
│   │   ├── eventController.js
│   │   ├── leadController.js
│   │   └── index.js
│   ├── dao/
│   │   ├── userDAO.js
│   │   ├── noteDAO.js
│   │   ├── eventDAO.js
│   │   ├── leadDAO.js
│   │   └── index.js
│   ├── model/
│   │   ├── userModel.js
│   │   ├── noteModel.js
│   │   ├── eventModel.js
│   │   ├── leadModel.js
│   │   └── index.js
│   ├── router/
│   │   ├── userRoute.js
│   │   ├── noteRoute.js
│   │   ├── eventRoute.js
│   │   ├── leadRoute.js
│   │   └── index.js
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── containers/
│   │   ├── redux/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── screenshots/
├── package.json          ← root (concurrently scripts)
└── README.md
```

---

## 📚 API Endpoints

### Users — `/user`
| Method | Route | Description |
|---|---|---|
| `GET` | `/user` | Get all users |
| `POST` | `/user` | Create / register a user |
| `PUT` | `/user/:_id` | Update a user |
| `DELETE` | `/user/:_id` | Delete a user |

### Notes — `/note`
| Method | Route | Description |
|---|---|---|
| `GET` | `/note` | Get all notes |
| `POST` | `/note` | Create a note |
| `PUT` | `/note/:_id` | Update a note |
| `DELETE` | `/note/:_id` | Delete a note |

### Events — `/event`
| Method | Route | Description |
|---|---|---|
| `GET` | `/event` | Get all events |
| `POST` | `/event` | Create an event |
| `PUT` | `/event/:_id` | Update an event |
| `DELETE` | `/event/:_id` | Delete an event |

### Leads / Enquiries — `/lead`
| Method | Route | Description |
|---|---|---|
| `GET` | `/lead` | Get all leads |
| `POST` | `/lead` | Create a lead |
| `PUT` | `/lead/:_id` | Update a lead |
| `DELETE` | `/lead/:_id` | Delete a lead |

### File Upload
| Method | Route | Description |
|---|---|---|
| `POST` | `/upload` | Upload a file (multipart/form-data, field: `file`) |

---

## 🗄️ Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique |
| `phone` | String | optional |
| `password` | String | required |
| `dob` | Date | optional |
| `gender` | String | `male` / `female` / `others` |

### Note
| Field | Type | Notes |
|---|---|---|
| `content` | String | required |
| `file` | String | optional — filename of uploaded attachment |
| `user` | ObjectId | ref → User |

### Event
| Field | Type | Notes |
|---|---|---|
| `date` | Date | defaults to now |
| `description` | String | optional |
| `user` | ObjectId | ref → User |

### Lead / Enquiry
| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique |
| `phone` | String | optional |
| `type` | String | `visit` / `meeting` / `enquiry` / `delivery` / `others` |
| `visitReason` | String | optional |
| `description` | String | optional |
| `user` | ObjectId | ref → User |

---

## 📦 Installation & Local Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally on port `27017` (or a MongoDB Atlas URI)

### 1. Clone the repo
```bash
git clone https://github.com/Azzam-Abdul-Khadar/TaskHive.git
cd TaskHive
```

### 2. Install all dependencies at once
```bash
npm run install-deps
```

Or manually:
```bash
# backend
cd backend && npm install

# frontend
cd ../client && npm install
```

### 3. Configure environment variables

Create `backend/.env`:
```env
PORT=3000
DB_URL=mongodb://localhost:27017/utility-app
JWT_SECRET=your_jwt_secret_key
```

> The frontend dev server proxies API calls to `http://localhost:4000` — update `client/package.json` proxy if you change the backend port.

### 4. Run both servers together (from root)
```bash
npm run dev
```

This uses **concurrently** to start backend and frontend in parallel.

Or run them separately:
```bash
# Terminal 1 — backend (port 3000)
npm run backend:dev

# Terminal 2 — frontend (port 5173)
npm run frontend:dev
```

Then open **http://localhost:5173** in your browser.

---

## 🛣️ Client-Side Routes

| Path | Component | Auth Required |
|---|---|---|
| `/` | Login | No |
| `/signup` | SignUp | No |
| `/user/dashboard` | Dashboard | ✅ Yes |
| `/user/notes` | Notes | ✅ Yes |
| `/user/events` | Events | ✅ Yes |

---

## 💡 What I Learned

- Building a layered backend with Controller → DAO → Model separation
- Designing RESTful APIs with Express 5
- Connecting React + Redux Toolkit for global session/auth state
- Implementing protected routes with React Router v7
- Handling file uploads with Multer and serving them as static assets
- Structuring a monorepo with a shared root `package.json` and `concurrently`
- Using Ant Design components alongside Bootstrap for a polished UI

---

## 🔮 Future Improvements

- 🔐 Add JWT middleware to protect API routes server-side
- 🔒 Hash passwords with bcrypt (currently stored as plain text)
- 🌐 Deploy backend to Render and frontend to Vercel with MongoDB Atlas
- 🔔 Add notifications / reminders for upcoming events
- 👤 User profile page with avatar upload
- 🔍 Search and filter across notes, events, and leads
- 📊 Dashboard analytics (counts, charts)
- 🌙 Dark mode toggle

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m "feat: add YourFeature"`
4. Push the branch and open a PR

---

## ⭐ Leave a Star

If you found this project helpful, give it a star on GitHub — it helps a lot!

---

## 📄 License

This project is open-source. Add your preferred license (MIT recommended).
