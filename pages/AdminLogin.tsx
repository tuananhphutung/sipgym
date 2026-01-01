
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { AdminProfile } from '../App';

interface AdminLoginProps {
  admins?: AdminProfile[];
  onLoginSuccess?: (admin: AdminProfile) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ admins = [], onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check against admins list props or default hardcoded for safety fallback
    const admin = admins.find(a => a.username === username && a.password === password);

    if (admin) {
      if (onLoginSuccess) {
         onLoginSuccess(admin);
      }
      localStorage.setItem('admin_logged', 'true'); // Keep for legacy check if needed
      navigate('/admin/dashboard');
    } else {
      setError('Sai tài khoản hoặc mật khẩu!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-[400px] bg-slate-900 rounded-[40px] p-10 shadow-2xl border border-slate-800">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-center text-white mb-2 italic">SIP GYM ADMIN</h1>
        <p className="text-slate-500 text-center text-[10px] font-bold uppercase tracking-[0.2em] mb-10">Hệ thống quản trị tối cao</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-14 pr-6 font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-14 pr-6 font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
            />
          </div>

          {error && <p className="text-red-400 text-xs font-bold text-center animate-pulse">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all uppercase tracking-wider"
          >
            Đăng Nhập Hệ Thống
          </button>
        </form>
      </div>
      
      <button onClick={() => navigate('/')} className="mt-8 text-slate-500 font-bold text-sm hover:text-white transition-colors">
        Quay lại giao diện người dùng
      </button>
    </div>
  );
};

export default AdminLogin;
