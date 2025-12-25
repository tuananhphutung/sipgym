
import React, { useState } from 'react';
import { UserProfile, Promotion } from '../App';
import { 
  Check, X, Plus, Shield, Users, BarChart3, TrendingUp, 
  MessageSquare, UserPlus, Bell, ArrowUpRight, Lock, Unlock, 
  Star, Image as ImageIcon 
} from 'lucide-react';

interface AdminDashboardProps {
  allUsers: UserProfile[];
  setAllUsers: (users: UserProfile[]) => void;
  promotions: Promotion[];
  onAddPromo: (promo: Promotion) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsers, setAllUsers, promotions, onAddPromo }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'revenue' | 'reports' | 'pt' | 'promo' | 'notify'>('users');
  const [showPopup, setShowPopup] = useState<string | null>(null);

  const pendingUsers = allUsers.filter(u => u.subscription?.status === 'Pending');
  const activeUsers = allUsers.filter(u => u.subscription?.status === 'Active');

  const handleApprove = (phone: string) => {
    const newUsers = allUsers.map(u => {
      if (u.phone === phone && u.subscription) {
        const expireDate = Date.now() + u.subscription.months * 30 * 24 * 60 * 60 * 1000;
        return {
          ...u,
          subscription: { ...u.subscription, status: 'Active' as const, expireDate },
          notifications: [{ id: Date.now().toString(), text: `Gói tập ${u.subscription.name} của bạn đã được duyệt!`, date: Date.now(), read: false }, ...u.notifications]
        };
      }
      return u;
    });
    setAllUsers(newUsers);
  };

  const handleReject = (phone: string) => {
    const newUsers = allUsers.map(u => {
      if (u.phone === phone) {
        return {
          ...u,
          subscription: null,
          notifications: [{ id: Date.now().toString(), text: `Đăng ký gói tập của bạn không được duyệt.`, date: Date.now(), read: false }, ...u.notifications]
        };
      }
      return u;
    });
    setAllUsers(newUsers);
  };

  const handleLock = (phone: string) => {
    const newUsers = allUsers.map(u => u.phone === phone ? { ...u, isLocked: !u.isLocked } : u);
    setAllUsers(newUsers);
  };

  // Mock Data for Revenue Candlestick
  const revenueData = [
    { date: 'Thứ 2', open: 40, close: 60, high: 70, low: 30 },
    { date: 'Thứ 3', open: 60, close: 50, high: 65, low: 45 },
    { date: 'Thứ 4', open: 50, close: 80, high: 90, low: 40 },
    { date: 'Thứ 5', open: 80, close: 70, high: 85, low: 65 },
    { date: 'Thứ 6', open: 70, close: 95, high: 100, low: 60 },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-32 animate-in fade-in duration-500">
      {/* Header Admin */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div>
           <h1 className="text-xl font-black text-gray-800 italic uppercase">Admin Control</h1>
           <p className="text-[10px] font-bold text-gray-400 tracking-widest">SIP GYM NHÀ BÈ • MANAGEMENT</p>
        </div>
        <div className="flex gap-2">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold border border-blue-100">AD</div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Pending */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-black text-gray-700 text-sm uppercase px-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            Đang chờ duyệt ({pendingUsers.length})
          </h2>
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div key={user.phone} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 animate-in slide-in-from-left duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-black text-gray-800">{user.phone}</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase">Gói: {user.subscription?.name} ({user.subscription?.months}T)</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(user.phone)} className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg"><Check className="w-4 h-4" /></button>
                    <button onClick={() => handleReject(user.phone)} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            {pendingUsers.length === 0 && <p className="text-center text-xs text-gray-400 py-10 font-medium">Không có yêu cầu chờ duyệt</p>}
          </div>
        </div>

        {/* Column 2: Active */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-black text-gray-700 text-sm uppercase px-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Người dùng Active ({activeUsers.length})
          </h2>
          <div className="space-y-3">
            {activeUsers.map(user => (
              <div key={user.phone} className="bg-green-50/50 rounded-3xl p-4 shadow-sm border border-green-100 animate-in fade-in">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-black text-gray-800">{user.phone}</p>
                  <button onClick={() => handleLock(user.phone)} className={`p-2 rounded-xl border ${user.isLocked ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-400 border-gray-100'}`}>
                    {user.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-full text-green-600 border border-green-100 uppercase italic">{user.subscription?.name}</span>
                  <span className="text-[9px] font-bold text-gray-400">Hết hạn: {new Date(user.subscription?.expireDate || 0).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <button className="text-[10px] font-bold bg-white py-2 rounded-xl text-blue-500 shadow-sm">+ Gói</button>
                   <button className="text-[10px] font-bold bg-white py-2 rounded-xl text-green-500 shadow-sm">Gia hạn</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Revenue Candlestick Simulation */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-black text-gray-700 text-sm uppercase px-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Doanh Thu
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
             <div className="flex justify-between items-end h-40 gap-2 mb-4">
                {revenueData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div className="absolute -top-6 text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity">{d.high}M</div>
                    <div className="w-0.5 h-full bg-gray-200 absolute"></div>
                    <div 
                      className={`w-3 rounded-sm relative z-10 ${d.close > d.open ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ 
                        height: `${Math.abs(d.close - d.open)}%`,
                        bottom: `${Math.min(d.open, d.close)}%`
                      }}
                    ></div>
                    <span className="text-[8px] mt-2 font-bold text-gray-400">{d.date}</span>
                  </div>
                ))}
             </div>
             <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold uppercase">Tổng tháng</span>
                  <span className="text-gray-800 font-black">245.000.000đ</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-blue-500 h-full w-[70%]"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Admin Menu Floating */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-gray-900 rounded-[32px] p-3 flex justify-around items-center shadow-2xl z-50 border border-white/10">
        <button onClick={() => setShowPopup('users')} className="flex flex-col items-center gap-1 relative">
           <Users className="w-6 h-6 text-white" />
           <span className="text-[8px] text-white/50 font-bold">USERS</span>
           {pendingUsers.length > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full font-black border-2 border-gray-900">{pendingUsers.length}</div>}
        </button>
        <button onClick={() => setShowPopup('revenue')} className="flex flex-col items-center gap-1">
           <TrendingUp className="w-6 h-6 text-white" />
           <span className="text-[8px] text-white/50 font-bold">TÀI CHÍNH</span>
        </button>
        <button onClick={() => setShowPopup('pt')} className="flex flex-col items-center gap-1">
           <UserPlus className="w-6 h-6 text-white" />
           <span className="text-[8px] text-white/50 font-bold">PT</span>
        </button>
        <button onClick={() => setShowPopup('promo')} className="flex flex-col items-center gap-1">
           <Bell className="w-6 h-6 text-white" />
           <span className="text-[8px] text-white/50 font-bold">PROMO</span>
        </button>
        <button onClick={() => setShowPopup('notify')} className="flex flex-col items-center gap-1">
           <MessageSquare className="w-6 h-6 text-white" />
           <span className="text-[8px] text-white/50 font-bold">GỬI TIN</span>
        </button>
      </div>

      {/* Admin Popups */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 animate-in fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPopup(null)} />
          <div className="relative w-full max-w-[430px] bg-white rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-gray-800">{showPopup}</h3>
              <button onClick={() => setShowPopup(null)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            
            {showPopup === 'promo' && (
              <div className="space-y-4">
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center gap-2 cursor-pointer">
                   <ImageIcon className="w-8 h-8 text-gray-300" />
                   <span className="text-xs font-bold text-gray-400">Thêm hình ảnh banner</span>
                </div>
                <input placeholder="Tiêu đề khuyến mãi..." className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-none outline-none" />
                <button 
                  onClick={() => {
                    onAddPromo({ id: Date.now().toString(), title: 'Khuyến mãi hè cực sốc!', image: 'https://picsum.photos/400/200', date: Date.now() });
                    setShowPopup(null);
                  }}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg"
                >
                  Đăng Tin
                </button>
              </div>
            )}

            {showPopup === 'pt' && (
              <div className="space-y-4">
                 <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=PT1" className="w-full h-full" alt="pt" />
                    </div>
                    <div>
                       <p className="font-black text-gray-800">Hoàng Nam</p>
                       <div className="flex gap-0.5 text-orange-400"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
                    </div>
                 </div>
                 <button className="w-full border-2 border-dashed border-gray-200 py-4 rounded-2xl text-gray-400 font-bold flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Thêm PT Mới
                 </button>
              </div>
            )}

            {showPopup === 'notify' && (
              <div className="space-y-4">
                 <textarea placeholder="Nội dung thông báo..." className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-none outline-none min-h-[120px]" />
                 <div className="flex gap-2">
                    <button className="flex-1 bg-gray-800 text-white py-4 rounded-2xl font-black text-sm uppercase">Gửi Tất Cả</button>
                    <button className="flex-1 bg-white border border-gray-100 text-gray-400 py-4 rounded-2xl font-black text-sm uppercase">Chọn User</button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
