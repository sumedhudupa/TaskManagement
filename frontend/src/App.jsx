import React, { useState, useEffect, createContext } from 'react';
import jsPDF from 'jspdf';
import autotable from 'jspdf-autotable';
import {
  Plus, Edit2, Trash2, Check, Calendar, Filter, Search, 
  BarChart3, LogOut, 
  Moon, Sun, Bell, Tag, CheckSquare, AlertTriangle, Home, RotateCcw, Save } from 'lucide-react';
import AuthForm from './components/AuthForm';
import TaskForm from './components/TaskForm';
import Notification from './components/Notification';
import Analytics from './components/Analytics';

// Context for theme and authentication
const AppContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const authService = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return { success: true, user: data.user };
  },
  signup: async (email, password, name) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Signup failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return { success: true, user: data.user };
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  getToken: () => {
    return localStorage.getItem('token');
  }
};


const EnhancedTaskManager = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending',
    labels: [],
    subtasks: []
  });
  const [undoTask, setUndoTask] = useState(null);

  // Nightly Reminders state and handlers
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [sendNowLoading, setSendNowLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      loadTasks(storedUser.id);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      try {
        const token = authService.getToken();
        const res = await fetch(`${API_URL}/user/me`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setRemindersEnabled(data.nightlyReminders);
        }
      } catch (e) {}
    };
    fetchUser();
  }, [user]);

  const exportUncompletedTasksToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Modern color palette
    const colors = {
      primary: [76, 33, 219],      // #4c21db
      secondary: [59, 130, 246],   // #3b82f6
      accent: [16, 184, 199],      // #10b8c7
      success: [34, 197, 94],      // #22c55e
      warning: [245, 158, 11],     // #f59e0b
      danger: [239, 68, 68],       // #ef4444
      text: [31, 41, 55],          // #1f2937
      lightGray: [249, 250, 251],  // #f9fafb
      mediumGray: [156, 163, 175], // #9ca3af
      darkGray: [75, 85, 99]       // #4b5563
    };

    // Priority colors mapping
    const priorityColors = {
      high: colors.danger,
      medium: colors.warning,
      low: colors.success
    };

    // Status colors mapping
    // const statusColors = {
    //   pending: colors.mediumGray,
    //   'in-progress': colors.secondary,
    //   completed: colors.success
    // };

    const uncompletedTasks = tasks.filter(t => t.status !== 'completed');

    // Header with gradient-like effect
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Add subtle shadow effect
    doc.setFillColor(0, 0, 0, 0.1);
    doc.rect(0, 35, pageWidth, 2, 'F');

    // Main title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Task Management Report', 14, 22);

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Uncompleted Tasks Overview', 14, 30);

    // Stats section
    const statsY = 45;
    doc.setTextColor(...colors.text);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, statsY);

    // Stats boxes
    const stats = [
      { label: 'Total Tasks', value: uncompletedTasks.length, color: colors.primary },
      { label: 'High Priority', value: uncompletedTasks.filter(t => t.priority === 'high').length, color: colors.danger },
      { label: 'In Progress', value: uncompletedTasks.filter(t => t.status === 'in-progress').length, color: colors.secondary },
      { label: 'Overdue', value: uncompletedTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length, color: colors.warning }
    ];

    const boxWidth = 40;
    const boxHeight = 25;
    let boxX = 14;
    const boxY = statsY + 5;

    stats.forEach((stat, idx) => {
      // Box background with lighter opacity
      doc.setFillColor(...stat.color);
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');
      
      // Add a subtle border for better definition
      doc.setDrawColor(...stat.color);
      doc.setLineWidth(1);
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'S');
      
      // Value with better contrast
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const valueWidth = doc.getTextWidth(stat.value.toString());
      doc.text(stat.value.toString(), boxX + (boxWidth - valueWidth) / 2, boxY + 12);
      
      // Label with white text and background for better visibility
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(boxX + 2, boxY + boxHeight - 8, boxWidth - 4, 6, 1, 1, 'F');
      
      doc.setTextColor(...stat.color);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const labelWidth = doc.getTextWidth(stat.label);
      doc.text(stat.label, boxX + (boxWidth - labelWidth) / 2, boxY + boxHeight - 4);
      
      boxX += boxWidth + 6;
    });

    // Tasks table
    const tableStartY = boxY + 35;
    
      // Prepare enhanced table data with priority and status colors
      const bodyRows = uncompletedTasks.map((task, idx) => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'No due date';
        
        // Create colored priority and status text
        const priorityText = task.priority.toUpperCase();
        const statusText = task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return [
          idx + 1,
          task.title,
          task.description || 'No description',
          priorityText,
          statusText,
          isOverdue ? `⚠️ ${dueDate}` : dueDate,
          (task.labels || []).join(', ') || '-'
        ];
      });

    // Enhanced table with proper sizing
    doc.autoTable({
      theme: 'plain',
      head: [['#', 'Title', 'Description', 'Priority', 'Status', 'Due Date', 'Labels']],
      body: bodyRows,
      startY: tableStartY,
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'middle',
        textColor: colors.text,
        lineColor: [229, 231, 235],
        lineWidth: 0.5,
        halign: 'left'
      },
      headStyles: {
        fillColor: colors.secondary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
        halign: 'center'
      },
      alternateRowStyles: { 
        fillColor: colors.lightGray
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 35, fontStyle: 'bold' },
        2: { cellWidth: 45, fontSize: 7 },
        3: { 
          cellWidth: 15,
          halign: 'center',
          fontSize: 7,
          fontStyle: 'bold'
        },
        4: { 
          cellWidth: 18,
          halign: 'center',
          fontSize: 7,
          fontStyle: 'bold'
        },
        5: { cellWidth: 22, halign: 'center', fontSize: 7 },
        6: { cellWidth: 25, fontSize: 6, halign: 'center' }
      },
      pageBreak: 'auto',
      showHead: 'everyPage'
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    // Subtasks section with enhanced styling
    uncompletedTasks.forEach((task, idx) => {
      const subtasks = task.subtasks || [];
      if (subtasks.length === 0) return;

      // Check if we need a new page
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      // Task title for subtasks
      doc.setFillColor(...colors.accent);
      doc.roundedRect(14, currentY - 5, pageWidth - 28, 12, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Subtasks for: ${task.title}`, 18, currentY + 2);
      
      currentY += 15;

      // Subtasks list with better formatting
      subtasks.forEach((subtask, i) => {
        const isCompleted = subtask.completed;
        const bulletColor = isCompleted ? colors.success : colors.mediumGray;
        const textColor = isCompleted ? colors.success : colors.text;

        // Bullet point
        doc.setFillColor(...bulletColor);
        doc.circle(22, currentY - 1, 1.5, 'F');

        // Subtask text
        doc.setTextColor(...textColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', isCompleted ? 'normal' : 'normal');
        
        const text = `${subtask.title}`;
        doc.text(text, 28, currentY);

        // Strike-through for completed subtasks
        if (isCompleted) {
          const textWidth = doc.getTextWidth(text);
          doc.setDrawColor(...colors.success);
          doc.setLineWidth(0.5);
          doc.line(28, currentY - 1, 28 + textWidth, currentY - 1);
        }

        // Completion status badge
        if (isCompleted) {
          doc.setFillColor(...colors.success);
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          const badgeText = 'DONE';
          const badgeWidth = doc.getTextWidth(badgeText) + 4;
          const badgeX = pageWidth - 30;
          doc.roundedRect(badgeX, currentY - 4, badgeWidth, 6, 1, 1, 'F');
          doc.text(badgeText, badgeX + 2, currentY - 0.5);
        }

        currentY += 8;
      });

      currentY += 8;
    });

    // Footer with modern styling
    const addFooter = () => {
      const footerY = pageHeight - 20;
      doc.setDrawColor(...colors.mediumGray);
      doc.setLineWidth(0.5);
      doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
      
      doc.setTextColor(...colors.mediumGray);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      const timestamp = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.text(`Generated on ${timestamp}`, 14, footerY);
      doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - 30, footerY);
    };

    // Add footer to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter();
    }

    // Save with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`task-report-${timestamp}.pdf`);
  };

  const loadTasks = async (userId) => {
    try {
      // Fetch tasks from backend API
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/tasks`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data.data || []);
    } catch (err) {
      setTasks([]);
      showNotification('Could not load tasks', 'error');
    }
  };

  // Authentication functions
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const result = await authService.login(authForm.email, authForm.password);
      setUser(result.user);
      loadTasks();
      showNotification('Welcome back!', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (authForm.password !== authForm.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    try {
      setIsLoading(true);
      const result = await authService.signup(authForm.email, authForm.password, authForm.name);
      setUser(result.user);
      loadTasks();
      showNotification('Account created successfully!', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setTasks([]);
  };

  // Task functions
  const createTask = async (taskData) => {
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(taskData)
      });
      if (!res.ok) throw new Error('Failed to create task');
      await loadTasks();
      setShowAddForm(false);
      resetNewTask();
      showNotification('Task created successfully!', 'success');
    } catch (err) {
      showNotification('Could not create task', 'error');
    }
  };

  const updateTask = async (id, updates) => {
    if (!id) {
      showNotification('Task ID is missing!', 'error');
      return;
    }
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update task');
      await loadTasks();
      setEditingTask(null);
      showNotification('Task updated successfully!', 'success');
    } catch (err) {
      showNotification('Could not update task', 'error');
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to delete task');
      await loadTasks();
      showNotification('Task deleted', 'info');
    } catch (err) {
      showNotification('Could not delete task', 'error');
    }
  };

  const undoDelete = () => {
    if (undoTask) {
      setTasks(prev => [undoTask, ...prev]);
      setUndoTask(null);
      showNotification('Task restored', 'success');
    }
  };

  const toggleTaskStatus = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(id, { status: newStatus });
    }
  };

  const toggleSubtask = (taskId, subtaskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      const updatedSubtasks = task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      updateTask(taskId, { subtasks: updatedSubtasks });
    }
  };

  // Nightly reminders toggle
  const toggleNightlyReminders = async () => {
    setReminderLoading(true);
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/user/nightly-reminders`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ enabled: !remindersEnabled })
      });
      if (!res.ok) throw new Error('Failed to update reminder setting');
      setRemindersEnabled(!remindersEnabled);
      showNotification(`Nightly reminders ${!remindersEnabled ? 'enabled' : 'disabled'}!`, 'success');
    } catch (err) {
      showNotification('Could not update reminder setting', 'error');
    } finally {
      setReminderLoading(false);
    }
  };

  // Send reminder instantly
  const sendReminderNow = async () => {
    setSendNowLoading(true);
    try {
      const token = authService.getToken();
      const res = await fetch(`${API_URL}/send-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to send reminder');
      showNotification('Reminder sent to your email!', 'success');
    } catch (err) {
      showNotification('Could not send reminder', 'error');
    } finally {
      setSendNowLoading(false);
    }
  };

  // Utility functions
  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      status: 'pending',
      labels: [],
      subtasks: []
    });
  };

  const showNotification = (message, type = 'info', showUndo = false) => {
    setNotification({ message, type, showUndo });
    if (!showUndo) {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Filtering and sorting
  const filteredAndSortedTasks = Array.isArray(tasks) ? tasks
    .filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter ||
        (filter === 'overdue' && new Date(task.dueDate) < new Date() && task.status !== 'completed');
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(task.labels) && task.labels.some(label => label.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'dueDate':
          aValue = new Date(a.dueDate || '9999-12-31');
          bValue = new Date(b.dueDate || '9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }):[];

  // Analytics data
  const getAnalyticsData = () => {
    const statusData = [
      { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b' },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3b82f6' },
      { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' }
    ];

    const priorityData = [
      { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
      { name: 'Low', value: tasks.filter(t => t.priority === 'low').length }
    ];

    const overdueTasks = tasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;

    return { statusData, priorityData, overdueTasks, totalTasks: tasks.length };
  };

  // Helper functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return isDarkMode ? 'bg-red-900 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return isDarkMode ? 'bg-yellow-900 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return isDarkMode ? 'bg-green-900 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
      default: return isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return isDarkMode ? 'bg-green-900 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return isDarkMode ? 'bg-blue-900 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
      default: return isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isTaskOverdue = (task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const getSubtaskProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter(st => st.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  // Components
  const TaskList = () => (
    <div className="space-y-4">
      {filteredAndSortedTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No tasks found</h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {tasks.length === 0 
              ? "Get started by adding your first task!" 
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      ) : (
        filteredAndSortedTasks.map((task) => (
          <div
            key={String(task._id)}
            className={`rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } ${isTaskOverdue(task) ? 'border-l-4 border-l-red-500' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    onClick={() => toggleTaskStatus(task._id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : isDarkMode
                          ? 'border-gray-500 hover:border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {task.status === 'completed' && <Check size={14} />}
                  </button>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      task.status === 'completed' 
                        ? isDarkMode ? 'line-through text-gray-500' : 'line-through text-gray-500'
                        : isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {task.title}
                      {isTaskOverdue(task) && (
                        <AlertTriangle size={16} className="inline ml-2 text-red-500" />
                      )}
                    </h3>
                  </div>
                </div>
                {task.description && (
                  <p className={`mb-3 ml-9 ${
                    task.status === 'completed' 
                      ? isDarkMode ? 'line-through text-gray-500' : 'line-through text-gray-500'
                      : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {task.description}
                  </p>
                )}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="ml-9 mb-3">
                    <div className="flex items-center space-x-2 sm:ml-4 justify-end sm:justify-start">
                      <CheckSquare size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})</span>
                      <div className={`flex-1 h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}> 
                        <div 
                          className="h-2 bg-green-500 rounded-full transition-all"
                          style={{ width: `${getSubtaskProgress(task.subtasks)}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      {task.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleSubtask(task._id, subtask.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              subtask.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : isDarkMode
                                  ? 'border-gray-500 hover:border-green-500'
                                  : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {subtask.completed && <Check size={10} />}
                          </button>
                          <span className={`text-sm ${
                            subtask.completed 
                              ? isDarkMode ? 'line-through text-gray-500' : 'line-through text-gray-500'
                              : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 ml-0 sm:ml-9">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>{task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  {Array.isArray(task.labels) && task.labels.map(label => (
                    <span key={label} className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center ${isDarkMode ? 'bg-blue-900 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200'}`}><Tag size={10} className="mr-1" />{label}</span>
                  ))}
                  {task.dueDate && (
                    <span className={`flex items-center space-x-1 text-sm ${isTaskOverdue(task) ? 'text-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}><Calendar size={14} /><span>{formatDate(task.dueDate)}</span></span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setEditingTask(task)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteTask(task._id)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    return (
      <AppContext.Provider value={{ isDarkMode, toggleDarkMode }}>
        <AuthForm
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          setAuthForm={setAuthForm}
          isDarkMode={isDarkMode}
          isLoading={isLoading}
          handleLogin={handleLogin}
          handleSignup={handleSignup}
        />
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={{ isDarkMode, toggleDarkMode, user }}>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`shadow-sm border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-8">
                <div>
                  <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Task Manager Pro
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Welcome back, {user.name}
                  </p>
                </div>
                
                <nav className="flex flex-wrap gap-2 sm:space-x-3">
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'tasks'
                        ? 'bg-blue-600 text-white'
                        : isDarkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Home size={16} className="inline mr-2" />
                    Tasks
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'analytics'
                        ? 'bg-blue-600 text-white'
                        : isDarkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 size={16} className="inline mr-2" />
                    Analytics
                  </button>
                </nav>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {/* Nightly Reminders Toggle Button */}
                <button
                  onClick={toggleNightlyReminders}
                  disabled={reminderLoading}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${remindersEnabled ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} ${reminderLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{ marginLeft: 8 }}
                  title="Toggle nightly email reminders"
                >
                  <Bell size={16} />
                  <span>{remindersEnabled ? 'Disable Nightly Reminders' : 'Enable Nightly Reminders'}</span>
                  {reminderLoading && <span className="ml-2 animate-spin">⏳</span>}
                </button>
                <button
                  onClick={sendReminderNow}
                  disabled={sendNowLoading}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors bg-yellow-500 text-white hover:bg-yellow-600 ${sendNowLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{ marginLeft: 8 }}
                  title="Send reminder instantly"
                >
                  <RotateCcw size={16} />
                  <span>Send Reminder Now</span>
                  {sendNowLoading && <span className="ml-2 animate-spin">⏳</span>}
                </button>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {activeTab === 'tasks' && (
            <>
              {/* Filters and Search */}
              <div className={`rounded-lg shadow-sm p-4 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Add Task Button */}
                  <button
                    onClick={() => setShowAddForm(true)}
                    className={`mb-4 lg:mb-0 mr-4 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors bg-blue-600 text-white hover:bg-blue-700 shadow ${showAddForm ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={showAddForm}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <Plus size={18} />
                    <span>Add Task</span>
                  </button>
                  <button
                      onClick={exportUncompletedTasksToPDF}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                        isDarkMode 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } shadow`}
                    >
                      <Save size={18} />
                      <span>Export PDF</span>
                    </button>
                  <div className="flex-1 order-1 sm:order-2">
                    <div className="relative">
                      <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <input
                        type="text"
                        placeholder="Search tasks, labels, descriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 text-base sm:text-sm sm:py-2 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <Filter size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">All Tasks</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="createdAt">Created Date</option>
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                        <option value="title">Title</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className={`px-3 py-2 border rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <TaskList />
            </>
          )}

          {activeTab === 'analytics' && <Analytics getAnalyticsData={getAnalyticsData} isDarkMode={isDarkMode} />}
        </div>

        {/* Modals */}
        {showAddForm && (
          <TaskForm
            onSubmit={createTask}
            onCancel={() => {
              setShowAddForm(false);
              resetNewTask();
            }}
            labels={['Work', 'Personal', 'Urgent', 'Shopping']}
          />
        )}

        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={(updates) => updateTask(editingTask._id, updates)}
            onCancel={() => setEditingTask(null)}
            labels={['Work', 'Personal', 'Urgent', 'Shopping']}
          />
        )}

        {/* Notification */}
        <Notification />
      </div>
    </AppContext.Provider>
  );
};

export default EnhancedTaskManager;