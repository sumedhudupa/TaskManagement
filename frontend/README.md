# Task Manager Pro

A comprehensive, full-featured task management application built with React that helps users organize, track, and manage their tasks efficiently. The application includes user authentication, advanced task management features, analytics, and automated email reminders.

## 🚀 Features

### 🔐 Authentication
- User registration and login system
- Secure JWT-based authentication
- Persistent user sessions

### 📋 Task Management
- **Create, Edit, Delete Tasks**: Full CRUD operations for task management
- **Task Status Tracking**: Pending, In Progress, and Completed states
- **Priority Levels**: High, Medium, and Low priority classification
- **Due Dates**: Set and track task deadlines with overdue indicators
- **Labels & Tags**: Organize tasks with custom labels
- **Subtasks**: Break down complex tasks into manageable subtasks
- **Progress Tracking**: Visual progress bars for subtask completion

### 🔍 Advanced Filtering & Search
- **Real-time Search**: Search across task titles, descriptions, and labels
- **Multiple Filters**: Filter by status, priority, or overdue tasks
- **Flexible Sorting**: Sort by creation date, due date, priority, or title
- **Ascending/Descending Order**: Toggle sort direction

### 📊 Analytics Dashboard
- **Task Status Distribution**: Visual breakdown of task completion status
- **Priority Analysis**: Charts showing task distribution by priority
- **Overdue Task Tracking**: Monitor tasks that need immediate attention
- **Completion Statistics**: Track overall productivity metrics

### 🌙 User Experience
- **Dark/Light Mode**: Toggle between theme preferences
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Interface**: Clean, modern UI with smooth animations
- **Real-time Notifications**: Success, error, and info messages

### 📧 Email Reminders
- **Nightly Reminders**: Automated daily email reminders for pending tasks
- **Instant Reminders**: Send task summaries on-demand
- **Customizable Settings**: Enable/disable reminder preferences

### 📄 Export Functionality
- **PDF Export**: Generate professional task reports
- **Comprehensive Reports**: Include task details, subtasks, and analytics
- **Modern Design**: Clean, formatted PDF output with color-coded priorities

### 🔄 Advanced Task Features
- **Undo Delete**: Restore accidentally deleted tasks
- **Bulk Operations**: Efficiently manage multiple tasks
- **Quick Status Toggle**: One-click status updates
- **Subtask Management**: Individual subtask completion tracking

## 🛠 Technology Stack

### Frontend
- **React 18+** - Modern React with Hooks
- **Lucide React** - Beautiful, customizable icons
- **jsPDF** - Client-side PDF generation
- **Tailwind CSS** - Utility-first styling (implied from className usage)

### Backend Integration
- **REST API** - Full backend API integration
- **JWT Authentication** - Secure token-based authentication
- **Email Service** - Automated reminder system

## 🏗 Architecture

### Component Structure
```
App.jsx (Main Component)
├── AuthForm - User authentication interface
├── TaskForm - Task creation and editing modal
├── Notification - Toast notification system
├── Analytics - Data visualization dashboard
└── TaskList - Main task display component
```

### State Management
- **React Context** - Theme and authentication state
- **Local State** - Component-specific state management
- **Persistent Storage** - JWT tokens and user data

### API Integration
- **RESTful Endpoints**: 
  - `/api/login` - User authentication
  - `/api/register` - User registration
  - `/api/tasks` - Task CRUD operations
  - `/api/user/nightly-reminders` - Reminder settings
  - `/api/send-reminder` - Instant reminder trigger

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Backend API server running (default: `http://localhost:4000`)

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd TaskManagement

# Install dependencies
npm install

# Set up environment variables
echo "REACT_APP_API_URL=http://localhost:4000/api" > .env

# Start the development server
npm start
```

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:4000/api
```

## 📱 Usage

### Getting Started
1. **Register/Login**: Create an account or sign in to existing account
2. **Add Tasks**: Click "Add Task" to create your first task
3. **Organize**: Use labels, priorities, and due dates to organize tasks
4. **Track Progress**: Monitor completion with the analytics dashboard
5. **Stay Updated**: Enable nightly reminders for daily task summaries

### Key Workflows
- **Quick Task Creation**: Title → Priority → Due Date → Save
- **Advanced Task Management**: Add descriptions, labels, and subtasks
- **Productivity Tracking**: Use analytics to monitor completion trends
- **Export Reports**: Generate PDF reports for task documentation

## 🎨 Features Highlights

### Responsive Design
- Mobile-first approach with adaptive layouts
- Touch-friendly interface for mobile devices
- Desktop optimization with expanded feature sets

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Semantic HTML structure

### Performance
- Optimized rendering with React best practices
- Efficient state management
- Minimal re-renders with proper memoization

## 🔒 Security Features
- JWT token-based authentication
- Secure API communication
- Client-side input validation
- Protected routes and components

## 📊 Analytics Features
- **Visual Charts**: Status and priority distribution
- **Progress Metrics**: Completion rates and trends
- **Overdue Tracking**: Identify tasks requiring attention
- **Export Capabilities**: PDF reports with detailed analytics

## 🎯 Future Enhancements
- Team collaboration features
- Advanced recurring task options
- Integration with calendar applications
- Mobile app development
- Advanced reporting and analytics
- Webhook integrations

## 🤝 Contributing
This is a comprehensive task management solution designed for both personal and professional use. The modular architecture allows for easy extension and customization.

## 📄 License
MIT License

---

**Task Manager Pro** - Organize your tasks, maximize your productivity! 🚀