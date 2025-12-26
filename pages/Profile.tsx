
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Package, PlusCircle, RefreshCw, ClipboardList, LogOut, ShieldCheck, X, Camera } from 'lucide-react';
import { UserProfile } from '../App';
import SubscriptionModal from '../components/SubscriptionModal';

interface ProfileProps {
  user: UserProfile | null;
  onUpdateSubscription: (packageName: string, months: number, price: number) => void;
  onUpdateUser: (users: UserProfile[]) => void;
  allUsers: UserProfile[];
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateSubscription, onUpdateUser, allUsers }) => {
  const navigate = useNavigate();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  if (!user) {
    navigate('/');
    return null;
  }

  const calculateDaysLeft = () => {
    if (!user.subscription || !user.subscription.expireDate) return 0;
    const diff = user.subscription.expireDate - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = calculateDaysLeft();

  const handleEditOpen = () => {
    setEditName(user.name || `Member ${user.phone.slice(-4)}`);
    setEditAvatar(user.avatar || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    const newUsers = allUsers.map(u => {
      if (u.phone === user.phone) {
        return { ...u, name: editName, avatar: editAvatar || null };
      }
      return u;
    });
    onUpdateUser(newUsers);
    setIsEditModalOpen(false);
  };

  const menuItems = [
    { label: 'Đăng ký thêm gói', icon: PlusCircle, color: 'text-blue-500', action: () => setIsSubModalOpen(true) },
    { label: 'Gia hạn gói', icon: RefreshCw, color: 'text-green-500', action: () => setIsSubModalOpen(true) },
    { label: 'Lịch tập luyện', icon: ClipboardList, color: 'text-purple-500', action: () => navigate('/schedule') },
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
        
        <div className="flex items-center gap-5 mt-4 w-full">
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-full border-4 border-white/30 shadow-2xl overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} className="w-full h-full object-cover" alt="avatar" />
              )}
            </div>
            <button 
              onClick={handleEditOpen}
              className="absolute bottom-0 right-0 bg-white text-[#00AEEF] p-1.5 rounded-full shadow-lg border border-gray-100"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-white text-xl font-black italic uppercase tracking-tighter leading-tight truncate">
              {user.name || `Member ${user.phone.slice(-4)}`}
            </h1>
            <p className="text-white/80 font-bold tracking-widest text-sm">{user.phone}</p>
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
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.subscription?.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {user.subscription?.status === 'Active' ? 'Đang hoạt động' : user.subscription?.status === 'Pending' ? 'Đang chờ duyệt' : 'Trống'}
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-gray-800 uppercase italic">Chỉnh sửa hồ sơ</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-50 rounded-full"><X className="w-5 h-5 text-gray-400"/></button>
             </div>
             
             <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Link Ảnh Đại Diện (URL)</label>
                  <div className="relative mt-1">
                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={editAvatar} 
                      onChange={(e) => setEditAvatar(e.target.value)} 
                      className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tên hiển thị</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className="w-full bg-gray-50 rounded-xl py-3 px-4 text-sm font-bold mt-1 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                    placeholder="Nhập tên mới..."
                  />
                </div>

                <button 
                  onClick={handleSaveProfile}
                  className="w-full bg-[#00AEEF] text-white py-3 rounded-xl font-black uppercase shadow-lg shadow-blue-200 active:scale-95 transition-all mt-2"
                >
                  Lưu Thay Đổi
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
