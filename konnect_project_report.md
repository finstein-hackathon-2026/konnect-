# KoNNecT — Project Architectural Report

## 1. Project Overview
**KoNNecT** is a premium, real-time service marketplace platform designed with an "Apple-inspired" minimal aesthetic. It connects users needing specific services (Plumbing, Electrical, etc.) with professional workers in real-time.

---

## 2. Technology Stack

### Frontend
- **Framework**: React (Vite) with TypeScript.
- **Styling**: Tailwind CSS v4 (using CSS variables for dynamic theming).
- **Animations**: Framer Motion for smooth layout transitions and micro-animations.
- **Icons**: Lucide React.
- **Communication**: Axios (REST) & Socket.io-client (Real-time).

### Backend
- **Runtime**: Node.js & Express.
- **Database**: MongoDB (Mongoose).
- **Real-time**: Socket.io (Identity mapping for targeted events).
- **Security**: JWT Authentication & Bcrypt password hashing.
- **Validation**: express-validator.

---

## 3. Directory Structure

```text
KoNNecT/
├── client/                 # React Frontend (Vite)
│   ├── dist/               # Production build (served by backend)
│   ├── src/
│   │   ├── components/     # UI Components (Button, Card, JobCard)
│   │   ├── context/        # Theme & Auth Contexts
│   │   ├── lib/            # Shared logic (api.ts, socket.ts, utils.ts)
│   │   ├── pages/          # Page views (Home, JobPage)
│   │   ├── App.tsx         # Main Routing
│   │   └── index.css       # Tailwind v4 configuration & theme tokens
│   ├── index.html          # Entry HTML
│   └── tsconfig.json       # TypeScript configuration
├── server/                 # Node.js Backend
│   ├── config/             # DB & Middleware configs
│   ├── controllers/        # Business logic (Job & Auth logic)
│   ├── models/             # Mongoose Schemas (Job, User)
│   ├── routes/             # Express API Routes
│   ├── sockets/            # SocketManager & Event Handlers
│   ├── public/             # Legacy static files
│   └── server.js           # Main Entry Point (Hosts both API & Frontend)
├── .env                    # Environment Variables
├── package.json            # Project dependencies & scripts
└── seed.js                 # Database seeding script
```

---

## 4. Key Architectural Features

### 🔄 Unified Hosting
The project is configured to run on a **single port (5000)**. 
- The Express server handles API requests under `/api/*`.
- For all other requests, it serves the React production build (`client/dist`).
- This simplifies deployment and eliminates most CORS issues.

### 📡 Real-time Job Lifecycle
The system handles a strict, linear status flow:
`pending` → `assigned` → `on_the_way` → `arrived` → `verified` → `completed`
Updates are broadcast via Sockets specifically to the User and Worker involved, ensuring zero-latency UI updates.

### 🌗 Premium Theme System
Using Tailwind v4 tokens and React Context, the app features a persistent Dark Mode.
- **Light**: Pure white backgrounds with soft grayscale borders.
- **Dark**: `#0B0B0C` background with high-contrast text and glassmorphism cards.

---

## 5. Deployment & Execution

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local or Atlas)

### Local Launch
1. **Configure Environment**: Update `.env` with your `MONGODB_URI`.
2. **Build & Run**:
   ```bash
   # Build the frontend (from client dir)
   cd client && npm run build
   
   # Start the unified server (from root)
   cd .. && npm start
   ```
3. **Access**: Open `http://localhost:5000`

---

## 6. Current Status
The project is in a **Gold Master** state. The logic is robust, the UI is premium, and the hosting is unified. The system is ready for a live MongoDB connection to start processing jobs.
