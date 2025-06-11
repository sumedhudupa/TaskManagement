import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Check, CheckSquare, AlertTriangle, Tag, Calendar } from "lucide-react";

const TaskList = ({
  filteredAndSortedTasks,
  isDarkMode,
  isTaskOverdue,
  getSubtaskProgress,
  toggleTaskStatus,
  toggleSubtask,
  setEditingTask,
  deleteTask,
  getPriorityColor,
  getStatusColor,
  onDragEnd
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="taskList">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} w-full`}
          >
            {filteredAndSortedTasks.length === 0 && (
              <div className="text-center text-gray-400 py-8">No tasks found.</div>
            )}
            {filteredAndSortedTasks.map((task, index) => (
              <Draggable key={task._id} draggableId={String(task._id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`rounded-lg shadow p-4 transition-all bg-white dark:bg-gray-800 border-l-4 ${getPriorityColor(task.priority)} ${isTaskOverdue(task) ? 'border-red-500' : ''} ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          className={`mr-2 focus:outline-none ${task.completed ? 'text-green-500' : 'text-gray-400'}`}
                          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {task.completed ? <CheckSquare size={20} /> : <Check size={20} />}
                        </button>
                        <span className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                        {isTaskOverdue(task) && !task.completed && (
                          <AlertTriangle className="ml-2 text-red-500" size={18} title="Overdue" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="text-blue-500 hover:underline text-sm"
                        >Edit</button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="text-red-500 hover:underline text-sm"
                        >Delete</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-300">
                        <Calendar size={14} />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                      {task.labels && task.labels.map((label, i) => (
                        <span key={i} className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          <Tag size={12} />{label}
                        </span>
                      ))}
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    </div>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-3 ml-6">
                        <div className="text-xs text-gray-500 mb-1">Subtasks ({getSubtaskProgress(task).completed}/{getSubtaskProgress(task).total})</div>
                        <ul className="space-y-1">
                          {task.subtasks.map((subtask, subIdx) => (
                            <li key={subIdx} className="flex items-center gap-2">
                              <button
                                onClick={() => toggleSubtask(task._id, subIdx)}
                                className={`focus:outline-none ${subtask.completed ? 'text-green-500' : 'text-gray-400'}`}
                                title={subtask.completed ? 'Mark as incomplete' : 'Mark as complete'}
                              >
                                {subtask.completed ? <CheckSquare size={16} /> : <Check size={16} />}
                              </button>
                              <span className={subtask.completed ? 'line-through text-gray-400' : ''}>{subtask.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TaskList;
