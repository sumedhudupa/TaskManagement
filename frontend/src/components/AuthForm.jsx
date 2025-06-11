import React from 'react';

const AuthForm = ({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  isDarkMode,
  isLoading,
  handleLogin,
  handleSignup
}) => (
  <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
    <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div>
        <h2 className={`text-3xl font-extrabold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {authMode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h2>
      </div>
      <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-6">
        {authMode === 'signup' && (
          <input
            type="text"
            required
            placeholder="Full Name"
            value={authForm.name}
            onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        )}
        <input
          type="email"
          required
          placeholder="Email address"
          value={authForm.email}
          onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={authForm.password}
          onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        {authMode === 'signup' && (
          <input
            type="password"
            required
            placeholder="Confirm Password"
            value={authForm.confirmPassword}
            onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            autoComplete="new-password"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : (authMode === 'login' ? 'Sign in' : 'Sign up')}
        </button>
      </form>
      <div className="text-center">
        <button
          onClick={() => {
            setAuthMode(authMode === 'login' ? 'signup' : 'login');
            setAuthForm({ email: '', password: '', name: '', confirmPassword: '' });
          }}
          className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
        >
          {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  </div>
);

export default AuthForm;
