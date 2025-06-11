// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { sendTaskNotification } = require('./email');
const { Task, User } = require('./models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Middleware to authenticate JWT and set req.user
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Invalid token format' });
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Routes
app.get('/api/tasks', authenticate, async (req, res) => {
  try {
    const { status, priority, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    let query = { userId: req.user.userId };
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const tasks = await Task.find(query).sort(sort);
    res.json({ success: true, data: tasks, count: tasks.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tasks', error: error.message });
  }
});

// GET /api/tasks/:id - Get a specific task
app.get('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }
    
    const task = await Task.findOne({ _id: id, userId: req.user.userId });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
});

// POST /api/tasks - Create a new task for the logged-in user
app.post('/api/tasks', authenticate, async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, labels, subtasks } = req.body;
    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 200 characters'
      });
    }
    if (description && description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be less than 1000 characters'
      });
    }
    // Always set userId from JWT, ignore any userId in body
    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      status: status || 'pending',
      userId: req.user.userId,
      labels: Array.isArray(labels) ? labels : [],
      subtasks: Array.isArray(subtasks) ? subtasks : [],
    };
    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }
    const task = new Task(taskData);
    const savedTask = await task.save();
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id - Update a task (only if it belongs to the user)
app.put('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, dueDate } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }
    
    const task = await Task.findOne({ _id: id, userId: req.user.userId });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Validation
    if (title !== undefined && (!title || title.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot be empty'
      });
    }
    
    if (title && title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 200 characters'
      });
    }
    
    if (description && description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be less than 1000 characters'
      });
    }
    
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (req.body.subtasks !== undefined) task.subtasks = req.body.subtasks;
    if (req.body.labels !== undefined) task.labels = req.body.labels;
    
    await task.save();
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
});

// PATCH /api/tasks/:id/status - Update task status
app.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }
    
    if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, in-progress, or completed'
      });
    }
    
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { status, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete a task (only if it belongs to the user)
app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }
    
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.userId });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

// DELETE /api/tasks - Delete multiple tasks
app.delete('/api/tasks', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task IDs array is required'
      });
    }
    
    // Validate all IDs
    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task IDs found',
        invalidIds
      });
    }
    
    const result = await Task.deleteMany({ _id: { $in: ids } });
    
    res.json({
      success: true,
      message: `${result.deletedCount} tasks deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting tasks',
      error: error.message
    });
  }
});

// GET /api/tasks/stats - Get task statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    
    const highPriorityTasks = await Task.countDocuments({ priority: 'high' });
    const mediumPriorityTasks = await Task.countDocuments({ priority: 'medium' });
    const lowPriorityTasks = await Task.countDocuments({ priority: 'low' });
    
    // Tasks due soon (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const tasksDueSoon = await Task.countDocuments({
      dueDate: { $lte: nextWeek, $gte: new Date() },
      status: { $ne: 'completed' }
    });
    
    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });
    
    res.json({
      success: true,
      data: {
        total: totalTasks,
        byStatus: {
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks
        },
        byPriority: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks
        },
        dueSoon: tasksDueSoon,
        overdue: overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = new User({ name, email, password });
    await user.save();
    // Generate JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    // Generate JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});


// POST /api/send-reminder - Send reminder email to logged-in user
app.post('/api/send-reminder', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find overdue and pending tasks
    const now = new Date();
    const overdueTasks = await Task.find({
      userId: req.user.userId,
      dueDate: { $lt: now },
      status: { $ne: 'completed' }
    });

    const pendingTasks = await Task.find({
      userId: req.user.userId,
      status: 'pending'
    });

    // Find in-progress tasks with incomplete subtasks
    const inProgressTasks = await Task.find({
      userId: req.user.userId,
      status: 'in-progress'
    });

    const inProgressWithIncompleteSubtasks = inProgressTasks.filter(task =>
      Array.isArray(task.subtasks) && task.subtasks.some(st => !st.completed)
    );

    // Build email content
    let html = `<h2>Task Reminder</h2>`;
    if (overdueTasks.length > 0) {
      html += `<h3>Overdue Tasks</h3><ul>`;
      overdueTasks.forEach(t => {
        html += `<li><b>${t.title}</b> (Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'})</li>`;
      });
      html += `</ul>`;
    }
    if (pendingTasks.length > 0) {
      html += `<h3>Pending Tasks</h3><ul>`;
      pendingTasks.forEach(t => {
        html += `<li><b>${t.title}</b>${t.dueDate ? ` (Due: ${new Date(t.dueDate).toLocaleDateString()})` : ''}</li>`;
      });
      html += `</ul>`;
    }
    if (inProgressWithIncompleteSubtasks.length > 0) {
      html += `<h3>In-Progress Tasks with Incomplete Subtasks</h3>`;
      inProgressWithIncompleteSubtasks.forEach(t => {
        html += `<b>${t.title}</b><ul>`;
        t.subtasks.filter(st => !st.completed).forEach(st => {
          html += `<li>${st.title}</li>`;
        });
        html += `</ul>`;
      });
    }
    if (
      overdueTasks.length === 0 &&
      pendingTasks.length === 0 &&
      inProgressWithIncompleteSubtasks.length === 0
    ) {
      html += `<p>🎉 You have no overdue, pending, or incomplete subtasks in in-progress tasks!</p>`;
    }

    await sendTaskNotification({
      to: user.email,
      subject: 'Task Reminder',
      text: 'You have tasks that need your attention. Please check your dashboard.',
      html
    });

    res.json({ success: true, message: 'Reminder email sent' });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ success: false, message: 'Error sending reminder', error: error.message });
  }
});

