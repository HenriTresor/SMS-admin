import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from './Input';
import { API_ENDPOINTS } from '../constants';
import { forceUpdate } from '../App';
import api from '../utils/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission and page refresh

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, { username, password }, {
        validateStatus: (status) => status < 500 // Accept all status codes below 500
      });
      console.log('Login response:', response.data); // Debug log

      if (response.status === 200 && response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        if (forceUpdate) forceUpdate();
        navigate('/dashboard');
        // fallback
        setTimeout(() => {
          if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
          }
        }, 100);
      } else {
        console.log('Login failed with status:', response.status);
        const errorMessage = response.data?.error || 'Invalid credentials';
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Login error:', err); // Debug log
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h2>
          <p className="text-gray-600">Access your admin dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6" noValidate>
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={setUsername}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
