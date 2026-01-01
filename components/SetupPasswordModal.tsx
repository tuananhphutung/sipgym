
import React, { useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { UserProfile } from '../App';

interface SetupPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  allUsers: UserProfile[];
  onUpdateUser: (users: UserProfile[]) => void;
}

const SetupPasswordModal: React.FC<SetupPasswordModalProps> = ({ isOpen, onClose, user, allUsers, onUpdateUser }) => {
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.length < 6) {
      setError("Mật khẩu phải từ 6 ký tự");
      return;
    }
    if (pass !== confirmPass) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    // Save password
    const newUsers = allUsers.map(u => {
      if (u.phone === user.phone) {
        return { ...u, password: pass };
      }
      return u;
    });
    
    onUpdateUser(newUsers);
    onClose(); // Đóng modal sau khi set pass thành công
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 animate-in fade-in bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-4">
           <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center animate-bounce">
              <Lock className="w-8 h-8" />
           </div>
        </div>
        <h2 className="text-xl font-black text-center text-gray-800 mb-2 uppercase italic">Thiết lập mật khẩu</h2>
        <p className="text-center text-gray-500 text-xs mb-6 px-4">Để bảo vệ tài khoản, vui lòng tạo mật khẩu cho lần đăng nhập sau.</p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
           <input 
             type="password" 
             placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" 
             value={pass}
             onChange={e => setPass(e.target.value)}
             className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-orange-500"
           />
           <input 
             type="password" 
             placeholder="Nhập lại mật khẩu" 
             value={confirmPass}
             onChange={e => setConfirmPass(e.target.value)}
             className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-orange-500"
           />
           {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
           
           <button type="submit" className="w-full bg-[#FF6B00] text-white py-3 rounded-xl font-black uppercase text-sm shadow-lg mt-2">
              Lưu Mật Khẩu
           </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPasswordModal;
