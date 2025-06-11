import React from 'react';
import { RotateCcw, X } from 'lucide-react';

const Notification = ({ notification, undoDelete, isDarkMode, setNotification }) => {
  if (!notification) return null;

  const bgColor = {
    success: isDarkMode ? 'bg-green-800 border-green-600' : 'bg-green-100 border-green-400',
    error: isDarkMode ? 'bg-red-800 border-red-600' : 'bg-red-100 border-red-400',
    info: isDarkMode ? 'bg-blue-800 border-blue-600' : 'bg-blue-100 border-blue-400'
  };

  const textColor = {
    success: isDarkMode ? 'text-green-300' : 'text-green-700',
    error: isDarkMode ? 'text-red-300' : 'text-red-700',
    info: isDarkMode ? 'text-blue-300' : 'text-blue-700'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${bgColor[notification.type]} ${textColor[notification.type]} shadow-lg`}>
      <div className="flex items-center justify-between">
        <span>{notification.message}</span>
        <div className="flex items-center ml-4">
          {notification.showUndo && (
            <button
              onClick={undoDelete}
              className="mr-2 text-sm underline hover:no-underline"
            >
              <RotateCcw size={14} className="inline mr-1" />
              Undo
            </button>
          )}
          <button
            onClick={() => setNotification(null)}
            className="text-current hover:opacity-70"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
