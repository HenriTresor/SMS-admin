import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from './Input';
import { API_ENDPOINTS } from '../constants';
import { forceUpdate } from '../App';
import api from '../utils/api';
import Button from './Button';

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
    <div className="relative min-h-screen w-full flex justify-center overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-slate-600/30 blur-3xl" />
      </div>

      <div className="relative sm:w-1/2 w-full flex min-h-screen items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl gap-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl lg:grid-cols-[1.05fr,1fr] lg:p-12">
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-4 py-1 text-sm font-medium text-indigo-200">
                Credit Jambo • Admin Portal
              </span>
            </div>
           
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
            <div className="mb-8 space-y-2 text-center">
              <h2 className="text-3xl font-semibold text-white">Admin login</h2>
              <p className="text-sm text-slate-300">Use your verified credentials to continue</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6" noValidate>
              <Input
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={setUsername}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                required
              />

              <div className="pt-2">
                <Button type="submit" disabled={loading} className="w-full justify-center">
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </div>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">
              Protected access • Device verification enforced by Credit Jambo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
;

export default Login;
