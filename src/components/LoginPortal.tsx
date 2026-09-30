import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { authService } from '../services/api';
import { Sparkles, UserCheck, Shield, GraduationCap, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [isRegistering, setIsRegistering] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    setLoading(true);

    const demoEmail =
      role === 'ADMIN' ? 'admin@skillforge.ai' :
      role === 'STAFF' ? 'staff@skillforge.ai' : 'student@skillforge.ai';
    const demoPassword =
      role === 'ADMIN' ? 'admin123' :
      role === 'STAFF' ? 'staff123' : 'student123';

    try {
      const res = await authService.login(demoEmail, demoPassword, role);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const res = await authService.register(name, email, password, department, selectedRole);
        onLoginSuccess(res.user);
      } else {
        const res = await authService.login(email, password, selectedRole);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/15 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-3 shadow-lg shadow-indigo-500/30 border border-white/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">SKILL FORGE <span className="text-indigo-400">AI</span></h2>
          <p className="text-xs text-slate-300 mt-1">Unified Authenticated Learning & Portal Gateway</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/5 rounded-2xl mb-6 border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSelectedRole('STUDENT')}
            className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-bold transition backdrop-blur-md ${
              selectedRole === 'STUDENT'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20 border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <GraduationCap className="w-4 h-4 mb-1" />
            STUDENT
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('STAFF')}
            className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-bold transition backdrop-blur-md ${
              selectedRole === 'STAFF'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20 border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserCheck className="w-4 h-4 mb-1" />
            STAFF
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('ADMIN')}
            className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-bold transition backdrop-blur-md ${
              selectedRole === 'ADMIN'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/20 border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Shield className="w-4 h-4 mb-1" />
            ADMIN
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label htmlFor="login-name" className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                id="login-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sridharan V"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md placeholder:text-slate-500 min-h-[42px]"
                required={isRegistering}
              />
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={
                  selectedRole === 'ADMIN' ? 'admin@skillforge.ai' :
                  selectedRole === 'STAFF' ? 'staff@skillforge.ai' : 'student@skillforge.ai'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md placeholder:text-slate-500 min-h-[42px]"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md placeholder:text-slate-500 min-h-[42px]"
                required
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label htmlFor="login-department" className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <select
                id="login-department"
                name="department"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md min-h-[42px]"
              >
                <option value="Computer Science & Engineering" className="bg-slate-900">Computer Science & Engineering</option>
                <option value="Information Technology" className="bg-slate-900">Information Technology</option>
                <option value="AI & Data Science" className="bg-slate-900">AI & Data Science</option>
                <option value="Electronics & Communication" className="bg-slate-900">Electronics & Communication</option>
                <option value="General Aptitude" className="bg-slate-900">General Aptitude</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xs text-white transition shadow-lg border border-white/20 backdrop-blur-md flex items-center justify-center space-x-2 ${
              selectedRole === 'ADMIN' ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20' :
              selectedRole === 'STAFF' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/20' :
              'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-500/20'
            }`}
          >
            <span>{loading ? 'Authenticating...' : isRegistering ? 'Create Account' : `Login to ${selectedRole} Portal`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-xs text-slate-300 hover:text-indigo-300 transition font-medium"
          >
            {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register here"}
          </button>
        </div>

        {/* Quick Demo Access Buttons */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-300 font-semibold mb-3 tracking-wider">1-CLICK DEMO ACCOUNT ACCESS</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('STUDENT')}
              className="py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-[11px] font-semibold transition backdrop-blur-md"
            >
              Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('STAFF')}
              className="py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-[11px] font-semibold transition backdrop-blur-md"
            >
              Staff Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('ADMIN')}
              className="py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-[11px] font-semibold transition backdrop-blur-md"
            >
              Admin Demo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
