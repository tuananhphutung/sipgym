
import React, { useRef } from 'react';
import { User, Gift, Bell, LogOut, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../App';

interface HeaderProps {
  user: UserProfile | null;
  onLogout?: () => void;
  onUpdateAvatar?: (base64: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onUpdateAvatar }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateDaysLeft = () => {
    if (!user?.subscription || user.subscription.status !== 'Active' || !user.subscription.expireDate) return 0;
    const diff = user.subscription.expireDate - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const unreadCount = user?.notifications.filter(n => !n.read).length || 0;

  const handleAvatarClick = () => {
    if (user) navigate('/profile');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateAvatar) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 pt-6 relative z-10">
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div onClick={handleAvatarClick} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white overflow-hidden cursor-pointer active:scale-95 transition-transform">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : user?.phone ? (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-gray-400" />
            )}
          </div>
          {user && (
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00AEEF] rounded-full flex items-center justify-center border-2 border-white text-white shadow-sm">
              <Camera className="w-3 h-3" />
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="flex flex-col" onClick={handleAvatarClick}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Chào mừng,</span>
              {user?.subscription?.status === 'Active' && (
                <span className="bg-orange-100 text-orange-600 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                  {calculateDaysLeft()} NGÀY
                </span>
              )}
            </div>
            <span className="text-sm font-black text-gray-800 leading-none">
              {user ? `Member ${user.phone.slice(-4)}` : 'Khách hàng'}
            </span>
        </div>
      </div>
      
      <div className="flex gap-2.5 items-center">
        {user && (
          <button onClick={onLogout} className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shadow-sm border border-red-100 text-red-500 hover:bg-red-100 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        )}
        <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
           <Bell className="w-5 h-5 text-gray-400" />
           {unreadCount > 0 && <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 border-2 border-white rounded-full"></div>}
        </div>
      </div>
    </div>
  );
};

export default Header;
