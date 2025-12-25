
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      localStorage.setItem('admin_logged', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Sai tài khoản hoặc mật khẩu!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-[360px] bg-white rounded-[40px] p-8 shadow-2xl border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-center text-gray-800 mb-2">Chào Admin</h1>
        <p className="text-gray-400 text-center text-xs font-bold uppercase tracking-widest mb-8">App Sip Gym Nhà Bè</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all uppercase mt-4"
          >
            Đăng Nhập
          </button>
        </form>
      </div>
      
      <button onClick={() => navigate('/')} className="mt-8 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors">
        Quay lại trang User
      </button>
    </div>
  );
};

export default AdminLogin;
