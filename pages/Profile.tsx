
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, Calendar, Package, Activity, PlusCircle, RefreshCw, ClipboardList, LogOut } from 'lucide-react';
import { UserProfile } from '../App';
import SubscriptionModal from '../components/SubscriptionModal';

interface ProfileProps {
  user: UserProfile | null;
  onUpdateSubscription: (packageName: string, months: number) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateSubscription }) => {
  const navigate = useNavigate();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const calculateDaysLeft = () => {
    if (!user.subscription) return 0;
    const diff = user.subscription.expireDate - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = calculateDaysLeft();

  const menuItems = [
    { label: 'Đăng ký thêm gói', icon: PlusCircle, color: 'text-blue-500', action: () => setIsSubModalOpen(true) },
    { label: 'Gia hạn gói', icon: RefreshCw, color: 'text-green-500', action: () => setIsSubModalOpen(true) },
    { label: 'Lịch tập luyện', icon: ClipboardList, color: 'text-purple-500', action: () => navigate('/training') },
  ];

  return (
    <div className="bg-[#F7FAFC] min-h-screen animate-in slide-in-from-right duration-300 pb-10">
      {/* Top Banner */}
      <div className="bg-[#00AEEF] h-48 relative overflow-hidden flex items-center px-6">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-5 mt-4">
          <div className="w-20 h-20 bg-white rounded-full border-4 border-white/30 shadow-2xl overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} className="w-full h-full object-cover" alt="avatar" />
            )}
          </div>
          <div>
            <h1 className="text-white text-2xl font-black italic uppercase tracking-tighter">My Profile</h1>
            <p className="text-white/80 font-bold tracking-widest">{user.phone}</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 space-y-4">
        {/* Subscription Info Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-blue-50 border border-gray-50">
          <h2 className="text-gray-800 font-black text-lg mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#00AEEF]" />
            Thông Tin Gói Tập
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-400 text-sm font-bold uppercase">Gói đang dùng</span>
              <span className="text-gray-800 font-black">{user.subscription?.name || 'Chưa đăng ký'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-400 text-sm font-bold uppercase">Trạng thái</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.subscription ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {user.subscription ? 'Đang hoạt động' : 'Trống'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 text-sm font-bold uppercase">Ngày còn lại</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#00AEEF]">{daysLeft}</span>
                <span className="text-gray-400 text-[10px] font-bold">NGÀY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="bg-white rounded-[32px] p-4 shadow-xl shadow-blue-50 border border-gray-50 overflow-hidden">
          {menuItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={item.action}
              className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${idx !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className={`w-10 h-10 ${item.color.replace('text', 'bg')}/10 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-700">{item.label}</span>
              <div className="ml-auto w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center">
                 <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-gray-300 rotate-[-45deg]"></div>
              </div>
            </button>
          ))}
        </div>

        {/* Home Button */}
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-white border-2 border-gray-100 text-gray-400 py-4 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <LogOut className="w-4 h-4 rotate-180" />
          Thoát Quay Lại Trang Chủ
        </button>
      </div>

      <SubscriptionModal 
        isOpen={isSubModalOpen} 
        onClose={() => setIsSubModalOpen(false)} 
        onUpdateSubscription={onUpdateSubscription}
      />
    </div>
  );
};

export default Profile;
