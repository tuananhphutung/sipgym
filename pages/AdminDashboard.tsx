
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Promotion, Trainer, TrainingProgram, VoucherItem } from '../App';
import { 
  Check, X, Plus, Users, BarChart3, TrendingUp, 
  MessageSquare, Bell, Lock, Unlock, 
  ImageIcon, LogOut, Ticket, LayoutDashboard,
  Calendar, Settings, Search, Send, ArrowRight,
  Megaphone, UserPlus, ListFilter
} from 'lucide-react';

interface AdminDashboardProps {
  allUsers: UserProfile[];
  setAllUsers: (users: UserProfile[]) => void;
  promotions: Promotion[];
  setPromos: (promos: Promotion[]) => void;
  vouchers: VoucherItem[];
  setVouchers: (vouchers: VoucherItem[]) => void;
  trainers: Trainer[];
  setTrainers: (trainers: Trainer[]) => void;
  programs: TrainingProgram[];
  setPrograms: (programs: TrainingProgram[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  allUsers, setAllUsers, promotions, setPromos, 
  vouchers, setVouchers, trainers, setTrainers
}) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const userListRef = useRef<HTMLDivElement>(null);
  
  // Revenue Stats State
  const [revenuePeriod, setRevenuePeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Day');

  // Popup / Modal States
  const [selectedUserPhone, setSelectedUserPhone] = useState<string | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Form States
  const [giftDays, setGiftDays] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [newPromo, setNewPromo] = useState({ title: '', image: '' });
  const [newVoucher, setNewVoucher] = useState({ title: '', code: '', type: 'Gym', color: 'bg-blue-500' });
  const [newPT, setNewPT] = useState({ name: '', specialty: '', image: '', rating: 5 });
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_logged') === 'true';
    if (!isAdmin) navigate('/admin');
  }, [navigate]);

  useEffect(() => {
    if (showPopup === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showPopup, allUsers, selectedUserPhone]);

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_logged');
    navigate('/admin');
  };

  const pendingUsers = allUsers.filter(u => u.subscription?.status === 'Pending');
  const filteredUsers = allUsers.filter(u => u.phone.includes(searchTerm) || (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())));
  const selectedUser = allUsers.find(u => u.phone === selectedUserPhone);
  
  const pendingSupportCount = allUsers.filter(u => {
    const lastMsg = u.messages?.[u.messages.length - 1];
    return lastMsg && lastMsg.sender === 'user';
  }).length;

  // --- ACTIONS ---

  const handleApprove = (phone: string) => {
    const newUsers = allUsers.map(u => {
      if (u.phone === phone && u.subscription) {
        const expireDate = Date.now() + u.subscription.months * 30 * 24 * 60 * 60 * 1000;
        return {
          ...u,
          subscription: { ...u.subscription, status: 'Active' as const, expireDate },
          notifications: [{ id: Math.random().toString(), text: `Gói tập ${u.subscription.name} đã được duyệt!`, date: Date.now(), read: false }, ...u.notifications]
        };
      }
      return u;
    });
    setAllUsers(newUsers);
  };

  const handleGiftDays = () => {
    if (!selectedUserPhone || !giftDays) return;
    const days = parseInt(giftDays);
    const newUsers = allUsers.map(u => {
      if (u.phone === selectedUserPhone && u.subscription && u.subscription.expireDate) {
        return {
          ...u,
          subscription: {
            ...u.subscription,
            expireDate: u.subscription.expireDate + (days * 24 * 60 * 60 * 1000)
          },
          notifications: [{ id: Math.random().toString(), text: `Bạn được tặng thêm ${days} ngày tập!`, date: Date.now(), read: false }, ...u.notifications]
        };
      }
      return u;
    });
    setAllUsers(newUsers);
    setGiftDays('');
    alert(`Đã tặng ${days} ngày cho thành viên!`);
  };

  const handleAddPackage = () => {
    if (!selectedUserPhone) return;
    const newUsers = allUsers.map(u => {
      if (u.phone === selectedUserPhone) {
         const currentExpire = u.subscription?.expireDate && u.subscription.expireDate > Date.now() ? u.subscription.expireDate : Date.now();
         const newExpire = currentExpire + (30 * 24 * 60 * 60 * 1000);
         return {
           ...u,
           subscription: {
             name: u.subscription?.name || 'Gói Bổ Sung',
             months: (u.subscription?.months || 0) + 1,
             startDate: Date.now(), // Lưu ý: Gói bổ sung này không có giá tiền trong ví dụ này, hoặc có thể thêm logic giá sau
             price: 0,
             status: 'Active' as const,
             expireDate: newExpire
           },
           notifications: [{ id: Math.random().toString(), text: `Admin đã nâng cấp gói tập cho bạn!`, date: Date.now(), read: false }, ...u.notifications]
         };
      }
      return u;
    });
    setAllUsers(newUsers);
    alert("Đã thêm 1 tháng vào gói tập!");
  };

  const toggleLock = (phone: string) => {
    const newUsers = allUsers.map(u => {
      if (u.phone === phone) return { ...u, isLocked: !u.isLocked };
      return u;
    });
    setAllUsers(newUsers);
  };

  const saveUserName = () => {
    if (!selectedUserPhone) return;
    const newUsers = allUsers.map(u => {
      if (u.phone === selectedUserPhone) return { ...u, name: editingName };
      return u;
    });
    setAllUsers(newUsers);
    alert("Đã đổi tên thành công!");
  };

  const sendAdminMessage = () => {
    if (!selectedUserPhone || !chatMsg.trim()) return;
    const newUsers = allUsers.map(u => {
      if (u.phone === selectedUserPhone) {
        return {
          ...u,
          messages: [...(u.messages || []), { sender: 'admin' as const, text: chatMsg, timestamp: Date.now() }]
        };
      }
      return u;
    });
    setAllUsers(newUsers); // Updates global state & LocalStorage
    setChatMsg('');
  };

  const handleBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    const newUsers = allUsers.map(u => ({
      ...u,
      notifications: [{ 
        id: Math.random().toString(), 
        text: `📢 THÔNG BÁO: ${broadcastMsg}`, 
        date: Date.now(), 
        read: false 
      }, ...u.notifications]
    }));
    setAllUsers(newUsers);
    setBroadcastMsg('');
    setShowPopup(null);
    alert("Đã gửi thông báo đến tất cả hội viên!");
  };

  const handleCreatePT = () => {
    if (!newPT.name || !newPT.specialty || !newPT.image) return;
    setTrainers([...trainers, { id: Date.now().toString(), ...newPT }]);
    setNewPT({ name: '', specialty: '', image: '', rating: 5 });
    setShowPopup(null);
    alert("Đã thêm PT mới thành công!");
  };

  const createPromo = () => {
    if(!newPromo.title || !newPromo.image) return;
    setPromos([...promotions, { id: Date.now().toString(), title: newPromo.title, image: newPromo.image, date: Date.now() }]);
    setNewPromo({ title: '', image: '' });
    setShowPopup(null);
  };

  const createVoucher = () => {
    if(!newVoucher.title || !newVoucher.code) return;
    setVouchers([...vouchers, { id: Date.now().toString(), ...newVoucher }]);
    setNewVoucher({ title: '', code: '', type: 'Gym', color: 'bg-blue-500' });
    setShowPopup(null);
  };

  // --- REAL REVENUE CALCULATION LOGIC ---
  const calculateRevenue = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of week (Monday)
    const day = now.getDay() || 7; 
    if(day !== 1) now.setHours(-24 * (day - 1)); 
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();

    let total = 0;

    allUsers.forEach(user => {
      if (user.subscription && user.subscription.status === 'Active' && user.subscription.price) {
        const subDate = user.subscription.startDate || 0; // Fallback for old data
        
        let isValid = false;
        if (revenuePeriod === 'Day' && subDate >= startOfDay) isValid = true;
        if (revenuePeriod === 'Week' && subDate >= startOfWeek) isValid = true;
        if (revenuePeriod === 'Month' && subDate >= startOfMonth) isValid = true;
        if (revenuePeriod === 'Year' && subDate >= startOfYear) isValid = true;

        if (isValid) {
          total += user.subscription.price;
        }
      }
    });

    return total.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="bg-[#0B0F1A] min-h-full text-slate-300 pb-6 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 sticky top-0 z-[100] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-black text-lg italic tracking-tight leading-none">Xin chào admin</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Quản lý hệ thống Sip Gym</p>
          </div>
        </div>
        
        <button 
          onClick={handleAdminLogout}
          className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-[32px] shadow-sm relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 bg-green-400/10 text-green-400 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                 </div>
                 <div className="flex bg-slate-800 rounded-lg p-0.5">
                    {['Day', 'Week', 'Month', 'Year'].map((p) => (
                      <button 
                        key={p} 
                        onClick={() => setRevenuePeriod(p as any)}
                        className={`text-[8px] font-bold px-2 py-1 rounded-md transition-all uppercase ${revenuePeriod === p ? 'bg-green-500 text-white' : 'text-slate-500'}`}
                      >
                        {p === 'Year' ? 'Y' : p === 'Month' ? 'M' : p === 'Week' ? 'W' : 'D'}
                      </button>
                    ))}
                 </div>
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Doanh Thu {revenuePeriod}</p>
               <p className="text-xl font-black text-white">{calculateRevenue()}</p>
          </div>

          <div 
            onClick={() => setShowPopup('support_list')}
            className="bg-slate-900 border border-slate-800 p-5 rounded-[32px] shadow-sm hover:border-slate-700 transition-all cursor-pointer group"
          >
             <div className="w-10 h-10 bg-orange-400/10 text-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tin nhắn hỗ trợ</p>
             <p className="text-2xl font-black text-white">{pendingSupportCount} <span className="text-xs text-slate-600 font-bold">chờ xử lý</span></p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-[32px] shadow-sm">
               <div className="w-10 h-10 bg-blue-400/10 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tổng Hội Viên</p>
               <p className="text-2xl font-black text-white">{allUsers.length}</p>
          </div>

           <div className="bg-slate-900 border border-slate-800 p-5 rounded-[32px] shadow-sm">
               <div className="w-10 h-10 bg-purple-400/10 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gói Chờ Duyệt</p>
               <p className="text-2xl font-black text-white">{pendingUsers.length}</p>
          </div>
        </div>

        {/* --- MENU ADMIN --- */}
        <div>
           <h3 className="text-white font-black text-sm uppercase italic mb-4 flex items-center gap-2">
             <LayoutDashboard className="w-4 h-4 text-blue-500" />
             Menu Chức Năng
           </h3>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Chat với hội viên */}
              <button 
                onClick={() => setShowPopup('support_list')}
                className="bg-slate-800 hover:bg-slate-700 p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-slate-700 hover:border-blue-500 group"
              >
                 <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-7 h-7" />
                 </div>
                 <span className="text-xs font-black text-white uppercase tracking-wider">Chat Hội Viên</span>
              </button>

              {/* 2. Thêm PT */}
              <button 
                onClick={() => setShowPopup('add_pt')}
                className="bg-slate-800 hover:bg-slate-700 p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-slate-700 hover:border-green-500 group"
              >
                 <div className="w-14 h-14 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus className="w-7 h-7" />
                 </div>
                 <span className="text-xs font-black text-white uppercase tracking-wider">Thêm PT Mới</span>
              </button>

              {/* 3. Quản lý hội viên (Cuộn xuống) */}
              <button 
                onClick={() => userListRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-slate-800 hover:bg-slate-700 p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-slate-700 hover:border-orange-500 group"
              >
                 <div className="w-14 h-14 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ListFilter className="w-7 h-7" />
                 </div>
                 <span className="text-xs font-black text-white uppercase tracking-wider">Quản Lý User</span>
              </button>

              {/* 4. Gửi thông báo tất cả */}
              <button 
                onClick={() => setShowPopup('broadcast')}
                className="bg-slate-800 hover:bg-slate-700 p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-slate-700 hover:border-red-500 group"
              >
                 <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Megaphone className="w-7 h-7" />
                 </div>
                 <span className="text-xs font-black text-white uppercase tracking-wider">Gửi Thông Báo</span>
              </button>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main User List */}
          <div className="lg:col-span-2 space-y-6" ref={userListRef}>
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden min-h-[500px]">
               <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                  <h2 className="text-white font-black text-sm uppercase italic flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Danh Sách Hội Viên
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Tìm tên hoặc SĐT..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-full py-2 pl-9 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
                    />
                  </div>
               </div>
               
               <div className="divide-y divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <div className="p-10 text-center opacity-30 italic font-bold">Không tìm thấy hội viên nào</div>
                  ) : (
                    filteredUsers.map(user => (
                      <div key={user.phone} className={`p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors ${user.isLocked ? 'opacity-50 grayscale' : ''}`}>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-800 overflow-hidden border border-slate-700">
                              {user.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover" alt="avt" />
                              ) : (
                                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.phone}`} alt="avt" />
                              )}
                           </div>
                           <div>
                              <p className="text-white font-black text-sm leading-tight mb-0.5">{user.name || `Member ${user.phone.slice(-4)}`}</p>
                              <p className="text-slate-500 font-bold text-xs">{user.phone}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${user.subscription?.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                                  {user.subscription?.name || 'Chưa ĐK'}
                                </span>
                                {user.subscription?.status === 'Pending' && <span className="text-[8px] font-black uppercase bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">Cần duyệt</span>}
                                {user.isLocked && <span className="text-[8px] font-black uppercase bg-red-500 text-white px-2 py-0.5 rounded-full">Đã khóa</span>}
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                           {user.subscription?.status === 'Pending' ? (
                             <>
                              <button onClick={() => handleApprove(user.phone)} className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-900/20 transition-all">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setAllUsers(allUsers.map(u => u.phone === user.phone ? {...u, subscription: null} : u))} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all">
                                <X className="w-4 h-4" />
                              </button>
                             </>
                           ) : (
                             <button 
                              onClick={() => { setSelectedUserPhone(user.phone); setShowPopup('user_settings'); setEditingName(user.name || ''); }} 
                              className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white hover:bg-blue-600 transition-all"
                             >
                               <Settings className="w-4 h-4" />
                             </button>
                           )}
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>

          {/* Quick Shortcuts (Misc) */}
          <div className="space-y-6">
             <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-6">
                <h3 className="text-white font-black text-xs uppercase italic mb-6 px-2">Tiện ích khác</h3>
                <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => setShowPopup('create_promo')}
                     className="bg-slate-800 hover:bg-slate-700 p-4 rounded-3xl flex flex-col items-center gap-2 transition-all border border-slate-700/50"
                   >
                      <ImageIcon className="w-5 h-5 text-blue-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Khuyến Mãi</span>
                   </button>
                   <button 
                     onClick={() => setShowPopup('create_voucher')}
                     className="bg-slate-800 hover:bg-slate-700 p-4 rounded-3xl flex flex-col items-center gap-2 transition-all border border-slate-700/50"
                   >
                      <Ticket className="w-5 h-5 text-green-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Voucher</span>
                   </button>
                   <button 
                     onClick={() => setShowPopup('view_schedule')}
                     className="bg-slate-800 hover:bg-slate-700 p-4 rounded-3xl flex flex-col items-center gap-2 transition-all border border-slate-700/50 col-span-2"
                   >
                      <Calendar className="w-5 h-5 text-orange-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Xem Lịch Tập Học Viên</span>
                   </button>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* POPUPS */}

      {/* 1. Support List Popup */}
      {showPopup === 'support_list' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPopup(null)} />
           <div className="relative w-full max-w-[400px] bg-slate-900 rounded-[40px] p-6 border border-slate-800 shadow-2xl h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-white font-black text-lg italic uppercase">Tin nhắn hỗ trợ</h3>
                 <button onClick={() => setShowPopup(null)} className="p-2 bg-slate-800 rounded-full text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {allUsers.filter(u => u.messages && u.messages.length > 0).length === 0 ? (
                  <p className="text-center text-slate-500 mt-10 text-xs">Chưa có tin nhắn nào</p>
                ) : (
                  allUsers.filter(u => u.messages && u.messages.length > 0).map(u => {
                    const lastMsg = u.messages[u.messages.length - 1];
                    return (
                      <div key={u.phone} onClick={() => { setSelectedUserPhone(u.phone); setShowPopup('chat'); }} className="bg-slate-800 p-4 rounded-2xl cursor-pointer hover:bg-slate-700 transition-all">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-black text-white text-sm">{u.name || u.phone}</span>
                            <span className="text-[9px] text-slate-500">{new Date(lastMsg.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className={`text-xs truncate ${lastMsg.sender === 'user' ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
                            {lastMsg.sender === 'user' ? 'User: ' : 'Admin: '} {lastMsg.text}
                          </p>
                      </div>
                    );
                  })
                )}
              </div>
           </div>
        </div>
      )}

      {/* 2. User Settings Modal */}
      {showPopup === 'user_settings' && selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPopup(null)} />
          <div className="relative w-full max-w-[400px] bg-slate-900 rounded-[40px] p-6 border border-slate-800 shadow-2xl">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 overflow-hidden border border-slate-700">
                    <img src={selectedUser.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedUser.phone}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg italic uppercase">{selectedUser.name}</h3>
                  <p className="text-slate-500 text-xs font-bold">{selectedUser.phone}</p>
                </div>
                <button onClick={() => setShowPopup(null)} className="ml-auto p-2 bg-slate-800 rounded-full text-slate-500"><X className="w-5 h-5" /></button>
             </div>

             <div className="space-y-4">
                {/* Rename */}
                <div className="bg-slate-800 p-3 rounded-2xl flex gap-2">
                   <input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="bg-transparent text-white font-bold text-sm w-full outline-none" placeholder="Đổi tên..." />
                   <button onClick={saveUserName} className="text-blue-400 font-black text-xs uppercase px-2">Lưu</button>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={handleAddPackage} className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl text-white font-black text-xs uppercase shadow-lg shadow-blue-900/20">
                      + Nâng Gói
                   </button>
                   <button onClick={() => toggleLock(selectedUser.phone)} className={`${selectedUser.isLocked ? 'bg-green-600' : 'bg-red-600'} hover:opacity-90 p-4 rounded-2xl text-white font-black text-xs uppercase shadow-lg`}>
                      {selectedUser.isLocked ? 'Mở Khóa' : 'Tạm Khóa'}
                   </button>
                   <button onClick={() => setShowPopup('chat')} className="bg-slate-700 hover:bg-slate-600 p-4 rounded-2xl text-white font-black text-xs uppercase col-span-2">
                      Chat với User
                   </button>
                </div>

                {/* Gift Days */}
                <div className="bg-slate-800 p-4 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Tặng ngày tập</p>
                   <div className="flex gap-2">
                      <input type="number" value={giftDays} onChange={(e) => setGiftDays(e.target.value)} className="bg-slate-900 rounded-xl px-4 text-white font-bold w-full outline-none" placeholder="Số ngày..." />
                      <button onClick={handleGiftDays} className="bg-green-500 text-white rounded-xl px-4 py-2 font-black text-xs uppercase">Tặng</button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* 3. Chat Popup */}
      {showPopup === 'chat' && selectedUser && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center px-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPopup(null)} />
           <div className="relative w-full max-w-[400px] bg-slate-900 rounded-[40px] border border-slate-800 shadow-2xl h-[80vh] flex flex-col overflow-hidden">
              <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                 <h3 className="text-white font-black text-sm uppercase">Chat: {selectedUser.name}</h3>
                 <button onClick={() => setShowPopup(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
                 {selectedUser.messages?.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`p-3 rounded-2xl max-w-[80%] text-sm font-medium ${m.sender === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                          {m.text}
                       </div>
                    </div>
                 ))}
                 <div ref={chatEndRef}></div>
              </div>

              <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
                 <input 
                  value={chatMsg} 
                  onChange={(e) => setChatMsg(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && sendAdminMessage()}
                  className="flex-1 bg-slate-900 rounded-full px-4 text-white text-sm font-bold outline-none" 
                  placeholder="Nhập tin nhắn..." 
                 />
                 <button onClick={sendAdminMessage} className="p-3 bg-blue-600 rounded-full text-white"><Send className="w-4 h-4" /></button>
              </div>
           </div>
        </div>
      )}

      {/* 4. Broadcast Notification Popup */}
      {showPopup === 'broadcast' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[400px] bg-slate-900 rounded-[40px] p-8 border border-slate-800 shadow-2xl">
               <h3 className="text-white font-black text-xl italic uppercase mb-2">Gửi Thông Báo</h3>
               <p className="text-slate-500 text-xs mb-6">Tin nhắn sẽ được gửi đến {allUsers.length} hội viên.</p>
               <textarea 
                className="w-full bg-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white mb-6 outline-none min-h-[120px]" 
                placeholder="Nhập nội dung thông báo..." 
                value={broadcastMsg} 
                onChange={e => setBroadcastMsg(e.target.value)} 
               />
               <button onClick={handleBroadcast} className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-lg shadow-red-900/20">Gửi Ngay</button>
            </div>
         </div>
      )}

      {/* 5. Add PT Popup */}
      {showPopup === 'add_pt' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[400px] bg-slate-900 rounded-[40px] p-8 border border-slate-800 shadow-2xl">
               <h3 className="text-white font-black text-xl italic uppercase mb-6">Thêm PT Mới</h3>
               <div className="space-y-4">
                 <input className="w-full bg-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none" placeholder="Tên PT..." value={newPT.name} onChange={e => setNewPT({...newPT, name: e.target.value})} />
                 <input className="w-full bg-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none" placeholder="Chuyên môn (VD: Bodybuilding)..." value={newPT.specialty} onChange={e => setNewPT({...newPT, specialty: e.target.value})} />
                 <input className="w-full bg-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none" placeholder="Link ảnh (URL)..." value={newPT.image} onChange={e => setNewPT({...newPT, image: e.target.value})} />
                 <button onClick={handleCreatePT} className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-lg shadow-green-900/20 mt-2">Thêm PT</button>
               </div>
            </div>
         </div>
      )}

      {/* 6. Create Promo Popup */}
      {showPopup === 'create_promo' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[400px] bg-slate-900 rounded-[40px] p-8 border border-slate-800 shadow-2xl">
               <h3 className="text-white font-black text-xl italic uppercase mb-6">Tạo Khuyến Mãi Mới</h3>
               <input className="w-full bg-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white mb-4 outline-none" placeholder="Tiêu đề khuyến mãi..." value={newPromo.title} onChange={e => setNewPromo({...newPromo, title: e.target.value})} />
               <input className="w-full bg-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white mb-6 outline-none" placeholder="Link ảnh (URL)..." value={newPromo.image} onChange={e => setNewPromo({...newPromo, image: e.target.value})} />
               <button onClick={createPromo} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase">Đăng Khuyến Mãi</button>
            </div>
         </div>
      )}

      {/* 7. Create Voucher Popup */}
      {showPopup === 'create_voucher' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[400px] bg-slate-900 rounded-[40px] p-8 border border-slate-800 shadow-2xl">
               <h3 className="text-white font-black text-xl italic uppercase mb-6">Tạo Voucher Mới</h3>
               <input className="w-full bg-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white mb-4 outline-none" placeholder="Tiêu đề voucher..." value={newVoucher.title} onChange={e => setNewVoucher({...newVoucher, title: e.target.value})} />
               <input className="w-full bg-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white mb-6 outline-none" placeholder="Mã Code..." value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value})} />
               <button onClick={createVoucher} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-sm uppercase">Tạo Voucher</button>
            </div>
         </div>
      )}

      {/* 8. View Schedule Popup */}
      {showPopup === 'view_schedule' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[400px] bg-slate-900 rounded-[40px] p-6 border border-slate-800 shadow-2xl h-[70vh] flex flex-col">
               <h3 className="text-white font-black text-lg italic uppercase mb-4">Lịch tập học viên</h3>
               <div className="flex-1 overflow-y-auto space-y-4">
                  {allUsers.map(u => (
                    <div key={u.phone} className="bg-slate-800 p-4 rounded-2xl">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-bold">{u.name || u.phone}</span>
                          <span className="text-slate-500 text-xs">{u.trainingDays?.length || 0} buổi</span>
                       </div>
                       <div className="flex flex-wrap gap-1">
                          {u.trainingDays?.slice(-5).map(day => (
                             <span key={day} className="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md">{day.split('-').slice(1).join('/')}</span>
                          ))}
                          {(!u.trainingDays || u.trainingDays.length === 0) && <span className="text-[10px] text-slate-600 italic">Chưa có lịch tập</span>}
                       </div>
                    </div>
                  ))}
               </div>
               <button onClick={() => setShowPopup(null)} className="mt-4 w-full bg-slate-800 text-slate-400 py-3 rounded-2xl font-bold uppercase text-xs">Đóng</button>
            </div>
         </div>
      )}

    </div>
  );
};

export default AdminDashboard;
