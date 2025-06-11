# Task Management App

A full-stack task management application with user authentication, analytics, PDF export, and email reminders. Built with React (frontend), Node.js/Express (backend), and MongoDB.

## Features

- **User Authentication**: Secure signup/login, user-specific tasks
- **Task CRUD**: Create, read, update, delete tasks and subtasks
- **Subtasks Logic**: Parent task is completed only if all subtasks are completed
- **Analytics**: Visualize task stats and progress
- **PDF Export**: Export uncompleted tasks (with subtasks) to a styled PDF
- **Email Reminders**: Nightly and instant reminders for overdue/pending/incomplete tasks
- **Modern UI**: Responsive, dark mode, and accessible

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB (Atlas or local)
- **Email**: Nodemailer (Gmail SMTP)
- **Deployment**: Vercel (frontend), Render (backend)

## Getting Started (Local)

### Prerequisites
- Node.js & npm
- MongoDB Atlas account (or local MongoDB)
- Gmail account with App Password for email reminders

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd TaskManagement
```

### 2. Backend Setup
```sh
cd backend
npm install
```
Create a `.env.development` file in `backend/`:
```
PORT=4000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
```
Start the backend:
```sh
npm start
```

### 3. Frontend Setup
```sh
cd ../frontend
npm install
```
Create a `.env` file in `frontend/`:
```
REACT_APP_API_URL=http://localhost:4000/api
```
Start the frontend:
```sh
npm start
```

## Deployment

### Backend (Render)
- Push your code to GitHub
- Create a new Web Service on [Render](https://render.com/)
- Set root directory to `backend/`
- Set build command: `npm install`
- Set start command: `node server.js`
- Add all environment variables from `.env.development`

### Frontend (Vercel)
- Import your repo on [Vercel](https://vercel.com/)
- Set root directory to `frontend/`
- Set build command: `npm run build`
- Set output directory: `build`
- Set environment variable:
  - `REACT_APP_API_URL=https://your-backend.onrender.com/api`

## Environment Variables

### Backend (`backend/.env.development`)
- `PORT` - Backend port (default: 4000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret for authentication
- `SMTP_USER` - Gmail address for sending reminders
- `SMTP_PASS` - Gmail App Password

### Frontend (`frontend/.env`)
- `REACT_APP_API_URL` - URL of your backend API

## Email Reminders
- Uses Gmail SMTP. You must enable 2FA and create an App Password in your Google account.
- Nightly reminders can be toggled per user. Instant reminders can be sent from the UI.

## License
MIT