
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Promotion, Trainer, TrainingProgram, VoucherItem, PackageItem, PTPackage, AdminProfile, AdminPermission, Booking } from '../App';
import { 
  Check, X, Plus, Users, BarChart3, TrendingUp, 
  MessageSquare, Bell, Lock, Unlock, 
  ImageIcon, LogOut, Ticket, LayoutDashboard,
  Calendar, Settings, Search, Send, ArrowRight,
  Megaphone, UserPlus, ListFilter, Package, PauseCircle, Trash2, Dumbbell,
  UserCheck, Menu, Eye, ShieldAlert, BadgeCheck, Pencil, CreditCard, Image as ImageIcon2, Clock,
  CalendarCheck, AlertCircle
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

interface AdminDashboardProps {
  currentAdmin: AdminProfile | null;
  admins: AdminProfile[];
  setAdmins: (admins: AdminProfile[]) => void;
  allUsers: UserProfile[];
  setAllUsers: (users: UserProfile[]) => void;
  promotions: Promotion[];
  setPromos: (promos: Promotion[]) => void;
  vouchers: VoucherItem[];
  setVouchers: (vouchers: VoucherItem[]) => void;
  trainers: Trainer[];
  setTrainers: (trainers: Trainer[]) => void;
  packages: PackageItem[];
  setPackages: (packages: PackageItem[]) => void;
  programs: TrainingProgram[];
  setPrograms: (programs: TrainingProgram[]) => void;
  ptPackages: PTPackage[];
  setPTPackages: (packages: PTPackage[]) => void;
  heroImage: string;
  onUpdateHeroImage: (url: string) => void;
  bookings: Booking[];
  onUpdateBookings: (bookings: Booking[]) => void;
  onLogout: () => void;
}

const PERMISSIONS_LIST: { key: AdminPermission; label: string; icon: any }[] = [
  { key: 'view_users', label: 'Xem DS Hội Viên', icon: Users },
  { key: 'approve_users', label: 'Duyệt Gói Tập', icon: Check },
  { key: 'view_revenue', label: 'Doanh Thu', icon: TrendingUp },
  { key: 'send_notification', label: 'Thông Báo', icon: Megaphone },
  { key: 'edit_user_settings', label: 'Sửa User', icon: Settings },
  { key: 'chat_user', label: 'Chat Support', icon: MessageSquare },
  { key: 'manage_packages', label: 'QL Gói Tập', icon: Package },
  { key: 'manage_pt_packages', label: 'QL Gói PT', icon: Dumbbell },
  { key: 'add_pt', label: 'Thêm PT', icon: UserPlus },
  { key: 'manage_promo', label: 'Khuyến Mãi', icon: ImageIcon },
  { key: 'manage_voucher', label: 'Voucher', icon: Ticket },
  { key: 'view_schedule', label: 'Lịch Tập', icon: Calendar },
  { key: 'manage_app_interface', label: 'Giao Diện App', icon: ImageIcon2 }, 
  { key: 'manage_bookings', label: 'Duyệt Lịch PT', icon: Clock },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentAdmin, admins, setAdmins,
  allUsers, setAllUsers, promotions, setPromos, 
  vouchers, setVouchers, trainers, setTrainers,
  packages, setPackages, ptPackages, setPTPackages,
  heroImage, onUpdateHeroImage, bookings, onUpdateBookings,
  onLogout
}) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const userListRef = useRef<HTMLDivElement>(null);
  
  // Date Filters
  const [revenueDate, setRevenueDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

  // Popup / Modal States
  const [selectedUserPhone, setSelectedUserPhone] = useState<string | null>(null);
  const [selectedUserPhonesForBroadcast, setSelectedUserPhonesForBroadcast] = useState<string[]>([]);
  const [chatMsg, setChatMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Form States
  const [giftDays, setGiftDays] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [newPromo, setNewPromo] = useState({ title: '', image: '' });
  const [newVoucher, setNewVoucher] = useState({ title: '', code: '', type: 'Gym' as const, value: 0.1, color: 'bg-orange-500', image: '' });
  const [newPT, setNewPT] = useState({ name: '', specialty: '', image: '', rating: 5 });
  const [newPackage, setNewPackage] = useState({ name: '', price: '', image: '' });
  const [newPTPackage, setNewPTPackage] = useState({ name: '', price: '', sessions: '', image: '' });
  const [newHeroImage, setNewHeroImage] = useState('');

  // Edit User Names
  const [editingRealName, setEditingRealName] = useState('');

  // Admin Management State
  const [newAdmin, setNewAdmin] = useState<Partial<AdminProfile>>({ username: '', password: '', name: '', role: 'sub_admin', permissions: [], settings: { showFloatingMenu: true, showPopupNoti: true } });

  // Floating Menu State
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);

  useEffect(() => {
    if (!currentAdmin) {
       const session = localStorage.getItem('admin_session');
       if (!session) navigate('/admin');
    }
  }, [navigate, currentAdmin]);

  // Auto-scroll chat
  useEffect(() => {
    if (showPopup === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showPopup, allUsers, selectedUserPhone]);

  // Sync editing name when user is selected - FIX: Ensure this updates when modal opens
  const selectedUser = allUsers.find(u => u.phone === selectedUserPhone);
  useEffect(() => {
      if (showPopup === 'user_settings' && selectedUser) {
          setEditingRealName(selectedUser.realName || '');
      }
  }, [showPopup, selectedUser]);

  // Permission Checker
  const hasPermission = (perm: AdminPermission) => {
    if (!currentAdmin) return false;
    if (currentAdmin.role === 'super_admin') return true;
    return currentAdmin.permissions.includes(perm);
  };

  // Filter Logic & BADGE COUNTS
  const pendingUsers = allUsers.filter(u => u.subscription?.status === 'Pending');
  const pendingPTUsers = allUsers.filter(u => u.ptSubscription?.status === 'Pending');
  const pendingPreserveUsers = allUsers.filter(u => u.subscription?.status === 'Pending Preservation');
  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  
  const totalPendingApprovals = pendingUsers.length + pendingPTUsers.length + pendingPreserveUsers.length + pendingBookings.length;

  const filteredUsers = allUsers.filter(u => 
     u.phone.includes(searchTerm) || 
     (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (u.realName && u.realName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const pendingSupportCount = allUsers.filter(u => {
    const lastMsg = u.messages?.[u.messages.length - 1];
    return lastMsg && lastMsg.sender === 'user';
  }).length;

  // --- ACTIONS ---

  const handleBookingAction = (id: string, action: 'approve' | 'reject') => {
      const updatedBookings = bookings.map(b => b.id === id ? { ...b, status: action === 'approve' ? 'Approved' as const : 'Rejected' as const } : b);
      onUpdateBookings(updatedBookings);
      
      const booking = bookings.find(b => b.id === id);
      if (booking) {
          const newUsers = allUsers.map(u => {
              if (u.phone === booking.userId) {
                  return {
                      ...u,
                      notifications: [{
                          id: Math.random().toString(),
                          text: `Lịch tập PT ${booking.date} (${booking.timeSlot}) của bạn đã được ${action === 'approve' ? 'CHẤP NHẬN' : 'TỪ CHỐI'}.`,
                          date: Date.now(),
                          read: false,
                          type: 'booking' as const
                      }, ...u.notifications]
                  };
              }
              return u;
          });
          setAllUsers(newUsers);
      }
  };

  const handleDeleteUser = () => { if (!selectedUserPhone) return; if (window.confirm("BẠN CÓ CHẮC MUỐN XÓA USER NÀY? Hành động này không thể hoàn tác.")) { const newUsers = allUsers.filter(u => u.phone !== selectedUserPhone); setAllUsers(newUsers); setShowPopup(null); alert("Đã xóa user thành công."); } };
  
  const handleApprove = (phone: string) => { 
      const newUsers = allUsers.map(u => { 
          if (u.phone === phone && u.subscription) { 
              const startDate = Date.now(); 
              const expireDate = startDate + u.subscription.months * 30 * 24 * 60 * 60 * 1000; 
              return { 
                  ...u, 
                  subscription: { ...u.subscription, status: 'Active' as const, startDate, expireDate }, 
                  notifications: [{ id: Math.random().toString(), text: `Gói tập ${u.subscription.name} đã được duyệt!`, date: Date.now(), read: false }, ...u.notifications] 
              }; 
          } return u; 
      }); 
      setAllUsers(newUsers); 
  };

  const handleApprovePT = (phone: string) => { 
      const newUsers = allUsers.map(u => { 
          if (u.phone === phone && u.ptSubscription) { 
              return { 
                  ...u, 
                  ptSubscription: { ...u.ptSubscription, status: 'Active' as const, startDate: Date.now() }, 
                  notifications: [{ id: Math.random().toString(), text: `Gói PT "${u.ptSubscription.name}" đã được duyệt thành công!`, date: Date.now(), read: false }, ...u.notifications] 
              }; 
          } return u; 
      }); 
      setAllUsers(newUsers); 
  };

  const handleApprovePreservation = (phone: string) => { 
      const newUsers = allUsers.map(u => { 
          if (u.phone === phone && u.subscription) { 
              return { 
                  ...u, 
                  subscription: { ...u.subscription, status: 'Preserved' as const }, 
                  notifications: [{ id: Math.random().toString(), text: `Yêu cầu bảo lưu gói tập của bạn đã được chấp thuận.`, date: Date.now(), read: false }, ...u.notifications] 
              }; 
          } return u; 
      }); 
      setAllUsers(newUsers); 
  };
  
  const handleBroadcast = () => { 
      if (!broadcastMsg.trim()) return; 
      const targets = selectedUserPhonesForBroadcast.length > 0 ? selectedUserPhonesForBroadcast : allUsers.map(u => u.phone); 
      const newUsers = allUsers.map(u => { 
          if (targets.includes(u.phone)) { 
              return { 
                  ...u, 
                  notifications: [{ id: Math.random().toString(), text: `📢 THÔNG BÁO: ${broadcastMsg}`, date: Date.now(), read: false }, ...u.notifications] 
              }; 
          } return u; 
      }); 
      setAllUsers(newUsers); 
      setBroadcastMsg(''); 
      setSelectedUserPhonesForBroadcast([]); 
      setShowPopup(null); 
      alert(`Đã gửi thông báo đến ${targets.length} hội viên!`); 
  };

  const handleSaveHeroImage = () => { if(newHeroImage) { onUpdateHeroImage(newHeroImage); setShowPopup(null); alert("Cập nhật banner thành công!"); } };
  const handleCreateAdmin = () => { if (!newAdmin.username || !newAdmin.password || !newAdmin.name) return; const newAdminProfile: AdminProfile = { username: newAdmin.username, password: newAdmin.password, name: newAdmin.name, role: 'sub_admin', permissions: newAdmin.permissions || [], settings: { showFloatingMenu: true, showPopupNoti: true } }; setAdmins([...admins, newAdminProfile]); setNewAdmin({ username: '', password: '', name: '', role: 'sub_admin', permissions: [], settings: { showFloatingMenu: true, showPopupNoti: true } }); alert("Đã tạo Admin mới thành công!"); };
  const handleToggleAdminPermission = (perm: AdminPermission) => { const currentPerms = newAdmin.permissions || []; if (currentPerms.includes(perm)) { setNewAdmin({ ...newAdmin, permissions: currentPerms.filter(p => p !== perm) }); } else { setNewAdmin({ ...newAdmin, permissions: [...currentPerms, perm] }); } };
  const toggleFloatingMenuSetting = () => { if (!currentAdmin) return; const newSettings = { ...currentAdmin.settings, showFloatingMenu: !currentAdmin.settings.showFloatingMenu }; const updatedAdmin = { ...currentAdmin, settings: newSettings }; const updatedAdmins = admins.map(a => a.username === currentAdmin.username ? updatedAdmin : a); setAdmins(updatedAdmins); };
  const togglePopupNotiSetting = () => { if (!currentAdmin) return; const newSettings = { ...currentAdmin.settings, showPopupNoti: !currentAdmin.settings.showPopupNoti }; const updatedAdmin = { ...currentAdmin, settings: newSettings }; const updatedAdmins = admins.map(a => a.username === currentAdmin.username ? updatedAdmin : a); setAdmins(updatedAdmins); };
  
  const calculateRevenue = () => { 
      let total = 0; 
      const checkDate = new Date(revenueDate).toDateString(); 
      allUsers.forEach(user => { 
          // Check Gym Subscription Start Date
          if (user.subscription && user.subscription.status === 'Active' && user.subscription.startDate) { 
              if (new Date(user.subscription.startDate).toDateString() === checkDate) { 
                  total += (user.subscription.paidAmount || user.subscription.price); 
              } 
          } 
          // Check PT Subscription Start Date
          if (user.ptSubscription && user.ptSubscription.status === 'Active' && user.ptSubscription.startDate) { 
              if (new Date(user.ptSubscription.startDate).toDateString() === checkDate) { 
                  total += (user.ptSubscription.paidAmount || user.ptSubscription.price); 
              } 
          } 
      }); 
      return total; 
  };

  const saveRealName = () => { 
      if (!selectedUserPhone || !editingRealName.trim()) return; 
      const newUsers = allUsers.map(u => u.phone === selectedUserPhone ? { ...u, realName: editingRealName } : u); 
      setAllUsers(newUsers); 
      alert("Đã cập nhật tên thật thành công!"); 
  };

  const toggleLock = (phone: string) => { const newUsers = allUsers.map(u => u.phone === phone ? { ...u, isLocked: !u.isLocked } : u); setAllUsers(newUsers); };
  const handleGiftDays = () => { if (!selectedUserPhone || !giftDays) return; const days = parseInt(giftDays); if (isNaN(days) || days <= 0) return; const newUsers = allUsers.map(u => { if (u.phone === selectedUserPhone && u.subscription?.expireDate) { const newExpire = u.subscription.expireDate + (days * 24 * 60 * 60 * 1000); return { ...u, subscription: { ...u.subscription, expireDate: newExpire }, notifications: [{ id: Math.random().toString(), text: `Bạn đã được tặng thêm ${days} ngày tập!`, date: Date.now(), read: false }, ...u.notifications] }; } return u; }); setAllUsers(newUsers); setGiftDays(''); alert(`Đã tặng ${days} ngày cho user.`); };
  const sendAdminMessage = () => { if (!selectedUserPhone || !chatMsg.trim()) return; const newMsg = { sender: 'admin' as const, text: chatMsg, timestamp: Date.now() }; const newUsers = allUsers.map(u => { if (u.phone === selectedUserPhone) { return { ...u, messages: [...u.messages, newMsg] }; } return u; }); setAllUsers(newUsers); setChatMsg(''); };
  
  // CRUD Functions...
  const handleCreatePackage = () => { 
      if (!newPackage.name || !newPackage.price || !newPackage.image) return alert("Vui lòng điền đủ thông tin & ảnh"); 
      const pkg: PackageItem = { id: Date.now().toString(), name: newPackage.name, price: parseInt(newPackage.price.toString()), image: newPackage.image }; 
      setPackages([...packages, pkg]); 
      setNewPackage({ name: '', price: '', image: '' }); 
      alert("Thêm gói tập thành công"); 
  };
  const handleDeletePackage = (id: string) => { if(window.confirm("Xóa gói này?")) { setPackages(packages.filter(p => p.id !== id)); } };
  
  const handleCreatePTPackage = () => { 
      if (!newPTPackage.name || !newPTPackage.price || !newPTPackage.sessions || !newPTPackage.image) return alert("Vui lòng điền đủ thông tin & ảnh"); 
      const pkg: PTPackage = { id: Date.now().toString(), name: newPTPackage.name, price: parseInt(newPTPackage.price.toString()), sessions: parseInt(newPTPackage.sessions.toString()), image: newPTPackage.image }; 
      setPTPackages([...ptPackages, pkg]); 
      setNewPTPackage({ name: '', price: '', sessions: '', image: '' }); 
      alert("Thêm gói PT thành công"); 
  };
  const handleDeletePTPackage = (id: string) => { if(window.confirm("Xóa gói PT này?")) { setPTPackages(ptPackages.filter(p => p.id !== id)); } };
  
  const handleCreatePT = () => { 
      if (!newPT.name || !newPT.specialty || !newPT.image) return alert("Vui lòng nhập đủ thông tin & ảnh"); 
      const trainer: Trainer = { id: Date.now().toString(), name: newPT.name, specialty: newPT.specialty, image: newPT.image, rating: 5 }; 
      setTrainers([...trainers, trainer]); 
      setNewPT({ name: '', specialty: '', image: '', rating: 5 }); 
      setShowPopup(null); 
      alert("Thêm PT thành công"); 
  };

  const handleCreatePromo = () => {
      if (!newPromo.title || !newPromo.image) return alert("Thiếu tiêu đề hoặc ảnh");
      setPromos([...promotions, { id: Date.now().toString(), title: newPromo.title, image: newPromo.image, date: Date.now() }]);
      setNewPromo({ title: '', image: '' });
      alert("Thêm khuyến mãi thành công");
  };

  const handleCreateVoucher = () => {
      if (!newVoucher.title || !newVoucher.code) return alert("Thiếu thông tin voucher");
      setVouchers([...vouchers, { id: Date.now().toString(), title: newVoucher.title, code: newVoucher.code, type: newVoucher.type, value: newVoucher.value, color: newVoucher.color, image: newVoucher.image }]);
      setNewVoucher({ title: '', code: '', type: 'Gym', value: 0.1, color: 'bg-orange-500', image: '' });
      alert("Thêm voucher thành công");
  };

  // Helper for floating menu item
  const FloatingMenuItem = ({ icon: Icon, label, action, perm, badgeCount }: any) => {
     const allowed = hasPermission(perm);
     return (
        <button 
           onClick={() => { if(allowed) { action(); setIsFloatingMenuOpen(false); } }}
           className={`relative flex items-center gap-3 p-3 w-full rounded-xl transition-all ${allowed ? 'hover:bg-orange-50 text-gray-700' : 'opacity-40 cursor-not-allowed text-gray-400'}`}
        >
           <div className="relative">
              <Icon className="w-5 h-5 text-[#FF6B00]" />
              {badgeCount > 0 && (
                 <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {badgeCount > 9 ? '9+' : badgeCount}
                 </div>
              )}
           </div>
           <span className="text-xs font-bold uppercase">{label}</span>
           {!allowed && <Lock className="w-3 h-3 ml-auto text-gray-300" />}
        </button>
     );
  };

  const getActionForPerm = (perm: AdminPermission) => {
      switch(perm) {
          case 'chat_user': return () => setShowPopup('support_list');
          case 'send_notification': return () => setShowPopup('broadcast');
          case 'view_users': return () => userListRef.current?.scrollIntoView({behavior:'smooth'});
          case 'approve_users': return () => setShowPopup('pending_approvals'); 
          case 'manage_packages': return () => setShowPopup('packages');
          case 'manage_pt_packages': return () => setShowPopup('pt_packages');
          case 'add_pt': return () => setShowPopup('add_pt');
          case 'manage_app_interface': return () => setShowPopup('config_hero');
          case 'manage_bookings': return () => setShowPopup('pending_approvals');
          case 'view_schedule': return () => setShowPopup('view_schedule');
          case 'view_revenue': return () => setShowPopup('revenue_report'); // Added click handler for revenue
          case 'manage_promo': return () => setShowPopup('create_promo');
          case 'manage_voucher': return () => setShowPopup('create_voucher');
          default: return () => {};
      }
  };
  
  const getBadgeForPerm = (perm: AdminPermission) => {
      switch(perm) {
          case 'approve_users': return totalPendingApprovals;
          case 'manage_bookings': return totalPendingApprovals;
          case 'chat_user': return pendingSupportCount;
          default: return 0;
      }
  };
  
  const sortedChatUsers = allUsers.filter(u => u.messages.length > 0 || u.subscription?.status === 'Pending' || u.ptSubscription?.status === 'Pending').sort((a, b) => {
      const aPending = (a.subscription?.status === 'Pending' || a.ptSubscription?.status === 'Pending');
      const bPending = (b.subscription?.status === 'Pending' || b.ptSubscription?.status === 'Pending');
      
      if (aPending && !bPending) return -1;
      if (!aPending && bPending) return 1;
      return 0;
  });

  return (
    <div className="bg-[#FFF7ED] min-h-full text-gray-700 pb-20 font-sans selection:bg-orange-200 relative">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-orange-100 px-6 py-4 sticky top-0 z-[100] flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#FF6B00] to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-gray-900 font-black text-lg italic tracking-tight leading-none">{currentAdmin?.name}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Role: {currentAdmin?.role === 'super_admin' ? 'Super Admin' : 'Quản lý'}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           {currentAdmin?.role === 'super_admin' && (
              <button onClick={() => setShowPopup('manage_admins')} className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center transition-all border border-blue-100 hover:bg-blue-100">
                <ShieldAlert className="w-5 h-5" />
              </button>
           )}
           <button onClick={onLogout} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center transition-all border border-red-100 hover:bg-red-100">
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Floating Menu */}
      {currentAdmin?.settings.showFloatingMenu && (
        <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end gap-2">
           {isFloatingMenuOpen && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-2xl mb-2 w-56 animate-in slide-in-from-bottom-5 border border-white/50 max-h-[60vh] overflow-y-auto no-scrollbar">
                 {PERMISSIONS_LIST.map(p => (
                     <FloatingMenuItem 
                        key={p.key} 
                        icon={p.icon} 
                        label={p.label} 
                        action={getActionForPerm(p.key)} 
                        perm={p.key} 
                        badgeCount={getBadgeForPerm(p.key)}
                     />
                 ))}
              </div>
           )}
           <button 
             onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
             className="w-14 h-14 bg-[#FF6B00] hover:bg-[#E65A00] rounded-full text-white shadow-xl shadow-orange-500/40 flex items-center justify-center transition-transform active:scale-95 relative"
           >
              {isFloatingMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              {!isFloatingMenuOpen && (totalPendingApprovals + pendingSupportCount) > 0 && (
                 <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
              )}
           </button>
        </div>
      )}

      {/* Admin Notification Popup (Clickable Toast) */}
      {currentAdmin?.settings.showPopupNoti && (pendingUsers.length > 0 || pendingPTUsers.length > 0 || pendingBookings.length > 0 || pendingPreserveUsers.length > 0) && (
         <div 
            onClick={() => setShowPopup('pending_approvals')}
            className="fixed top-24 right-6 z-[90] bg-white rounded-2xl shadow-2xl p-4 w-64 border-l-4 border-[#FF6B00] animate-in slide-in-from-right-10 cursor-pointer hover:bg-orange-50 transition-colors"
         >
            <div className="flex justify-between items-start mb-2">
               <h4 className="text-gray-800 font-black text-xs uppercase flex items-center gap-1"><Bell className="w-3 h-3 text-red-500 animate-pulse"/> Cần Duyệt Gấp</h4>
               <button onClick={(e) => { e.stopPropagation(); togglePopupNotiSetting(); }} className="text-gray-400 hover:text-gray-600"><X className="w-3 h-3"/></button>
            </div>
            <div className="space-y-1">
                {pendingUsers.length > 0 && <p className="text-[10px] text-gray-600 font-bold">• {pendingUsers.length} gói tập Gym mới</p>}
                {pendingPTUsers.length > 0 && <p className="text-[10px] text-gray-600 font-bold">• {pendingPTUsers.length} đăng ký PT mới</p>}
                {pendingBookings.length > 0 && <p className="text-[10px] text-gray-600 font-bold">• {pendingBookings.length} lịch đặt PT</p>}
                {pendingPreserveUsers.length > 0 && <p className="text-[10px] text-gray-600 font-bold">• {pendingPreserveUsers.length} yêu cầu bảo lưu</p>}
            </div>
            <p className="text-[9px] text-blue-500 font-bold mt-2 text-right">Nhấn để xem chi tiết →</p>
         </div>
      )}

      <main className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Stats Grid - Glassmorphism Updated */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Widget */}
          <div 
             onClick={() => hasPermission('view_revenue') && setShowPopup('revenue_report')}
             className={`bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-[32px] shadow-sm transition-all hover:shadow-md ${hasPermission('view_revenue') ? 'cursor-pointer group hover:border-green-200' : ''}`}
          >
               <div className="w-10 h-10 bg-green-100 text-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
               </div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Doanh Thu (Ngày)</p>
               {hasPermission('view_revenue') ? (
                  <p className="text-xl font-black text-gray-800">{calculateRevenue().toLocaleString('vi-VN')}đ</p>
               ) : <p className="text-sm italic text-gray-400">Hidden</p>}
          </div>

          {/* Support Widget */}
          <div 
            onClick={() => hasPermission('chat_user') && setShowPopup('support_list')}
            className={`bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-[32px] shadow-sm transition-all hover:shadow-md ${hasPermission('chat_user') ? 'cursor-pointer hover:border-orange-200 group' : 'opacity-50'}`}
          >
             <div className="relative w-10 h-10 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
                {pendingSupportCount > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">{pendingSupportCount}</div>}
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tin nhắn hỗ trợ</p>
             <p className="text-2xl font-black text-gray-800">{pendingSupportCount} <span className="text-xs text-orange-500 font-bold">chờ xử lý</span></p>
          </div>

          {/* Users Widget */}
          <div 
               onClick={() => hasPermission('view_users') && userListRef.current?.scrollIntoView({behavior:'smooth'})}
               className={`bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-[32px] shadow-sm transition-all hover:shadow-md ${hasPermission('view_users') ? 'cursor-pointer hover:border-blue-200 group' : ''}`}
          >
               <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
               </div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng Hội Viên</p>
               {hasPermission('view_users') ? <p className="text-2xl font-black text-gray-800">{allUsers.length}</p> : <p className="text-sm italic text-gray-400">Hidden</p>}
          </div>
          
           {/* Settings Toggle Card */}
           <div className="bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-[32px] shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-100 text-purple-500 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5" />
                   </div>
                   <span className="text-[9px] font-bold text-gray-400 uppercase">Cài đặt nhanh</span>
               </div>
               <div className="space-y-2">
                  <button onClick={toggleFloatingMenuSetting} className="flex justify-between items-center w-full text-[10px] font-bold text-gray-600">
                     Menu Nổi {currentAdmin?.settings.showFloatingMenu ? <span className="text-green-500">BẬT</span> : <span className="text-red-500">TẮT</span>}
                  </button>
                  <button onClick={togglePopupNotiSetting} className="flex justify-between items-center w-full text-[10px] font-bold text-gray-600">
                     Popup Thông Báo {currentAdmin?.settings.showPopupNoti ? <span className="text-green-500">BẬT</span> : <span className="text-red-500">TẮT</span>}
                  </button>
               </div>
          </div>
        </div>

        {/* --- MENU ADMIN GRID (RESTORED) --- */}
        <div>
           <h3 className="text-gray-800 font-black text-sm uppercase italic mb-4 flex items-center gap-2">
             <LayoutDashboard className="w-4 h-4 text-[#FF6B00]" />
             Menu Chức Năng
           </h3>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => hasPermission('view_schedule') && setShowPopup('view_schedule')} 
                className={`bg-white p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-transparent shadow-sm ${hasPermission('view_schedule') ? 'hover:shadow-lg hover:border-orange-100' : 'opacity-50 cursor-not-allowed'}`}
              >
                 <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><CalendarCheck className="w-7 h-7" /></div>
                 <span className="text-xs font-black text-gray-600 uppercase">Xem Lịch (Gym+PT)</span>
              </button>

              <button 
                onClick={() => hasPermission('approve_users') && setShowPopup('pending_approvals')} 
                className={`relative bg-white p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-transparent shadow-sm ${hasPermission('approve_users') ? 'hover:shadow-lg hover:border-red-100' : 'opacity-50 cursor-not-allowed'}`}
              >
                 <div className="relative">
                    <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center"><Check className="w-7 h-7" /></div>
                    {totalPendingApprovals > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white">{totalPendingApprovals}</div>}
                 </div>
                 <span className="text-xs font-black text-gray-600 uppercase">Duyệt Yêu Cầu</span>
              </button>
              
              <button 
                onClick={() => hasPermission('manage_packages') && setShowPopup('packages')} 
                className={`bg-white p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-transparent shadow-sm ${hasPermission('manage_packages') ? 'hover:shadow-lg hover:border-purple-100' : 'opacity-50 cursor-not-allowed'}`}
              >
                 <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center"><Package className="w-7 h-7" /></div>
                 <span className="text-xs font-black text-gray-600 uppercase">Quản Lý Gói Gym</span>
              </button>
              
              <button 
                onClick={() => hasPermission('manage_pt_packages') && setShowPopup('pt_packages')} 
                className={`bg-white p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-transparent shadow-sm ${hasPermission('manage_pt_packages') ? 'hover:shadow-lg hover:border-pink-100' : 'opacity-50 cursor-not-allowed'}`}
              >
                 <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center"><Dumbbell className="w-7 h-7" /></div>
                 <span className="text-xs font-black text-gray-600 uppercase">Quản Lý Gói PT</span>
              </button>

              <button 
                onClick={() => hasPermission('add_pt') && setShowPopup('add_pt')} 
                className={`bg-white p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-transparent shadow-sm ${hasPermission('add_pt') ? 'hover:shadow-lg hover:border-green-100' : 'opacity-50 cursor-not-allowed'}`}
              >
                 <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center"><UserPlus className="w-7 h-7" /></div>
                 <span className="text-xs font-black text-gray-600 uppercase">Thêm HLV Mới</span>
              </button>

              <button 
                onClick={() => hasPermission('manage_promo') && setShowPopup('create_promo')} 
                className={`bg-white p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-transparent shadow-sm ${hasPermission('manage_promo') ? 'hover:shadow-lg hover:border-yellow-100' : 'opacity-50 cursor-not-allowed'}`}
              >
                 <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center"><ImageIcon className="w-7 h-7" /></div>
                 <span className="text-xs font-black text-gray-600 uppercase">Thêm Khuyến Mãi</span>
              </button>

              <button 
                onClick={() => hasPermission('manage_voucher') && setShowPopup('create_voucher')} 
                className={`bg-white p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-transparent shadow-sm ${hasPermission('manage_voucher') ? 'hover:shadow-lg hover:border-teal-100' : 'opacity-50 cursor-not-allowed'}`}
              >
                 <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center"><Ticket className="w-7 h-7" /></div>
                 <span className="text-xs font-black text-gray-600 uppercase">Tạo Voucher</span>
              </button>

              <button 
                onClick={() => hasPermission('send_notification') && setShowPopup('broadcast')} 
                className={`bg-white p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-transparent shadow-sm ${hasPermission('send_notification') ? 'hover:shadow-lg hover:border-red-100' : 'opacity-50 cursor-not-allowed'}`}
              >
                 <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center"><Megaphone className="w-7 h-7" /></div>
                 <span className="text-xs font-black text-gray-600 uppercase">Gửi Thông Báo</span>
              </button>

              <button 
                onClick={() => hasPermission('manage_app_interface') && setShowPopup('config_hero')} 
                className={`bg-white p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border border-transparent shadow-sm ${hasPermission('manage_app_interface') ? 'hover:shadow-lg hover:border-purple-100' : 'opacity-50 cursor-not-allowed'}`}
              >
                 <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center"><ImageIcon2 className="w-7 h-7" /></div>
                 <span className="text-xs font-black text-gray-600 uppercase">Cấu Hình Banner</span>
              </button>
           </div>
        </div>

        {/* User List */}
        {hasPermission('view_user_list') ? (
            <div className="space-y-6" ref={userListRef}>
                <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-[40px] overflow-hidden min-h-[500px] shadow-lg">
                   <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h2 className="text-gray-800 font-black text-sm uppercase italic flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#FF6B00]" />
                        Danh Sách Hội Viên
                      </h2>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Tìm tên, tên thật, SĐT..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white border border-gray-200 rounded-full py-2 pl-9 pr-4 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 w-56 shadow-sm"
                        />
                      </div>
                   </div>
                   
                   <div className="divide-y divide-gray-100">
                      {filteredUsers.length === 0 ? (
                        <div className="p-10 text-center opacity-30 italic font-bold">Không tìm thấy hội viên nào</div>
                      ) : (
                        filteredUsers.map(user => (
                          <div key={user.phone} className={`p-5 flex items-center justify-between hover:bg-orange-50 transition-colors ${user.isLocked ? 'opacity-50 grayscale' : ''}`}>
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-gray-200 overflow-hidden border border-gray-100 shadow-sm">
                                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avt" /> : <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.phone}`} alt="avt" />}
                               </div>
                               <div>
                                  <div className="flex items-center gap-2">
                                     <p className="text-gray-800 font-black text-sm leading-tight mb-0.5">{user.realName || 'Chưa có tên thật'}</p>
                                     <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded-md">({user.name || 'No Nickname'})</span>
                                  </div>
                                  <p className="text-gray-500 font-bold text-xs">{user.phone} - <span className="text-gray-400">{user.gender || 'N/A'}</span></p>
                                  {/* Badges */}
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {user.subscription?.status.includes('Pending') && (
                                        <div className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            <CreditCard className="w-3 h-3" />
                                            <span className="text-[8px] font-black uppercase">Thanh toán: {(user.subscription.paidAmount || user.subscription.price).toLocaleString()}đ</span>
                                        </div>
                                    )}
                                    {user.ptSubscription?.status === 'Pending' && (
                                        <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            <Dumbbell className="w-3 h-3" />
                                            <span className="text-[8px] font-black uppercase">PT: {(user.ptSubscription.paidAmount || user.ptSubscription.price).toLocaleString()}đ</span>
                                        </div>
                                    )}
                                  </div>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                               <button onClick={() => { setSelectedUserPhone(user.phone); setShowPopup('user_settings'); }} className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-white hover:bg-orange-500 hover:border-orange-500 transition-all shadow-sm"><Settings className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
            </div>
        ) : (
            <div className="text-center py-20 opacity-50"><Lock className="w-12 h-12 mx-auto mb-2 text-gray-400"/><p className="text-gray-500">Bạn không có quyền xem danh sách hội viên</p></div>
        )}
      </main>

      {/* --- POPUPS --- */}
      
      {/* 1. PENDING APPROVALS LIST (NEW MODAL FOR QUICK APPROVE) */}
      {showPopup === 'pending_approvals' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[600px] bg-white rounded-[40px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-gray-800 font-black text-xl italic uppercase flex items-center gap-2"><Check className="w-6 h-6 text-green-500" /> Duyệt Yêu Cầu ({totalPendingApprovals})</h3>
                  <button onClick={() => setShowPopup(null)}><X className="w-6 h-6 text-gray-400" /></button>
               </div>

               {totalPendingApprovals === 0 ? (
                   <div className="text-center py-10 opacity-50">
                       <Check className="w-16 h-16 mx-auto mb-2 text-green-200"/>
                       <p className="text-sm font-bold text-gray-400">Không có yêu cầu nào cần duyệt</p>
                   </div>
               ) : (
                   <div className="space-y-6">
                       {/* Gym Approvals */}
                       {pendingUsers.length > 0 && (
                           <div>
                               <h4 className="text-xs font-black text-orange-500 uppercase mb-2 border-b border-orange-100 pb-1">Gói Tập Gym ({pendingUsers.length})</h4>
                               {pendingUsers.map(u => (
                                   <div key={u.phone} className="bg-orange-50 p-3 rounded-2xl flex justify-between items-center mb-2">
                                       <div>
                                           <p className="font-bold text-sm text-gray-800">{u.realName || u.name} - {u.phone}</p>
                                           <p className="text-xs text-gray-600">Gói: {u.subscription?.name} ({u.subscription?.months} tháng) - <span className="font-black text-green-600">{(u.subscription?.paidAmount || u.subscription?.price || 0).toLocaleString()}đ</span></p>
                                       </div>
                                       <button onClick={() => handleApprove(u.phone)} className="bg-green-500 text-white p-2 rounded-xl text-xs font-black shadow-md hover:bg-green-600">DUYỆT</button>
                                   </div>
                               ))}
                           </div>
                       )}

                       {/* PT Approvals */}
                       {pendingPTUsers.length > 0 && (
                           <div>
                               <h4 className="text-xs font-black text-blue-500 uppercase mb-2 border-b border-blue-100 pb-1">Gói PT ({pendingPTUsers.length})</h4>
                               {pendingPTUsers.map(u => (
                                   <div key={u.phone} className="bg-blue-50 p-3 rounded-2xl flex justify-between items-center mb-2">
                                       <div>
                                           <p className="font-bold text-sm text-gray-800">{u.realName || u.name} - {u.phone}</p>
                                           <p className="text-xs text-gray-600">Gói PT: {u.ptSubscription?.name} - <span className="font-black text-green-600">{(u.ptSubscription?.paidAmount || u.ptSubscription?.price || 0).toLocaleString()}đ</span></p>
                                       </div>
                                       <button onClick={() => handleApprovePT(u.phone)} className="bg-green-500 text-white p-2 rounded-xl text-xs font-black shadow-md hover:bg-green-600">DUYỆT</button>
                                   </div>
                               ))}
                           </div>
                       )}

                       {/* Booking Approvals */}
                       {pendingBookings.length > 0 && (
                           <div>
                               <h4 className="text-xs font-black text-purple-500 uppercase mb-2 border-b border-purple-100 pb-1">Lịch Đặt PT ({pendingBookings.length})</h4>
                               {pendingBookings.map(b => (
                                   <div key={b.id} className="bg-purple-50 p-3 rounded-2xl flex justify-between items-center mb-2">
                                       <div>
                                           <p className="font-bold text-sm text-gray-800">{b.userName} đặt {b.trainerName}</p>
                                           <p className="text-xs text-gray-600">{b.date} lúc {b.timeSlot}</p>
                                       </div>
                                       <div className="flex gap-2">
                                           <button onClick={() => handleBookingAction(b.id, 'reject')} className="bg-white border border-red-200 text-red-500 p-2 rounded-xl text-xs font-black hover:bg-red-50">TỪ CHỐI</button>
                                           <button onClick={() => handleBookingAction(b.id, 'approve')} className="bg-green-500 text-white p-2 rounded-xl text-xs font-black shadow-md hover:bg-green-600">DUYỆT</button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       )}

                       {/* Preservation Approvals */}
                       {pendingPreserveUsers.length > 0 && (
                           <div>
                               <h4 className="text-xs font-black text-gray-500 uppercase mb-2 border-b border-gray-100 pb-1">Yêu Cầu Bảo Lưu ({pendingPreserveUsers.length})</h4>
                               {pendingPreserveUsers.map(u => (
                                   <div key={u.phone} className="bg-gray-100 p-3 rounded-2xl flex justify-between items-center mb-2">
                                       <div>
                                           <p className="font-bold text-sm text-gray-800">{u.realName || u.name} - {u.phone}</p>
                                           <p className="text-xs text-gray-500">Gói hiện tại: {u.subscription?.name}</p>
                                       </div>
                                       <button onClick={() => handleApprovePreservation(u.phone)} className="bg-orange-500 text-white p-2 rounded-xl text-xs font-black shadow-md hover:bg-orange-600">DUYỆT</button>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>
               )}
            </div>
         </div>
      )}

      {/* 2. VIEW SCHEDULE (Gym + PT Combined View) */}
      {showPopup === 'view_schedule' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[800px] bg-white rounded-[40px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-gray-800 font-black text-xl italic uppercase flex items-center gap-2"><CalendarCheck className="w-6 h-6 text-orange-500" /> Quản Lý Lịch Tập</h3>
                  <button onClick={() => setShowPopup(null)}><X className="w-6 h-6 text-gray-400" /></button>
               </div>

               <div className="mb-6">
                   <p className="text-xs font-bold text-gray-400 uppercase mb-1">Chọn ngày xem:</p>
                   <input 
                      type="date" 
                      value={scheduleDate} 
                      onChange={(e) => setScheduleDate(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-200"
                   />
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                   {/* Column 1: Gym Checkins (TrainingDays) */}
                   <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100">
                       <h4 className="font-black text-blue-600 uppercase text-sm mb-3 flex items-center gap-2"><Dumbbell className="w-4 h-4"/> Hội Viên Check-in ({allUsers.filter(u => u.trainingDays.includes(scheduleDate)).length})</h4>
                       <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                           {allUsers.filter(u => u.trainingDays.includes(scheduleDate)).map(u => (
                               <div key={u.phone} className="bg-white p-3 rounded-2xl flex items-center gap-3 shadow-sm border border-blue-50">
                                   <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0"><img src={u.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.phone}`} className="w-full h-full object-cover"/></div>
                                   <div>
                                       <p className="font-bold text-xs text-gray-800">{u.realName || u.name}</p>
                                       <p className="text-[9px] text-gray-400 font-bold">{u.subscription?.name || 'Tự do'}</p>
                                   </div>
                               </div>
                           ))}
                           {allUsers.filter(u => u.trainingDays.includes(scheduleDate)).length === 0 && <p className="text-xs text-blue-400 italic font-bold opacity-60">Chưa có ai check-in hôm nay</p>}
                       </div>
                   </div>

                   {/* Column 2: PT Schedule (Bookings) */}
                   <div className="bg-green-50 p-4 rounded-3xl border border-green-100">
                        <h4 className="font-black text-green-600 uppercase text-sm mb-3 flex items-center gap-2"><UserCheck className="w-4 h-4"/> Lịch Tập PT ({bookings.filter(b => b.date === scheduleDate && b.status !== 'Rejected').length})</h4>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                           {bookings.filter(b => b.date === scheduleDate && b.status !== 'Rejected').map(b => (
                               <div key={b.id} className={`p-3 rounded-2xl flex justify-between items-center shadow-sm border ${b.status === 'Approved' ? 'bg-white border-green-100' : 'bg-white/50 border-orange-100'}`}>
                                   <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0"><img src={b.userAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${b.userId}`} className="w-full h-full object-cover"/></div>
                                       <div>
                                           <p className="font-bold text-xs text-gray-800">{b.userName} <span className="font-normal text-gray-400 text-[10px]">tập với</span> {b.trainerName}</p>
                                           <p className="text-[10px] font-black text-green-600 flex items-center gap-1"><Clock className="w-3 h-3"/> {b.timeSlot}</p>
                                       </div>
                                   </div>
                                   <span className={`text-[8px] px-2 py-1 rounded-md font-black uppercase ${b.status === 'Approved' ? 'bg-green-100 text-green-600' : (b.status === 'Completed' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600')}`}>
                                       {b.status === 'Approved' ? 'Đã duyệt' : (b.status === 'Completed' ? 'Xong' : 'Chờ duyệt')}
                                   </span>
                               </div>
                           ))}
                           {bookings.filter(b => b.date === scheduleDate && b.status !== 'Rejected').length === 0 && <p className="text-xs text-green-400 italic font-bold opacity-60">Không có lịch PT nào</p>}
                        </div>
                   </div>
               </div>
            </div>
         </div>
      )}

      {/* 3. CREATE PROMO (Fix: Image Upload) */}
      {showPopup === 'create_promo' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl">
               <h3 className="font-black text-gray-800 uppercase italic mb-4">Thêm Khuyến Mãi</h3>
               <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-3 font-bold text-sm outline-none" placeholder="Tiêu đề khuyến mãi" value={newPromo.title} onChange={e => setNewPromo({...newPromo, title: e.target.value})} />
               <div className="mb-4"><ImageUpload currentImage={newPromo.image} onImageUploaded={url => setNewPromo({...newPromo, image: url})} label="Ảnh khuyến mãi (Ngang)" aspect="aspect-video" /></div>
               <button onClick={handleCreatePromo} className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-lg">Tạo Khuyến Mãi</button>
            </div>
          </div>
      )}

      {/* 4. CREATE VOUCHER (Fix: Image Upload) */}
      {showPopup === 'create_voucher' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl">
               <h3 className="font-black text-gray-800 uppercase italic mb-4">Thêm Voucher</h3>
               <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-2 font-bold text-sm outline-none" placeholder="Tên voucher" value={newVoucher.title} onChange={e => setNewVoucher({...newVoucher, title: e.target.value})} />
               <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-2 font-bold text-sm outline-none uppercase" placeholder="Mã CODE" value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value})} />
               <div className="flex gap-2 mb-2">
                   <select className="bg-gray-50 rounded-xl px-2 py-3 text-sm font-bold border border-gray-100 outline-none" value={newVoucher.type} onChange={(e:any) => setNewVoucher({...newVoucher, type: e.target.value})}>
                       <option value="Gym">Gym</option><option value="PT">PT</option><option value="Gift">Gift</option>
                   </select>
                   <input type="number" className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" placeholder="Giá trị (0.1 = 10%)" value={newVoucher.value} onChange={e => setNewVoucher({...newVoucher, value: parseFloat(e.target.value)})} />
               </div>
               <div className="mb-4"><ImageUpload currentImage={newVoucher.image} onImageUploaded={url => setNewVoucher({...newVoucher, image: url})} label="Ảnh Voucher (Tùy chọn)" aspect="h-48" /></div>
               <button onClick={handleCreateVoucher} className="w-full bg-teal-500 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-lg">Tạo Voucher</button>
            </div>
          </div>
      )}

      {/* 5. BROADCAST NOTIFICATION */}
      {showPopup === 'broadcast' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl">
               <h3 className="font-black text-gray-800 uppercase italic mb-4">Gửi Thông Báo</h3>
               <textarea className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4 font-bold text-sm outline-none h-32 resize-none" placeholder="Nội dung thông báo..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} />
               <button onClick={handleBroadcast} className="w-full bg-red-500 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-lg">Gửi Cho Tất Cả ({allUsers.length})</button>
            </div>
          </div>
      )}

      {/* 6. MANAGE PACKAGES */}
      {showPopup === 'packages' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-md bg-white rounded-[40px] p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-4"><h3 className="font-black text-gray-800 uppercase italic">Gói Tập Gym</h3><button onClick={() => setShowPopup(null)}><X className="w-5 h-5"/></button></div>
               <div className="space-y-3 mb-6">
                   {packages.map(p => (
                       <div key={p.id} className="flex gap-3 items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                           <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                           <div className="flex-1"><p className="font-bold text-sm">{p.name}</p><p className="text-xs text-gray-500">{p.price.toLocaleString()}đ</p></div>
                           <button onClick={() => handleDeletePackage(p.id)} className="text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
                       </div>
                   ))}
               </div>
               <div className="border-t pt-4">
                   <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Thêm gói mới</h4>
                   <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 mb-2 text-sm font-bold outline-none" placeholder="Tên gói" value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} />
                   <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 mb-2 text-sm font-bold outline-none" type="number" placeholder="Giá tiền" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} />
                   <div className="mb-2"><ImageUpload currentImage={newPackage.image} onImageUploaded={url => setNewPackage({...newPackage, image: url})} label="Ảnh gói tập" aspect="h-48" /></div>
                   <button onClick={handleCreatePackage} className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-lg">Thêm Gói</button>
               </div>
            </div>
          </div>
      )}

      {/* 7. MANAGE PT PACKAGES */}
      {showPopup === 'pt_packages' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-md bg-white rounded-[40px] p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-4"><h3 className="font-black text-gray-800 uppercase italic">Gói PT</h3><button onClick={() => setShowPopup(null)}><X className="w-5 h-5"/></button></div>
               <div className="space-y-3 mb-6">
                   {ptPackages.map(p => (
                       <div key={p.id} className="flex gap-3 items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                           <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                           <div className="flex-1"><p className="font-bold text-sm">{p.name}</p><p className="text-xs text-gray-500">{p.price.toLocaleString()}đ - {p.sessions} buổi</p></div>
                           <button onClick={() => handleDeletePTPackage(p.id)} className="text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
                       </div>
                   ))}
               </div>
               <div className="border-t pt-4">
                   <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Thêm gói PT mới</h4>
                   <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 mb-2 text-sm font-bold outline-none" placeholder="Tên gói" value={newPTPackage.name} onChange={e => setNewPTPackage({...newPTPackage, name: e.target.value})} />
                   <div className="flex gap-2 mb-2">
                       <input className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold outline-none" type="number" placeholder="Giá tiền" value={newPTPackage.price} onChange={e => setNewPTPackage({...newPTPackage, price: e.target.value})} />
                       <input className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold outline-none" type="number" placeholder="Số buổi" value={newPTPackage.sessions} onChange={e => setNewPTPackage({...newPTPackage, sessions: e.target.value})} />
                   </div>
                   <div className="mb-2"><ImageUpload currentImage={newPTPackage.image} onImageUploaded={url => setNewPTPackage({...newPTPackage, image: url})} label="Ảnh gói PT" aspect="h-48" /></div>
                   <button onClick={handleCreatePTPackage} className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-lg">Thêm Gói PT</button>
               </div>
            </div>
          </div>
      )}

      {/* 8. ADD PT */}
      {showPopup === 'add_pt' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl">
               <h3 className="font-black text-gray-800 uppercase italic mb-4">Thêm HLV Mới</h3>
               <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-2 font-bold text-sm outline-none" placeholder="Tên HLV" value={newPT.name} onChange={e => setNewPT({...newPT, name: e.target.value})} />
               <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-2 font-bold text-sm outline-none" placeholder="Chuyên môn (VD: Cardio, Muscle)" value={newPT.specialty} onChange={e => setNewPT({...newPT, specialty: e.target.value})} />
               <div className="mb-4"><ImageUpload currentImage={newPT.image} onImageUploaded={url => setNewPT({...newPT, image: url})} label="Ảnh HLV (Vuông)" aspect="aspect-square" /></div>
               <button onClick={handleCreatePT} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-lg">Thêm HLV</button>
            </div>
          </div>
      )}

      {/* 9. BANNER CONFIG */}
      {showPopup === 'config_hero' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[400px] bg-white rounded-[40px] p-8 shadow-2xl">
               <h3 className="text-gray-800 font-black text-xl italic uppercase mb-2 flex items-center gap-2"><ImageIcon2 className="w-6 h-6 text-purple-500" /> Cấu hình Banner Home</h3>
               <p className="text-xs text-gray-400 font-bold mb-4">Thay đổi ảnh nền chính của trang chủ người dùng.</p>
               
               <div className="mb-4">
                  <ImageUpload 
                     currentImage={newHeroImage || heroImage} 
                     onImageUploaded={setNewHeroImage} 
                     label="Ảnh Banner Hiện Tại (Full Vuông)"
                     aspect="aspect-square" 
                     className="h-64"
                  />
               </div>

               <div className="flex gap-2">
                   <button onClick={() => setShowPopup(null)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-bold uppercase text-xs hover:bg-gray-200">Hủy</button>
                   <button onClick={handleSaveHeroImage} className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-bold uppercase text-xs hover:bg-purple-600 shadow-lg shadow-purple-200">Lưu Thay Đổi</button>
               </div>
            </div>
         </div>
      )}
      
      {/* 10. REVENUE REPORT */}
      {showPopup === 'revenue_report' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[500px] bg-white rounded-[40px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
               <h3 className="text-gray-800 font-black text-xl italic uppercase mb-2 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-green-500" /> Báo Cáo Doanh Thu</h3>
               
               {/* Date Picker */}
               <div className="mb-6">
                   <p className="text-xs font-bold text-gray-400 uppercase mb-1">Chọn ngày xem:</p>
                   <input 
                      type="date" 
                      value={revenueDate} 
                      onChange={(e) => setRevenueDate(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-200"
                   />
               </div>

               {/* "Candle" / Bar Chart Representation */}
               <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
                  <div className="text-center mb-4">
                      <p className="text-sm font-bold text-gray-500 uppercase">Tổng doanh thu ngày {new Date(revenueDate).toLocaleDateString('vi-VN')}</p>
                      <p className="text-3xl font-black text-green-500 mt-1">{calculateRevenue().toLocaleString('vi-VN')}đ</p>
                  </div>
               </div>

               <button onClick={() => setShowPopup(null)} className="mt-6 w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-bold uppercase text-xs hover:bg-gray-200">Đóng</button>
            </div>
         </div>
      )}

      {/* 11. SUPPORT CHAT */}
      {showPopup === 'support_list' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[400px] bg-white rounded-[40px] p-6 shadow-2xl h-[80vh] flex flex-col">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-800 font-black text-lg italic uppercase">Tin Nhắn Hỗ Trợ</h3>
                  <button onClick={() => setShowPopup(null)}><X className="w-6 h-6 text-gray-400" /></button>
               </div>
               <div className="flex-1 overflow-y-auto space-y-2">
                  {sortedChatUsers.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm mt-10">Chưa có tin nhắn nào</p>
                  ) : (
                      sortedChatUsers.map(u => {
                          const lastMsg = u.messages.length > 0 ? u.messages[u.messages.length - 1] : { text: "Chưa có tin nhắn", sender: 'user' };
                          const isUnread = lastMsg.sender === 'user';
                          const isPendingSub = u.subscription?.status === 'Pending' || u.ptSubscription?.status === 'Pending';
                          
                          return (
                              <div key={u.phone} onClick={() => { setSelectedUserPhone(u.phone); setShowPopup('chat'); }} className={`p-4 rounded-2xl border cursor-pointer hover:bg-gray-50 transition-all ${isUnread || isPendingSub ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100'}`}>
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <p className="font-black text-gray-800 text-sm">{u.realName || u.name}</p>
                                          {isPendingSub && <span className="text-[9px] bg-red-100 text-red-500 px-1.5 rounded-md font-bold">Chờ duyệt thanh toán</span>}
                                      </div>
                                      {isUnread && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                                  </div>
                                  <p className="text-xs text-gray-500 truncate mt-1">{lastMsg.sender === 'user' ? 'User: ' : 'Admin: '} {lastMsg.text}</p>
                              </div>
                          )
                      })
                  )}
               </div>
            </div>
         </div>
      )}

      {/* 12. USER SETTINGS MODAL (Fixed State) */}
      {showPopup === 'user_settings' && selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
          <div className="relative w-full max-w-[400px] bg-white rounded-[40px] p-6 shadow-2xl">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                    <img src={selectedUser.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedUser.phone}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-gray-800 font-black text-lg italic uppercase">{selectedUser.realName || selectedUser.name}</h3>
                  <p className="text-gray-400 text-xs font-bold">{selectedUser.phone}</p>
                </div>
                <button onClick={() => setShowPopup(null)} className="ml-auto p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200"><X className="w-5 h-5" /></button>
             </div>

             <div className="space-y-4">
                {/* Rename Real Name */}
                {hasPermission('edit_user_settings') && (
                   <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Tên thật (Admin quản lý)</label>
                      <div className="flex gap-2">
                          <input value={editingRealName} onChange={(e) => setEditingRealName(e.target.value)} className="bg-white rounded-xl px-3 py-2 text-gray-800 font-bold text-sm w-full outline-none border border-gray-200 focus:border-orange-500" placeholder="Nhập tên thật..." />
                          <button onClick={saveRealName} className="bg-blue-500 text-white rounded-xl px-3 font-bold shadow-md"><Pencil className="w-4 h-4" /></button>
                      </div>
                   </div>
                )}

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                   {hasPermission('manage_user') && (
                      <button onClick={() => toggleLock(selectedUser.phone)} className={`${selectedUser.isLocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white p-4 rounded-2xl font-black text-xs uppercase shadow-lg`}>
                         {selectedUser.isLocked ? 'Mở Khóa' : 'Tạm Khóa'}
                      </button>
                   )}
                   {hasPermission('chat_user') && (
                      <button onClick={() => setShowPopup('chat')} className="bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl text-white font-black text-xs uppercase col-span-1 shadow-lg">
                         Chat User
                      </button>
                   )}
                   {hasPermission('manage_user') && (
                      <button onClick={handleDeleteUser} className="bg-red-50 text-red-500 hover:bg-red-100 p-4 rounded-2xl font-black text-xs uppercase col-span-2 border border-red-100">
                         Xóa Vĩnh Viễn User
                      </button>
                   )}
                </div>

                {/* Gift Days */}
                {hasPermission('manage_user') && (
                   <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Tặng ngày tập</p>
                      <div className="flex gap-2">
                         <input type="number" value={giftDays} onChange={(e) => setGiftDays(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 text-gray-800 font-bold w-full outline-none" placeholder="Số ngày..." />
                         <button onClick={handleGiftDays} className="bg-green-500 text-white rounded-xl px-4 py-2 font-black text-xs uppercase shadow-md shadow-green-200">Tặng</button>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* (Chat Popup) */}
      {showPopup === 'chat' && selectedUser && hasPermission('chat_user') && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center px-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
           <div className="relative w-full max-w-[400px] bg-white rounded-[40px] shadow-2xl h-[80vh] flex flex-col overflow-hidden">
              <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
                 <h3 className="text-gray-800 font-black text-sm uppercase">Chat: {selectedUser.realName || selectedUser.name}</h3>
                 <button onClick={() => setShowPopup(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                 {selectedUser.messages?.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`p-3 rounded-2xl max-w-[80%] text-sm font-medium ${m.sender === 'admin' ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-200' : 'bg-white text-gray-700 shadow-sm border border-gray-100'}`}>
                          {m.text}
                       </div>
                    </div>
                 ))}
                 <div ref={chatEndRef}></div>
              </div>
              <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                 <input 
                  value={chatMsg} 
                  onChange={(e) => setChatMsg(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && sendAdminMessage()}
                  className="flex-1 bg-gray-100 rounded-full px-4 text-gray-800 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-200" 
                  placeholder="Nhập tin nhắn..." 
                 />
                 <button onClick={sendAdminMessage} className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white shadow-lg shadow-blue-200"><Send className="w-4 h-4" /></button>
              </div>
           </div>
        </div>
      )}
      
      {/* Manage Admins Popup */}
      {showPopup === 'manage_admins' && currentAdmin?.role === 'super_admin' && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPopup(null)} />
            <div className="relative w-full max-w-[600px] bg-white rounded-[40px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
               <h3 className="text-gray-800 font-black text-xl italic uppercase mb-6 flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-blue-500" /> Quản Lý Quản Trị Viên</h3>
               
               {/* Create New Admin */}
               <div className="bg-blue-50 p-5 rounded-3xl mb-6 border border-blue-100">
                  <h4 className="text-sm font-bold text-blue-800 mb-4">Tạo Admin mới</h4>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                     <input className="bg-white rounded-xl px-4 py-3 text-gray-800 text-sm outline-none border border-blue-100" placeholder="Username" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} />
                     <input className="bg-white rounded-xl px-4 py-3 text-gray-800 text-sm outline-none border border-blue-100" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                     <input className="bg-white rounded-xl px-4 py-3 text-gray-800 text-sm outline-none col-span-2 border border-blue-100" placeholder="Tên hiển thị (VD: Quản lý Gym)" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
                  </div>
                  
                  <p className="text-xs font-bold text-blue-400 mb-2">Phân quyền:</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                     {PERMISSIONS_LIST.map(p => (
                        <div key={p.key} className="flex items-center gap-2">
                           <input 
                              type="checkbox" 
                              checked={(newAdmin.permissions || []).includes(p.key)}
                              onChange={() => handleToggleAdminPermission(p.key)}
                              className="accent-blue-500"
                           />
                           <span className="text-[10px] text-gray-600">{p.label}</span>
                        </div>
                     ))}
                  </div>
                  <button onClick={handleCreateAdmin} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl uppercase text-xs shadow-md shadow-blue-200">Tạo Admin</button>
               </div>

               {/* List Admins */}
               <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Danh sách Admin</h4>
                  {admins.map((admin, idx) => (
                     <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex justify-between items-center">
                        <div>
                           <p className="text-gray-800 font-bold text-sm">{admin.name} <span className="text-[10px] text-gray-400">({admin.username})</span></p>
                           <p className="text-[10px] text-blue-500 uppercase">{admin.role === 'super_admin' ? 'Super Admin' : 'Sub Admin'}</p>
                        </div>
                        {admin.role !== 'super_admin' && (
                           <button onClick={() => {
                              if(window.confirm('Xóa admin này?')) {
                                 setAdmins(admins.filter(a => a.username !== admin.username));
                              }
                           }} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}
      
    </div>
  );
};

export default AdminDashboard;
