import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ArrowRight,
  Shield
} from 'lucide-react';

const AuthForm = ({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  isDarkMode,
  isLoading,
  handleLogin,
  handleSignup
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 5;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  // Handle field validation
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value) ? '' : 'Please enter a valid email address';
      case 'password':
        return validatePassword(value) ? '' : 'Password must be at least 6 characters long';
      case 'name':
        return validateName(value) ? '' : 'Name must be at least 2 characters long';
      case 'confirmPassword':
        return value === authForm.password ? '' : 'Passwords do not match';
      default:
        return '';
    }
  };

  // Handle input change
  const handleInputChange = (name, value) => {
    setAuthForm(prev => ({ ...prev, [name]: value }));
    
    // Clear auth error when user starts typing
    if (authError) setAuthError('');
    
    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle input blur
  const handleInputBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, authForm[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Enhanced form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    
    // Validate all fields
    const newErrors = {};
    Object.keys(authForm).forEach(key => {
      if (authMode === 'login' && (key === 'name' || key === 'confirmPassword')) return;
      const error = validateField(key, authForm[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched(Object.keys(authForm).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    // Stop if there are validation errors
    if (Object.keys(newErrors).length > 0) return;
    
    try {
      if (authMode === 'login') {
        const result = await handleLogin(e);
        if (result && result.success) {
          setAuthSuccess('Login successful! Redirecting...');
        }
      } else {
        const result = await handleSignup(e);
        if (result && result.success) {
          setAuthSuccess('Account created successfully! Redirecting...');
        }
      }
    } catch (error) {
      // Error is handled by the parent components, but we can also show it here
      setAuthError(error.message || 'Authentication failed. Please try again.');
    }
  };

  // Get input styling with error states
  const getInputStyles = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    const baseStyles = `w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      isDarkMode 
        ? 'bg-gray-700/50 text-white placeholder-gray-400 focus:ring-offset-gray-800' 
        : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-offset-white'
    }`;
    
    if (hasError) {
      return `${baseStyles} border-red-500 focus:border-red-500 focus:ring-red-500`;
    }
    
    return `${baseStyles} ${
      isDarkMode 
        ? 'border-gray-600 focus:border-blue-500 focus:ring-blue-500' 
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      <div className={`w-full max-w-md space-y-8 ${
        isDarkMode 
          ? 'bg-gray-800/80 backdrop-blur-sm' 
          : 'bg-white/80 backdrop-blur-sm'
      } p-8 rounded-2xl shadow-2xl border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {/* Header */}
        <div className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isDarkMode 
              ? 'bg-blue-600/20 text-blue-400' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            <Shield size={32} />
          </div>
          <h2 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className={`mt-2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {authMode === 'login' 
              ? 'Sign in to continue to your tasks' 
              : 'Start organizing your tasks today'}
          </p>
        </div>

        {/* Error/Success Messages */}
        {authError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Authentication Error
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {authError}
              </p>
            </div>
          </div>
        )}

        {authSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Success!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {authSuccess}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field (signup only) */}
          {authMode === 'signup' && (
            <div>
              <div className="relative">
                <User size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                  errors.name && touched.name 
                    ? 'text-red-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={authForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleInputBlur('name')}
                  className={getInputStyles('name')}
                />
              </div>
              {errors.name && touched.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.name}
                </p>
              )}
            </div>
          )}

          {/* Email field */}
          <div>
            <div className="relative">
              <Mail size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                errors.email && touched.email 
                  ? 'text-red-500' 
                  : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="email"
                required
                placeholder="Email address"
                value={authForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
                className={getInputStyles('email')}
              />
            </div>
            {errors.email && touched.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <div className="relative">
              <Lock size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                errors.password && touched.password 
                  ? 'text-red-500' 
                  : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleInputBlur('password')}
                className={getInputStyles('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password field (signup only) */}
          {authMode === 'signup' && (
            <div>
              <div className="relative">
                <Lock size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                  errors.confirmPassword && touched.confirmPassword 
                    ? 'text-red-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm Password"
                  value={authForm.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleInputBlur('confirmPassword')}
                  className={getInputStyles('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98]'
            } ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                {authMode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {authMode === 'login' ? 'Sign in' : 'Create account'}
                <ArrowRight size={20} className="ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Auth mode toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setAuthForm({ email: '', password: '', name: '', confirmPassword: '' });
              setErrors({});
              setTouched({});
              setAuthError('');
              setAuthSuccess('');
            }}
            className={`text-sm font-medium transition-colors ${
              isDarkMode 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            {authMode === 'login' 
              ? "Don't have an account? Create one" 
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;