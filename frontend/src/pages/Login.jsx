import { useState } from 'react';
import { useAuth } from '../route';
import { Button } from '../components/ui/button';
import { LockKeyhole, Mail, Eye, EyeOff, ArrowRight, Briefcase, Shield, Users } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithBackend } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithBackend(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    {
      role: 'Admin',
      email: 'arjun.desai@alignhq.com',
      password: 'arjun123',
      icon: Shield,
    },
    {
      role: 'Manager',
      email: 'rajesh.kumar@alignhq.com',
      password: 'rajesh123',
      icon: Briefcase,
    },
    {
      role: 'Employee',
      email: 'neha.patel@alignhq.com',
      password: 'neha123',
      icon: Users,
    },
  ];

  const quickLogin = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#0f1720] to-[#08090b] flex items-center justify-center p-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="g1" cx="30%" cy="20%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g2" x1="0" x2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <pattern id="lines" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40 L40 0" stroke="#ffffff" strokeOpacity="0.02" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g2)" />
          <rect width="100%" height="100%" fill="url(#lines)" />
          <circle cx="8%" cy="12%" r="320" fill="url(#g1)" />
          <circle cx="86%" cy="82%" r="420" fill="url(#g1)" />
          <g opacity="0.03" stroke="#ffffff" strokeWidth="1">
            <path d="M-200 100 L1200 1200" />
            <path d="M0 400 L1200 1600" />
          </g>
        </svg>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left Card: Demo Credentials ONLY */}
        <aside className="bg-white/96 backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex flex-col justify-between border border-gray-200/10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-800">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#111827" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">Demo Credentials</div>
                <div className="text-xs text-gray-500">Use these to explore role-based views</div>
              </div>
            </div>

            <div className="space-y-3">
              {demoUsers.map((u) => {
                const Icon = u.icon;
                return (
                  <button
                    key={u.email}
                    onClick={() => quickLogin(u.email, u.password)}
                    className="w-full text-left rounded-xl px-4 py-3 hover:shadow-md transition flex items-center gap-4 bg-white border border-gray-100"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 text-gray-800 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">{u.role}</div>
                      </div>
                      <div className="text-xs text-gray-600 truncate">{u.email}</div>
                      <div className="text-xs text-gray-500 mt-1">Password: <span className="font-mono">{u.password}</span></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6">Click a card to auto-fill email and password.</p>
        </aside>

        {/* Right Card: Minimal Login Form */}
        <main className="relative bg-white/96 backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex items-center justify-center border border-gray-200/10">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-sm text-gray-600 mb-6">Sign in to continue to your dashboard.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded">
                  {error}
                </div>
              )}

              <label className="block text-xs text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <div className="w-9 h-9 rounded-md bg-gray-50 flex items-center justify-center text-gray-500">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                <input
                  className="w-full pl-16 pr-3 py-3 border border-gray-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <label className="block text-xs text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <div className="w-9 h-9 rounded-md bg-gray-50 flex items-center justify-center text-gray-500">
                    <LockKeyhole className="w-4 h-4" />
                  </div>
                </div>
                <input
                  className="w-full pl-16 pr-12 py-3 border border-gray-100 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            <div className="mt-6 text-xs text-gray-500">
              <p>Need help? Contact your administrator.</p>
            </div>
          
            {/* subtle monochrome illustration */}
            <div className="absolute -right-8 -top-8 w-44 h-44 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" stroke="#111827" strokeWidth="2">
                  <rect x="12" y="30" width="120" height="80" rx="8" />
                  <path d="M18 40h110" />
                  <circle cx="150" cy="50" r="30" />
                  <path d="M130 80 L170 120" />
                </g>
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
