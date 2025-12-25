
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Promotion } from '../App';
import { 
  Check, X, Plus, Shield, Users, BarChart3, TrendingUp, 
  MessageSquare, UserPlus, Bell, ArrowUpRight, Lock, Unlock, 
  Star, Image as ImageIcon, LogOut
} from 'lucide-react';

interface AdminDashboardProps {
  allUsers: UserProfile[];
  setAllUsers: (users: UserProfile[]) => void;
  promotions: Promotion[];
  onAddPromo: (promo: Promotion) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsers, setAllUsers, promotions, onAddPromo }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState<string | null>(null);

  // Kiểm tra quyền Admin
  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_logged') === 'true';
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_logged');
    navigate('/admin');
  };

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
    <div className="min-h-screen bg-[#F7F9FC] pb-32 animate-in fade-in duration-500 w-full overflow-x-hidden">
      {/* Header Admin */}
      <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-50 shadow-sm w-full">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Shield className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-xl font-black text-gray-800 italic uppercase">SIP GYM NHÀ BÈ</h1>
              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Hệ thống quản trị tập trung</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-black text-gray-800">Quản Trị Viên</span>
              <span className="text-[10px] font-bold text-green-500">Đang trực tuyến</span>
            </div>
            <button onClick={handleAdminLogout} className="p-3 bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-100 transition-all">
               <LogOut className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Pending */}
        <div className="bg-white/50 p-6 rounded-[40px] border border-gray-100">
          <h2 className="flex items-center justify-between font-black text-gray-700 text-sm uppercase mb-6 px-2">
            <span className="flex items-center gap-2">
               <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
               Chờ duyệt
            </span>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs">{pendingUsers.length}</span>
          </h2>
          <div className="space-y-4">
            {pendingUsers.map(user => (
              <div key={user.phone} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-gray-800 text-lg">{user.phone}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg uppercase tracking-wider border border-blue-100">
                        {user.subscription?.name}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 italic">
                        {user.subscription?.months} Tháng
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleApprove(user.phone)} className="w-10 h-10 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleReject(user.phone)} className="w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-100 hover:scale-105 active:scale-95 transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingUsers.length === 0 && (
              <div className="text-center py-20">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-gray-200" />
                 </div>
                 <p className="text-sm text-gray-400 font-bold">Mọi thứ đã được xử lý xong!</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Active */}
        <div className="bg-white/50 p-6 rounded-[40px] border border-gray-100">
          <h2 className="flex items-center justify-between font-black text-gray-700 text-sm uppercase mb-6 px-2">
            <span className="flex items-center gap-2">
               <div className="w-3 h-3 bg-green-500 rounded-full"></div>
               Đang hoạt động
            </span>
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">{activeUsers.length}</span>
          </h2>
          <div className="space-y-4">
            {activeUsers.map(user => (
              <div key={user.phone} className={`rounded-3xl p-5 shadow-sm border transition-all ${user.isLocked ? 'bg-red-50 border-red-100 opacity-60' : 'bg-white border-green-50'}`}>
                <div className="flex justify-between items-center mb-4">
                  <p className="font-black text-gray-800 text-lg">{user.phone}</p>
                  <button onClick={() => handleLock(user.phone)} className={`p-3 rounded-2xl transition-all ${user.isLocked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                    {user.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-[10px] font-black bg-white px-3 py-1.5 rounded-xl text-green-600 border border-green-100 uppercase italic shadow-sm">
                    {user.subscription?.name}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    Hết hạn: {new Date(user.subscription?.expireDate || 0).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <button className="text-[11px] font-black bg-white py-3 rounded-2xl text-blue-500 shadow-sm border border-gray-50 hover:bg-blue-50 transition-colors uppercase">Gia hạn</button>
                   <button className="text-[11px] font-black bg-white py-3 rounded-2xl text-orange-500 shadow-sm border border-gray-50 hover:bg-orange-50 transition-colors uppercase">Nâng cấp</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Revenue */}
        <div className="bg-white/50 p-6 rounded-[40px] border border-gray-100">
          <h2 className="flex items-center gap-2 font-black text-gray-700 text-sm uppercase mb-6 px-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Thống kê doanh thu
          </h2>
          <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-blue-50 border border-gray-50">
             <div className="flex justify-between items-end h-48 gap-3 mb-6">
                {revenueData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end group relative cursor-pointer">
                    <div className="absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg font-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none mb-2 z-10">
                       {d.high}M
                    </div>
                    <div className="w-1 h-full bg-gray-50 absolute rounded-full"></div>
                    <div 
                      className={`w-4 md:w-6 rounded-xl relative z-10 transition-all duration-700 hover:brightness-110 ${d.close > d.open ? 'bg-green-500 shadow-lg shadow-green-100' : 'bg-red-500 shadow-lg shadow-red-100'}`}
                      style={{ 
                        height: `${Math.abs(d.close - d.open)}%`,
                        bottom: `${Math.min(d.open, d.close)}%`
                      }}
                    ></div>
                    <span className="text-[9px] mt-4 font-black text-gray-400 uppercase tracking-tighter">{d.date}</span>
                  </div>
                ))}
             </div>
             
             <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Doanh thu dự kiến</p>
                  <div className="flex justify-between items-end">
                     <span className="text-2xl font-black text-gray-800">245.000.000đ</span>
                     <span className="text-[10px] font-black text-green-500 bg-green-100 px-2 py-0.5 rounded-lg">+12%</span>
                  </div>
                </div>
                <div className="p-2">
                   <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-bold text-gray-500">Mục tiêu quý</span>
                      <span className="font-black text-blue-600">75%</span>
                   </div>
                   <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5 border border-gray-200">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: '75%' }}></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Admin Menu Floating Container */}
      <div className="fixed bottom-8 left-0 right-0 z-50 px-6 pointer-events-none">
        <div className="max-w-[800px] mx-auto bg-gray-900/90 backdrop-blur-xl rounded-[32px] p-4 flex justify-around items-center shadow-2xl border border-white/10 pointer-events-auto">
          <button onClick={() => setShowPopup('users')} className="flex flex-col items-center gap-1.5 relative group">
             <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-500 transition-all">
                <Users className="w-6 h-6 text-white" />
             </div>
             <span className="text-[8px] text-white/50 font-black tracking-widest uppercase">Thành viên</span>
             {pendingUsers.length > 0 && <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-xl font-black border-4 border-gray-900 shadow-lg">{pendingUsers.length}</div>}
          </button>
          
          <button onClick={() => setShowPopup('revenue')} className="flex flex-col items-center gap-1.5 group">
             <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-green-500 transition-all">
                <TrendingUp className="w-6 h-6 text-white" />
             </div>
             <span className="text-[8px] text-white/50 font-black tracking-widest uppercase">Doanh số</span>
          </button>
          
          <button onClick={() => setShowPopup('pt')} className="flex flex-col items-center gap-1.5 group">
             <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-purple-500 transition-all">
                <UserPlus className="w-6 h-6 text-white" />
             </div>
             <span className="text-[8px] text-white/50 font-black tracking-widest uppercase">Huấn luyện</span>
          </button>
          
          <button onClick={() => setShowPopup('promo')} className="flex flex-col items-center gap-1.5 group">
             <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-orange-500 transition-all">
                <Bell className="w-6 h-6 text-white" />
             </div>
             <span className="text-[8px] text-white/50 font-black tracking-widest uppercase">Quảng cáo</span>
          </button>
          
          <button onClick={() => setShowPopup('notify')} className="flex flex-col items-center gap-1.5 group">
             <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-400 transition-all">
                <MessageSquare className="w-6 h-6 text-white" />
             </div>
             <span className="text-[8px] text-white/50 font-black tracking-widest uppercase">Thông báo</span>
          </button>
        </div>
      </div>

      {/* Admin Popups */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowPopup(null)} />
          <div className="relative w-full max-w-[500px] bg-white rounded-[50px] p-10 shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <BarChart3 className="w-5 h-5" />
                 </div>
                 <h3 className="text-2xl font-black uppercase italic text-gray-800 tracking-tighter">{showPopup}</h3>
              </div>
              <button onClick={() => setShowPopup(null)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 transition-all hover:bg-red-50">
                 <X className="w-6 h-6" />
              </button>
            </div>
            
            {showPopup === 'promo' && (
              <div className="space-y-6">
                <div className="bg-blue-50/50 border-4 border-dashed border-blue-100 rounded-[40px] p-12 flex flex-col items-center gap-4 cursor-pointer hover:bg-blue-50 transition-all group">
                   <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                      <ImageIcon className="w-8 h-8 text-blue-500" />
                   </div>
                   <span className="text-sm font-black text-blue-400 uppercase tracking-widest">Tải lên hình ảnh Banner</span>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Tiêu đề chiến dịch</label>
                   <input placeholder="VD: Khuyến mãi hè rực rỡ..." className="w-full bg-gray-50 p-5 rounded-3xl font-bold border border-gray-100 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all" />
                </div>
                <button 
                  onClick={() => {
                    onAddPromo({ id: Date.now().toString(), title: 'Ưu đãi thành viên mới!', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800', date: Date.now() });
                    setShowPopup(null);
                  }}
                  className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-black shadow-xl shadow-blue-200 text-lg uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Kích hoạt chiến dịch
                </button>
              </div>
            )}

            {showPopup === 'pt' && (
              <div className="space-y-4">
                 <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-[35px] border border-gray-100 group hover:border-purple-200 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-white p-1 rounded-2xl shadow-md">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=PT2" className="w-full h-full rounded-xl" alt="pt" />
                    </div>
                    <div>
                       <p className="font-black text-gray-800 text-lg">HLV. Trần Đại</p>
                       <div className="flex gap-1 text-orange-400">
                          {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                       </div>
                    </div>
                    <ArrowUpRight className="ml-auto w-6 h-6 text-gray-300" />
                 </div>
                 <button className="w-full border-4 border-dashed border-gray-100 py-6 rounded-[35px] text-gray-300 font-black flex items-center justify-center gap-3 hover:border-gray-200 hover:text-gray-400 transition-all uppercase text-sm tracking-widest">
                    <Plus className="w-6 h-6" /> Thêm hồ sơ HLV
                 </button>
              </div>
            )}

            {showPopup === 'notify' && (
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Nội dung tin nhắn</label>
                    <textarea placeholder="Nhập nội dung bạn muốn gửi tới thành viên..." className="w-full bg-gray-50 p-6 rounded-[35px] font-bold border border-gray-100 outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[160px] text-gray-700 leading-relaxed" />
                 </div>
                 <div className="flex gap-4">
                    <button className="flex-1 bg-gray-900 text-white py-6 rounded-[30px] font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 hover:brightness-125 transition-all">Gửi toàn bộ</button>
                    <button className="flex-1 bg-white border-2 border-gray-100 text-gray-400 py-6 rounded-[30px] font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">Chọn đối tượng</button>
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
