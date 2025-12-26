
import React, { useState, useMemo } from 'react';
import { User, Bell, LogOut, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Notification } from '../App';

interface HeaderProps {
  user: UserProfile | null;
  onLogout?: () => void;
  onUpdateUser?: (users: UserProfile[]) => void;
  allUsers?: UserProfile[];
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onUpdateUser, allUsers }) => {
  const navigate = useNavigate();
  const [showNotiModal, setShowNotiModal] = useState(false);

  const unreadNotifications = user?.notifications.filter(n => !n.read) || [];
  const unreadCount = unreadNotifications.length;

  // Tính số ngày còn lại
  const daysLeft = useMemo(() => {
    if (user?.subscription?.status === 'Active' && user.subscription.expireDate) {
      const diff = user.subscription.expireDate - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return null;
  }, [user]);

  const markAsRead = (id: string) => {
    if (!user || !allUsers || !onUpdateUser) return;
    const newUsers = allUsers.map(u => {
      if (u.phone === user.phone) {
        return {
          ...u,
          notifications: u.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        };
      }
      return u;
    });
    onUpdateUser(newUsers);
  };

  return (
    <>
      <div className="flex justify-between items-center px-6 pt-6 pb-2 relative z-10 bg-transparent">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => user && navigate('/profile')} 
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white overflow-hidden cursor-pointer active:scale-95 transition-transform"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : user?.phone ? (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-gray-200" />
            )}
          </div>

          <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${daysLeft !== null ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
                {daysLeft !== null ? `Còn ${daysLeft} ngày tập` : 'Chào mừng,'}
              </span>
              <span className="text-base font-black text-gray-800 leading-none">
                {user ? `Member ${user.phone.slice(-4)}` : 'Khách hàng'}
              </span>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          {user && (
            <button onClick={onLogout} className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <div 
            onClick={() => user && setShowNotiModal(true)}
            className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-90 transition-all cursor-pointer"
          >
             <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-[#00AEEF]' : 'text-gray-300'}`} />
             {unreadCount > 0 && (
               <div className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-[9px] text-white font-black">{unreadCount}</span>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotiModal && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNotiModal(false)} />
          <div className="relative w-full max-w-[430px] bg-white rounded-t-[40px] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[70vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-black uppercase italic text-gray-800">Thông báo của bạn</h3>
               <button onClick={() => setShowNotiModal(false)} className="p-2 bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-6">
              {user?.notifications.length === 0 ? (
                <div className="text-center py-10 opacity-40">
                   <Bell className="w-12 h-12 mx-auto mb-2" />
                   <p className="font-bold text-sm uppercase">Chưa có thông báo nào</p>
                </div>
              ) : (
                user?.notifications.slice().reverse().map((noti) => (
                  <div 
                    key={noti.id} 
                    onClick={() => !noti.read && markAsRead(noti.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${noti.read ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-blue-50 border-blue-100 shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm leading-tight ${noti.read ? 'font-medium text-gray-500' : 'font-black text-gray-800'}`}>
                        {noti.text}
                      </p>
                      {!noti.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0 ml-2"></div>}
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">
                      {new Date(noti.date).toLocaleString('vi-VN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
