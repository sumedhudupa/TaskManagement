# Task Manager API

A comprehensive RESTful API for task management with user authentication, email notifications, and automated reminders.

## Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Protected routes with middleware
- Password hashing with bcrypt

### 📋 Task Management
- Create, read, update, and delete tasks
- Task filtering by status, priority, and search terms
- Task sorting capabilities
- Bulk task deletion
- Task status management (pending, in-progress, completed)
- Priority levels (low, medium, high)
- Due date tracking
- Labels and subtasks support

### 📊 Analytics & Statistics
- Task completion rates
- Task distribution by status and priority
- Overdue task tracking
- Tasks due soon notifications
- Comprehensive dashboard statistics

### 📧 Email Notifications
- Manual reminder emails
- Automated nightly reminders
- User preference management for notifications
- HTML email templates with task details

### ⚡ Additional Features
- Health check endpoint
- Error handling middleware
- Input validation
- Database connection monitoring

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt
- **Email Service**: Custom email module
- **Task Scheduling**: node-cron
- **Environment Variables**: dotenv

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-secret-key
PORT=4000
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

The server will start on `http://localhost:4000`

## API Endpoints

### Authentication

#### Register User
```
POST /api/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```
POST /api/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### User Management

#### Get Current User
```
GET /api/user/me
Authorization: Bearer <token>
```

#### Update Nightly Reminders
```
PATCH /api/user/nightly-reminders
Authorization: Bearer <token>
```
**Body:**
```json
{
  "enabled": true
}
```

### Task Management

#### Get All Tasks
```
GET /api/tasks
Authorization: Bearer <token>
```
**Query Parameters:**
- `status`: Filter by status (pending, in-progress, completed, all)
- `priority`: Filter by priority (low, medium, high, all)
- `search`: Search in title and description
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc, desc - default: desc)

#### Get Single Task
```
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Create Task
```
POST /api/tasks
Authorization: Bearer <token>
```
**Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "high",
  "status": "pending",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "labels": ["documentation", "urgent"],
  "subtasks": [
    {
      "title": "Write README",
      "completed": false
    }
  ]
}
```

#### Update Task
```
PUT /api/tasks/:id
Authorization: Bearer <token>
```
**Body:** (All fields optional)
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "medium",
  "status": "in-progress",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### Update Task Status
```
PATCH /api/tasks/:id/status
Authorization: Bearer <token>
```
**Body:**
```json
{
  "status": "completed"
}
```

#### Delete Task
```
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

### Statistics & Analytics

#### Get Task Statistics
```
GET /api/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "byStatus": {
      "completed": 10,
      "pending": 8,
      "inProgress": 7
    },
    "byPriority": {
      "high": 5,
      "medium": 12,
      "low": 8
    },
    "dueSoon": 3,
    "overdue": 2,
    "completionRate": 40
  }
}
```

### Email Notifications

#### Send Manual Reminder
```
POST /api/send-reminder
Authorization: Bearer <token>
```

### System

#### Health Check
```
GET /api/health
```

## Data Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  nightlyReminders: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  title: String (required, max 200 chars),
  description: String (max 1000 chars),
  priority: String (low, medium, high - default: medium),
  status: String (pending, in-progress, completed - default: pending),
  dueDate: Date (optional),
  userId: ObjectId (required),
  labels: Array of Strings,
  subtasks: Array of {
    title: String,
    completed: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Automated Features

### Nightly Reminders
- Runs daily at 23:59
- Sends email reminders to users who have enabled notifications
- Includes overdue tasks, pending tasks, and in-progress tasks with incomplete subtasks
- Only sends emails if user has incomplete tasks

## Error Handling

The API includes comprehensive error handling:
- Input validation errors (400)
- Authentication errors (401)
- Resource not found errors (404)
- Server errors (500)
- Detailed error messages in development mode

## Validation Rules

### Task Validation
- Title: Required, non-empty, max 200 characters
- Description: Optional, max 1000 characters
- Priority: Must be 'low', 'medium', or 'high'
- Status: Must be 'pending', 'in-progress', or 'completed'
- Due Date: Must be valid date format

### User Validation
- Name: Required
- Email: Required, unique, valid email format
- Password: Required, minimum length enforced

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- User-specific data isolation
- Input sanitization and validation
- Protected routes middleware
- Environment variable configuration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | 'secret' |
| `PORT` | Server port | 4000 |
| `NODE_ENV` | Environment mode | 'development' |

## Development

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Scripts
```bash
npm start          # Start the server
npm run dev        # Start with nodemon (if configured)
npm test           # Run tests (if configured)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.