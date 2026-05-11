# 📚 Tutorial Learning App

A multi-tenant tutorial/coaching management platform built with **React** and **Express.js**. Manage centers, tutors, students, batches, classes, attendance, video lectures, and more — all from one place.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, TailwindCSS 4, React Router 7, TanStack Query |
| **Backend** | Node.js, Express 5, Mongoose (MongoDB) |
| **Database** | MongoDB Atlas |
| **Auth** | JWT, Google OAuth |
| **Email** | Resend / Nodemailer |
| **Meetings** | Zoom API / Google Meet |
| **UI** | Radix UI, Lucide Icons, Sonner, shadcn/ui |

## 📁 Project Structure

```
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts (Auth, VideoProgress)
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Layout wrappers
│   ├── pages/              # Page components (admin, auth, student, tenant, tutor)
│   ├── routes/             # Route definitions
│   └── services/           # API service functions
├── server/                 # Express backend
│   ├── configs/            # DB, multer, mail, Google configs
│   ├── controllers/        # Route handlers
│   ├── middlewares/        # Auth & role middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express route definitions
│   ├── services/           # Cron jobs, email, meeting services
│   ├── templates/          # Email templates
│   └── utils/              # Helper utilities
├── index.html              # Vite entry point
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB Atlas** account (or local MongoDB)
- **Google Cloud Console** project (for OAuth)
- **Zoom** developer account (for meetings)
- **Resend** account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tutorial-learning-app.git
   cd tutorial-learning-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in all the required values. See [Environment Variables](#-environment-variables) below.

4. **Run in development mode**
   ```bash
   npm run dev
   ```
   This starts both the backend (port 4000) and frontend (port 5173) concurrently.

5. **Open the app**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:4000/api](http://localhost:4000/api)

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 4000) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `EMAIL_USER` | Gmail address for Nodemailer |
| `EMAIL_PASS` | Gmail app password |
| `RESEND_API_KEY` | Resend.com API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ZOOM_CLIENT_ID` | Zoom OAuth client ID |
| `ZOOM_CLIENT_SECRET` | Zoom OAuth client secret |
| `VITE_API_URL` | Frontend API base URL |
| `CORS_ORIGIN` | Allowed origins (comma-separated, production) |

> ⚠️ **Never commit your `.env` file.** It's already in `.gitignore`.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client & server in development |
| `npm run client` | Start only the Vite dev server |
| `npm run server` | Start only the Express server (with nodemon) |
| `npm run build` | Build the frontend for production |
| `npm start` | Start the production server |
| `npm run preview` | Preview the production build locally |

## 🌐 Deployment

### Option 1: Render (Recommended — Free Tier)

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add all environment variables from `.env.example` in Render's dashboard
6. Set `NODE_ENV=production`
7. Set `CORS_ORIGIN=https://your-app.onrender.com`
8. Set `VITE_API_URL=https://your-app.onrender.com/api`
9. Set `VITE_API_BASE_URL=https://your-app.onrender.com`

### Option 2: Vercel (Frontend) + Render (Backend)

If you want separate deployments:
- Deploy `server/` on Render as a Node.js service
- Deploy the frontend on Vercel (set `VITE_API_URL` to your Render backend URL)

### Important Production Notes

- **File Uploads:** Render/Vercel have ephemeral file systems. For production, consider using **Cloudinary** or **AWS S3** for file storage.
- **MongoDB:** Ensure your Atlas cluster allows connections from your deployment IP (or allow all IPs: `0.0.0.0/0`).
- **Google OAuth:** Add your production URL to the authorized redirect URIs in Google Cloud Console.
- **Zoom:** Update webhook/redirect URLs in Zoom Marketplace app settings.

## 🔗 API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `GET /api/admin/*` | Admin management routes |
| `GET /api/tenant/*` | Tenant (center) management |
| `GET /api/tutor/*` | Tutor management |
| `GET /api/student/*` | Student management |
| `GET /api/class/*` | Class management |
| `GET /api/attendance/*` | Attendance tracking |
| `GET /api/meet/*` | Meeting management |
| `GET /api/class-doubts/*` | Doubt management |
| `GET /api/class-notes/*` | Notes management |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
