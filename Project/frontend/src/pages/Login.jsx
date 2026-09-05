import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-youtube-bg relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-youtube-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="bg-youtube-surface border border-youtube-border rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <svg className="w-10 h-10 text-youtube-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.582 6.186s-.152-.999-.618-1.441c-.592-.619-1.254-.622-1.558-.659C16.774 4 12.001 4 12.001 4s-4.773 0-7.405.086c-.304.037-.966.04-1.558.659-.466.442-.619 1.441-.619 1.441S2.254 7.346 2.254 8.505v1.991c0 1.159.165 2.318.165 2.318s.153.999.619 1.441c.592.619 1.368.599 1.714.665 1.244.12 7.199.157 7.199.157s4.778-.005 7.41-.091c.304-.037.966-.04 1.558-.659.466-.442.618-1.441.618-1.441s.165-1.159.165-2.318V8.505c0-1.159-.165-2.319-.165-2.319zM9.996 15.005l.001-6.005 5.75 3.005-5.751 3z"/>
              </svg>
              <span className="text-2xl font-bold text-youtube-text">VidTube</span>
            </div>
            <h1 className="text-2xl font-medium text-youtube-text mb-2">Sign in</h1>
            <p className="text-sm text-youtube-text-secondary">to continue to VidTube</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email or username"
              name="username"
              type="text"
              value={credentials.username}
              onChange={handleChange}
              placeholder="you@example.com or your username"
              autoComplete="username"
              required
            />

            <div>
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mt-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-youtube-text-secondary">Don't have an account? </span>
            <Link to="/register" className="text-sm text-blue-400 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;