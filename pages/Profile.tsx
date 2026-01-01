
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Package, PlusCircle, RefreshCw, ClipboardList, LogOut, ShieldCheck, X, Camera, PauseCircle, Users, Lock, ScanFace, UserCheck, Bell } from 'lucide-react';
import { UserProfile, PackageItem, VoucherItem } from '../App';
import PaymentModal from '../components/PaymentModal';
import ImageUpload from '../components/ImageUpload';
import { dbService } from '../services/firebase';

interface ProfileProps {
  user: UserProfile | null;
  onUpdateSubscription: (packageName: string, months: number, price: number, voucherCode?: string) => void;
  onUpdateUser: (users: UserProfile[]) => void;
  allUsers: UserProfile[];
  packages: PackageItem[];
  vouchers: VoucherItem[];
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateSubscription, onUpdateUser, allUsers, packages, vouchers }) => {
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editGender, setEditGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');

  // Security State
  const [newPass, setNewPass] = useState('');
  
  // Camera State
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Referral State
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Handle Camera Effect
  useEffect(() => {
    let mounted = true;
    const startCamera = async () => {
       if (isFaceScanning) {
          try {
             if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
             const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
             if (!mounted) {
                stream.getTracks().forEach(t => t.stop());
                return;
             }
             streamRef.current = stream;
             if (videoRef.current) {
                videoRef.current.srcObject = stream;
             }
          } catch (e) {
             console.error(e);
             if (mounted) {
                alert("Không thể mở camera. Vui lòng cấp quyền.");
                setIsFaceScanning(false);
             }
          }
       } else {
          // Cleanup
          if (streamRef.current) {
             streamRef.current.getTracks().forEach(t => t.stop());
             streamRef.current = null;
          }
          if (videoRef.current) {
             videoRef.current.srcObject = null;
          }
       }
    };
    
    startCamera();

    return () => {
       mounted = false;
       if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
       }
    };
  }, [isFaceScanning]);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleEditOpen = () => {
    setEditName(user.name || `Member ${user.phone.slice(-4)}`);
    setEditAvatar(user.avatar || '');
    setEditGender(user.gender || 'Nam');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    const newUsers = allUsers.map(u => {
      if (u.phone === user.phone) {
        return { ...u, name: editName, avatar: editAvatar || null, gender: editGender };
      }
      return u;
    });
    onUpdateUser(newUsers);
    setIsEditModalOpen(false);
  };

  const changePassword = () => {
    if (newPass.length < 6) return alert("Mật khẩu quá ngắn");
    const newUsers = allUsers.map(u => u.phone === user.phone ? { ...u, password: newPass } : u);
    onUpdateUser(newUsers);
    setNewPass('');
    alert("Đổi mật khẩu thành công");
  };

  const captureFace = () => {
     if (videoRef.current) {
       const canvas = document.createElement('canvas');
       canvas.width = videoRef.current.videoWidth;
       canvas.height = videoRef.current.videoHeight;
       canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
       
       // Convert to base64 string
       const base64Image = canvas.toDataURL('image/jpeg', 0.8); // 80% quality

       setIsFaceScanning(false);
       
       const newUsers = allUsers.map(u => u.phone === user.phone ? { ...u, faceData: base64Image, loginMethod: 'face' as const } : u);
       onUpdateUser(newUsers);
       alert("Đã đăng ký Face ID thành công! Bạn có thể sử dụng khuôn mặt để đăng nhập.");
     }
  };

  const applyReferralCode = () => {
    if (!referralCodeInput) return;
    if (referralCodeInput === user.phone) { alert("Bạn không thể tự giới thiệu chính mình!"); return; }
    const referrer = allUsers.find(u => u.phone === referralCodeInput);
    if (!referrer) { alert("Mã giới thiệu (SĐT) không tồn tại!"); return; }
    const newUsers = allUsers.map(u => {
      if (u.phone === user.phone) return { ...u, referredBy: referralCodeInput, hasUsedReferralDiscount: false };
      if (u.phone === referralCodeInput) return { ...u, referralBonusAvailable: true, notifications: [{ id: Math.random().toString(), text: `Chúc mừng! Bạn đã giới thiệu thành công ${user.name}.`, date: Date.now(), read: false }, ...u.notifications] };
      return u;
    });
    onUpdateUser(newUsers);
    alert("Áp dụng mã thành công!");
  };

  const handlePreserveRequest = () => {
     if (!user.subscription) return;
     if (user.subscription.months < 6) { alert("Chức năng bảo lưu chỉ dành cho gói tập từ 6 tháng trở lên."); return; }
     if (window.confirm("Bạn chỉ được bảo lưu 1 lần duy nhất trong 1 tháng. Bạn có đồng ý không?")) {
        const newUsers = allUsers.map(u => u.phone === user.phone && u.subscription ? { ...u, subscription: { ...u.subscription, status: 'Pending Preservation' as const } } : u);
        onUpdateUser(newUsers);
        alert("Yêu cầu bảo lưu đã được gửi.");
     }
  };

  const togglePopupNoti = () => {
      const currentSetting = user.settings?.popupNotification ?? true;
      const newUsers = allUsers.map(u => u.phone === user.phone ? { ...u, settings: { ...u.settings, popupNotification: !currentSetting } } : u);
      onUpdateUser(newUsers);
  };

  const menuItems = [
    { label: 'Đăng ký thêm gói', icon: PlusCircle, color: 'text-blue-500', action: () => setIsPaymentModalOpen(true) },
    { label: 'Gia hạn gói', icon: RefreshCw, color: 'text-green-500', action: () => setIsPaymentModalOpen(true) },
    { label: 'Lịch tập luyện', icon: ClipboardList, color: 'text-purple-500', action: () => navigate('/schedule') },
    { label: 'Cài đặt & Bảo mật', icon: ShieldCheck, color: 'text-orange-500', action: () => setIsSecurityModalOpen(true) },
  ];

  // Referral Calc
  let referralDiscount = 0;
  let discountReason = "";
  if (user?.referralBonusAvailable) {
    referralDiscount = 0.10; 
    discountReason = "Thưởng giới thiệu bạn bè";
  } else if (user?.referredBy && !user.hasUsedReferralDiscount) {
    referralDiscount = 0.05; 
    discountReason = "Quà thành viên mới";
  }

  return (
    <div className="bg-[#F7FAFC] min-h-screen animate-in slide-in-from-right duration-300 pb-10">
      {/* Top Banner */}
      <div className="bg-[#FF6B00] h-52 relative overflow-hidden flex items-center px-6">
        <button onClick={() => navigate('/')} className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"><ArrowLeft className="w-6 h-6" /></button>
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-5 mt-4 w-full z-10">
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-full border-4 border-white/30 shadow-2xl overflow-hidden">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" /> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} className="w-full h-full object-cover" alt="avatar" />}
            </div>
            <button onClick={handleEditOpen} className="absolute bottom-0 right-0 bg-white text-[#FF6B00] p-1.5 rounded-full shadow-lg border border-gray-100"><Edit2 className="w-3 h-3" /></button>
          </div>
          <div className="flex-1">
            <h1 className="text-white text-xl font-black italic uppercase tracking-tighter leading-tight truncate">{user.name || `Member ${user.phone.slice(-4)}`}</h1>
            <p className="text-white/80 font-bold tracking-widest text-sm">{user.phone}</p>
            <p className="text-white/80 font-bold text-xs mt-1">Giới tính: {user.gender || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 space-y-4">
        {/* Referral */}
        {!user.referredBy && (
          <div className="bg-white rounded-[32px] p-5 shadow-xl shadow-orange-50 border border-gray-50">
             <h3 className="text-xs font-black text-gray-500 uppercase mb-2 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Nhập mã giới thiệu</h3>
             <div className="flex gap-2">
                <input type="text" value={referralCodeInput} onChange={(e) => setReferralCodeInput(e.target.value)} placeholder="SĐT người giới thiệu" className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold flex-1 outline-none border border-transparent focus:border-orange-500"/>
                <button onClick={applyReferralCode} className="bg-[#8DBF44] text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-sm">Áp dụng</button>
             </div>
          </div>
        )}

        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-orange-50 border border-gray-50">
          <h2 className="text-gray-800 font-black text-lg mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-[#FF6B00]" />Thông Tin Gói Tập</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-400 text-sm font-bold uppercase">Gói đang dùng</span>
              <span className="text-gray-800 font-black">{user.subscription?.name || 'Chưa đăng ký'}</span>
            </div>
            {/* ... other subscription details ... */}
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-400 text-sm font-bold uppercase">Trạng thái</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.subscription?.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{user.subscription?.status || 'Trống'}</span>
            </div>
             {user.subscription?.status === 'Active' && user.subscription.months >= 6 && (
                <button onClick={handlePreserveRequest} className="w-full mt-2 border border-purple-200 text-purple-500 hover:bg-purple-50 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase transition-all"><PauseCircle className="w-4 h-4" /> Yêu cầu bảo lưu</button>
            )}
          </div>
        </div>
        
        {/* PT Section */}
         {user.ptSubscription && (
          <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-blue-50 border border-blue-50">
            <h2 className="text-gray-800 font-black text-lg mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-500" />Thông Tin Gói PT</h2>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100"><img src={user.ptSubscription.image} className="w-full h-full object-cover" alt="pt" /></div>
                <div><p className="font-black text-gray-800 text-sm">{user.ptSubscription.name}</p></div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[32px] p-4 shadow-xl shadow-orange-50 border border-gray-50 overflow-hidden">
          {menuItems.map((item, idx) => (
            <button key={idx} onClick={item.action} className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${idx !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className={`w-10 h-10 ${item.color.replace('text', 'bg')}/10 rounded-xl flex items-center justify-center ${item.color}`}><item.icon className="w-5 h-5" /></div>
              <span className="font-bold text-gray-700">{item.label}</span>
              <div className="ml-auto w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 border-r-2 border-b-2 border-gray-300 rotate-[-45deg]"></div></div>
            </button>
          ))}
        </div>

        <button onClick={() => navigate('/')} className="w-full bg-white border-2 border-gray-100 text-gray-400 py-4 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"><LogOut className="w-4 h-4 rotate-180" />Thoát Quay Lại Trang Chủ</button>
      </div>

      <PaymentModal 
         isOpen={isPaymentModalOpen} 
         onClose={() => setIsPaymentModalOpen(false)} 
         type="gym"
         packages={packages} 
         vouchers={vouchers}
         userReferralDiscount={referralDiscount}
         userDiscountReason={discountReason}
         onConfirm={(data) => {
            onUpdateSubscription(data.packageName, data.months, data.price, data.voucherCode);
         }}
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
                <div className="flex justify-center"><div className="w-32 h-32"><ImageUpload currentImage={editAvatar} onImageUploaded={setEditAvatar} label="Ảnh đại diện" aspect="aspect-square" className="rounded-full overflow-hidden shadow-lg border-4 border-orange-50"/></div></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Tên hiển thị</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-50 rounded-xl py-3 px-4 text-sm font-bold mt-1 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"/></div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1">Giới tính</label>
                   <div className="flex gap-2 mt-1">
                      {(['Nam', 'Nữ', 'Khác'] as const).map(g => (
                         <button key={g} onClick={() => setEditGender(g)} className={`flex-1 py-2 rounded-lg font-bold text-sm border ${editGender === g ? 'bg-orange-50 border-[#FF6B00] text-[#FF6B00]' : 'border-gray-200 text-gray-400'}`}>{g}</button>
                      ))}
                   </div>
                </div>
                <button onClick={handleSaveProfile} className="w-full bg-[#FF6B00] text-white py-3 rounded-xl font-black uppercase shadow-lg shadow-orange-200 active:scale-95 transition-all mt-2">Lưu Thay Đổi</button>
             </div>
          </div>
        </div>
      )}

      {/* Security Settings Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSecurityModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
             {/* Change Pass */}
             <div className="space-y-6">
                <div>
                   <h4 className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3"><Lock className="w-4 h-4"/> Đổi Mật Khẩu</h4>
                   <div className="flex gap-2"><input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Mật khẩu mới..." className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold outline-none border border-transparent focus:border-orange-500"/><button onClick={changePassword} className="bg-gray-800 text-white rounded-xl px-4 text-xs font-black uppercase">Lưu</button></div>
                </div>
                <hr className="border-gray-100" />
                
                {/* Popup Notification Toggle */}
                <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-sm font-black text-gray-700"><Bell className="w-4 h-4"/> Thông Báo Popup</h4>
                    <button onClick={togglePopupNoti} className={`w-12 h-7 rounded-full p-1 transition-colors ${user.settings?.popupNotification ? 'bg-green-500' : 'bg-gray-200'}`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${user.settings?.popupNotification ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                <hr className="border-gray-100" />
                {/* Face ID Settings */}
                <div>
                   <h4 className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3"><ScanFace className="w-4 h-4"/> Đăng nhập khuôn mặt</h4>
                   {isFaceScanning ? (
                      <div className="bg-black rounded-2xl overflow-hidden aspect-square relative border-4 border-[#FF6B00]">
                         <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                         <div className="absolute bottom-4 left-0 right-0 flex justify-center"><button onClick={captureFace} className="bg-white text-orange-600 px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg">Chụp & Lưu</button></div>
                      </div>
                   ) : (
                      <div className="bg-orange-50 p-4 rounded-2xl flex items-center justify-between">
                         <div><p className="text-xs font-bold text-gray-600">Trạng thái: {user.faceData ? <span className="text-green-600">Đã kích hoạt</span> : <span className="text-gray-400">Chưa cài đặt</span>}</p></div>
                         <button onClick={() => setIsFaceScanning(true)} className="bg-[#FF6B00] text-white p-3 rounded-xl shadow-lg shadow-orange-200"><Camera className="w-5 h-5" /></button>
                      </div>
                   )}
                </div>
             </div>
             <button onClick={() => setIsSecurityModalOpen(false)} className="mt-6 w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-bold uppercase text-xs">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