// PATCH /api/user/nightly-reminders - Enable/disable nightly reminders
app.patch('/api/user/nightly-reminders', authenticate, async (req, res) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, message: 'enabled must be boolean' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { nightlyReminders: enabled },
      { new: true }
    );
    res.json({ success: true, nightlyReminders: user.nightlyReminders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating setting', error: error.message });
  }
});
// Nightly reminder job: runs every day at 23:59
cron.schedule('59 23 * * *', async () => {
  console.log('Running nightly reminder job...');
  try {
    const users = await User.find({ nightlyReminders: true });
    for (const user of users) {
      // Find this user's incomplete tasks
      const now = new Date();
      const overdueTasks = await Task.find({
        userId: user._id,
        dueDate: { $lt: now },
        status: { $ne: 'completed' }
      });
      const pendingTasks = await Task.find({
        userId: user._id,
        status: 'pending'
      });
      const inProgressTasks = await Task.find({
        userId: user._id,
        status: 'in-progress'
      });
      const inProgressWithIncompleteSubtasks = inProgressTasks.filter(task =>
        Array.isArray(task.subtasks) && task.subtasks.some(st => !st.completed)
      );

      // If user has any incomplete tasks, send reminder
      if (
        overdueTasks.length > 0 ||
        pendingTasks.length > 0 ||
        inProgressWithIncompleteSubtasks.length > 0
      ) {
        let html = `<h2>Task Reminder</h2>`;
        if (overdueTasks.length > 0) {
          html += `<h3>Overdue Tasks</h3><ul>`;
          overdueTasks.forEach(t => {
            html += `<li><b>${t.title}</b> (Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'})</li>`;
          });
          html += `</ul>`;
        }
        if (pendingTasks.length > 0) {
          html += `<h3>Pending Tasks</h3><ul>`;
          pendingTasks.forEach(t => {
            html += `<li><b>${t.title}</b>${t.dueDate ? ` (Due: ${new Date(t.dueDate).toLocaleDateString()})` : ''}</li>`;
          });
          html += `</ul>`;
        }
        if (inProgressWithIncompleteSubtasks.length > 0) {
          html += `<h3>In-Progress Tasks with Incomplete Subtasks</h3>`;
          inProgressWithIncompleteSubtasks.forEach(t => {
            html += `<b>${t.title}</b><ul>`;
            t.subtasks.filter(st => !st.completed).forEach(st => {
              html += `<li>${st.title}</li>`;
            });
            html += `</ul>`;
          });
        }

        await sendTaskNotification({
          to: user.email,
          subject: 'Daily Task Reminder',
          text: 'You have tasks that need your attention. Please check your dashboard.',
          html
        });
        console.log(`Sent reminder to ${user.email}`);
      }
    }
  } catch (err) {
    console.error('Error in nightly reminder job:', err);
  }
});

// GET /api/user/me - Get current user info
app.get('/api/user/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      ...user.toObject()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});