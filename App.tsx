
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import TrainingSchedule from './pages/TrainingSchedule';
import Voucher from './pages/Voucher';
import Support from './pages/Support';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './components/AuthPage'; // New Auth Page
import BottomNav from './components/BottomNav';
import SetupPasswordModal from './components/SetupPasswordModal';
import PWAPrompt from './components/PWAPrompt';
import GlobalNotification from './components/GlobalNotification'; 
import { dbService } from './services/firebase';

// New Interfaces
export interface Category {
  id: 'gym' | 'groupx';
  name: string;
}

export interface PackageItem {
  id: string;
  categoryId: 'gym' | 'groupx';
  name: string;
  price: number;
  image: string;
  description?: string;
  duration: number; // Number of months
}

export interface PTPackage {
  id: string;
  name: string;
  price: number;
  sessions: number; 
  image: string;
  description?: string;
}

export interface RevenueTransaction {
  id: string;
  userId: string;
  userName: string;
  packageName: string;
  amount: number;
  date: number;
  type: 'Gym' | 'PT';
  method: 'Cash' | 'Transfer';
}

export interface Subscription {
  name: string;
  months: number;
  expireDate: number | null;
  startDate: number;
  price: number;
  paidAmount: number; 
  paymentMethod?: 'Cash' | 'Transfer';
  voucherCode?: string | null;
  status: 'Pending' | 'Active' | 'Expired' | 'Rejected' | 'Pending Preservation' | 'Preserved';
  packageImage?: string;
}

export interface PTSubscription {
  packageId: string;
  name: string;
  price: number;
  paidAmount: number; 
  totalSessions: number;
  sessionsRemaining: number;
  image: string;
  status: 'Pending' | 'Active' | 'Finished';
  startDate?: number;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  trainerId: string;
  trainerName: string;
  date: string; 
  timeSlot: string; 
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  rating?: number;
  comment?: string;
  media?: string[]; 
  timestamp: number;
}

export interface Notification {
  id: string;
  text: string;
  date: number;
  read: boolean;
  type?: 'system' | 'admin_msg' | 'approval' | 'booking';
}

export interface ChatMessage {
  sender: 'user' | 'admin';
  text: string;
  timestamp: number;
}

export interface UserProfile {
  phone: string;
  password?: string;
  faceData?: string | null;
  loginMethod?: 'password' | 'face';
  gender?: 'Nam' | 'Nữ' | 'Khác'; 
  
  realName?: string; 
  name?: string; 
  email?: string; 
  address?: string; // New
  securityQuestion?: string; // New
  securityAnswer?: string; // New
  
  avatar: string | null;
  subscription: Subscription | null;
  ptSubscription?: PTSubscription | null;
  isLocked: boolean;
  notifications: Notification[];
  messages: ChatMessage[]; 
  trainingDays: string[];
  savedVouchers: string[]; // List of voucher IDs owned
  
  accountStatus?: 'Active'; // Always Active after registration per request

  referredBy?: string;
  referralBonusAvailable?: boolean;
  hasUsedReferralDiscount?: boolean;
  
  settings?: {
    popupNotification: boolean;
  };
}

export type AdminPermission = 
  | 'view_users' | 'approve_users' | 'view_revenue' | 'view_revenue_details'
  | 'send_notification' | 'edit_user_settings' | 'manage_user' | 'chat_user'
  | 'manage_packages' | 'manage_pt_packages' | 'add_pt' | 'view_user_list'
  | 'manage_promo' | 'manage_voucher' | 'view_schedule' | 'manage_app_interface' | 'manage_bookings'
  | 'create_qr'; // New Permission

export interface AdminProfile {
  username: string;
  password?: string; 
  phone?: string; 
  avatar?: string; 
  faceData?: string; 
  role: 'super_admin' | 'sub_admin';
  name: string;
  permissions: AdminPermission[];
  settings: {
    showFloatingMenu: boolean;
    showPopupNoti: boolean;
  };
}

export interface Promotion {
  id: string;
  title: string;
  image: string;
  date: number;
}

export interface VoucherItem {
  id: string;
  title: string;
  code: string;
  type: 'Gym' | 'PT' | 'Gift';
  value: number; 
  color: string;
  image?: string; 
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
}

export interface TrainingProgram {
  id: string;
  title: string;
  duration: string;
  image: string;
}

const AppContent: React.FC = () => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  
  // Admin State
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(null);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);

  // App Settings State
  const [appLogo, setAppLogo] = useState<string>('https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png');
  const [heroImage, setHeroImage] = useState<string>('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600');
  const [heroVideo, setHeroVideo] = useState<string>(''); // New Video State
  const [heroTitle, setHeroTitle] = useState<string>('CÂU LẠC\nBỘ\nGYM');
  const [heroSubtitle, setHeroSubtitle] = useState<string>('GYM CHO MỌI NGƯỜI');
  const [heroOverlayText, setHeroOverlayText] = useState<string>('THAY ĐỔI BẢN THÂN');
  const [heroOverlaySub, setHeroOverlaySub] = useState<string>('Tại Sip Gym Nhà Bè');

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([
    { id: '1', title: 'Giảm 20% Gói Gym', code: 'SIPGYM20', type: 'Gym', value: 0.2, color: 'bg-orange-500' },
    { id: '2', title: 'Giảm 10% Gói PT', code: 'PT10', type: 'PT', value: 0.1, color: 'bg-blue-500' }
  ]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  
  // New Package Structure
  const [packages, setPackages] = useState<PackageItem[]>([
    // Gym Packages
    { id: '1m', categoryId: 'gym', name: '1 Tháng', price: 500000, duration: 1, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300', description: 'Tập gym không giới hạn 1 tháng.' },
    { id: '3m', categoryId: 'gym', name: '3 Tháng', price: 1350000, duration: 3, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=300', description: 'Tiết kiệm 10%.' },
    { id: '6m', categoryId: 'gym', name: '6 Tháng', price: 2500000, duration: 6, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300', description: 'Tặng thêm 15 ngày.' },
    { id: '1y', categoryId: 'gym', name: '1 Năm', price: 4500000, duration: 12, image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=300', description: 'Cam kết thay đổi hình thể.' },
    // Group X Packages
    { id: 'yoga', categoryId: 'groupx', name: 'Yoga', price: 600000, duration: 1, image: 'https://images.unsplash.com/photo-1544367563-12123d8959bd?auto=format&fit=crop&q=80&w=300', description: 'Lớp Yoga thư giãn.' },
    { id: 'aerobic', categoryId: 'groupx', name: 'Aerobic', price: 550000, duration: 1, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=300', description: 'Nhảy Aerobic sôi động.' },
  ]);

  const [ptPackages, setPTPackages] = useState<PTPackage[]>([
     { id: 'pt1', name: 'PT 1 Kèm 1 (12 Buổi)', price: 3600000, sessions: 12, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300', description: 'HLV kèm 1-1, lên thực đơn dinh dưỡng.' },
     { id: 'pt2', name: 'PT 1 Kèm 1 (24 Buổi)', price: 6500000, sessions: 24, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300', description: 'Cam kết thay đổi hình thể.' }
  ]);

  const [isSetupPassOpen, setIsSetupPassOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  
  // Global Popup Notification State
  const [popupNotification, setPopupNotification] = useState<{title: string, msg: string} | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    // --- ADMIN INITIALIZATION (SYNCED WITH FIREBASE) ---
    dbService.subscribe('admins', (data: any) => {
        let adminList: AdminProfile[] = [];
        if (data) {
            adminList = Array.isArray(data) ? data : Object.values(data);
        }

        // Nếu Firebase chưa có Admin nào, tạo mặc định và đẩy lên
        if (adminList.length === 0) {
            const defaultAdmin: AdminProfile = {
                username: 'admin',
                password: '123456', // Pass mặc định
                phone: '0909000000',
                role: 'super_admin',
                name: 'Super Admin',
                permissions: [], 
                settings: { showFloatingMenu: true, showPopupNoti: true }
            };
            adminList = [defaultAdmin];
            dbService.saveAll('admins', adminList); // Lưu ngay lên Firebase
        }
        
        setAdmins(adminList);

        // Update current admin session if it exists
        const sessionStr = localStorage.getItem('admin_session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            const updatedMe = adminList.find(a => a.username === session.username);
            if (updatedMe) {
                setCurrentAdmin(updatedMe);
                localStorage.setItem('admin_session', JSON.stringify(updatedMe));
            }
        }
    });
  }, []);

  const syncAdmins = (newAdmins: AdminProfile[]) => {
    setAdmins(newAdmins);
    dbService.saveAll('admins', newAdmins); // Lưu thẳng lên Firebase
    if (currentAdmin) {
      const updatedMe = newAdmins.find(a => a.username === currentAdmin.username);
      if (updatedMe) {
          setCurrentAdmin(updatedMe);
          localStorage.setItem('admin_session', JSON.stringify(updatedMe));
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { setIsLoading(false); }, 1500);

    dbService.subscribe('users', (data: any) => {
      const rawList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      const sanitizedUsers: UserProfile[] = rawList.map((u: any) => ({
        ...u,
        notifications: Array.isArray(u.notifications) ? u.notifications : (u.notifications ? Object.values(u.notifications) : []),
        messages: Array.isArray(u.messages) ? u.messages : (u.messages ? Object.values(u.messages) : []),
        trainingDays: Array.isArray(u.trainingDays) ? u.trainingDays : (u.trainingDays ? Object.values(u.trainingDays) : []),
        savedVouchers: Array.isArray(u.savedVouchers) ? u.savedVouchers : [],
        settings: u.settings || { popupNotification: true },
        accountStatus: 'Active' // Force Active for all users per request
      }));

      const loggedPhone = localStorage.getItem('sip_gym_logged_phone');
      if (loggedPhone) {
        const newUserState = sanitizedUsers.find(u => u.phone === loggedPhone);
        const oldUserState = allUsers.find(u => u.phone === loggedPhone);
        
        if (newUserState && oldUserState) {
             if (newUserState.notifications.length > oldUserState.notifications.length) {
                 const newNoti = newUserState.notifications[0];
                 if (newUserState.settings?.popupNotification && !newNoti.read) {
                     setPopupNotification({ title: 'Thông báo mới', msg: newNoti.text });
                 }
             }
             if (newUserState.messages.length > oldUserState.messages.length) {
                 const lastMsg = newUserState.messages[newUserState.messages.length - 1];
                 if (lastMsg.sender === 'admin' && newUserState.settings?.popupNotification) {
                     setPopupNotification({ title: 'Tin nhắn từ Admin', msg: lastMsg.text });
                 }
             }
        }
        if (newUserState) {
          setCurrentUser(newUserState);
        }
      }
      setAllUsers(sanitizedUsers);
      setIsLoading(false);
    });

    dbService.subscribe('transactions', (data: any) => {
        let raw = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        setTransactions(raw as RevenueTransaction[]);
    });

    dbService.subscribe('bookings', (data: any) => {
       let rawBookings = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
       setBookings(rawBookings as Booking[]);
    });

    dbService.subscribe('app_settings', (data: any) => {
        if (data) {
            if (data.appLogo) setAppLogo(data.appLogo);
            if (data.heroImage) setHeroImage(data.heroImage);
            if (data.heroVideo) setHeroVideo(data.heroVideo);
            if (data.heroTitle) setHeroTitle(data.heroTitle);
            if (data.heroSubtitle) setHeroSubtitle(data.heroSubtitle);
            if (data.heroOverlayText) setHeroOverlayText(data.heroOverlayText);
            if (data.heroOverlaySub) setHeroOverlaySub(data.heroOverlaySub);
        }
    });

    dbService.subscribe('promos', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (data) setPromotions(list as Promotion[]);
    });

    dbService.subscribe('vouchers', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (data) setVouchers(list as VoucherItem[]);
    });

    dbService.subscribe('trainers', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (data) setTrainers(list as Trainer[]);
    });

    dbService.subscribe('packages', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (data) setPackages(list as PackageItem[]);
    });

    dbService.subscribe('pt_packages', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (data) setPTPackages(list as PTPackage[]);
    });

    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
       const savedAdmin = JSON.parse(adminSession);
       setCurrentAdmin(savedAdmin);
    }
    return () => clearTimeout(timer);
  }, [allUsers.length]); 

  const syncDB = (newUsers: UserProfile[]) => {
    setAllUsers(newUsers); 
    const loggedPhone = localStorage.getItem('sip_gym_logged_phone');
    if(loggedPhone) {
        const me = newUsers.find(u => u.phone === loggedPhone);
        if(me) setCurrentUser(me);
    }
    dbService.saveAll('users', newUsers);
  };

  const syncTransactions = (newTrans: RevenueTransaction[]) => {
      setTransactions(newTrans);
      dbService.saveAll('transactions', newTrans);
  };

  const syncBookings = (newBookings: Booking[]) => {
      setBookings(newBookings);
      dbService.saveAll('bookings', newBookings);
  };
  
  const syncAppConfig = (config: { appLogo: string, heroImage: string, heroVideo?: string, heroTitle: string, heroSubtitle: string, heroOverlayText?: string, heroOverlaySub?: string }) => {
      setAppLogo(config.appLogo);
      setHeroImage(config.heroImage);
      if(config.heroVideo) setHeroVideo(config.heroVideo);
      setHeroTitle(config.heroTitle);
      setHeroSubtitle(config.heroSubtitle);
      if(config.heroOverlayText) setHeroOverlayText(config.heroOverlayText);
      if(config.heroOverlaySub) setHeroOverlaySub(config.heroOverlaySub);
      dbService.saveAll('app_settings', config);
  };
  
  const syncVouchers = (newVouchers: VoucherItem[]) => { setVouchers(newVouchers); dbService.saveAll('vouchers', newVouchers); };
  const syncPromos = (newPromos: Promotion[]) => { setPromotions(newPromos); dbService.saveAll('promos', newPromos); };
  const syncTrainers = (newTrainers: Trainer[]) => { setTrainers(newTrainers); dbService.saveAll('trainers', newTrainers); };
  const syncPackages = (newPackages: PackageItem[]) => { setPackages(newPackages); dbService.saveAll('packages', newPackages); };
  const syncPTPackages = (newPTPackages: PTPackage[]) => { setPTPackages(newPTPackages); dbService.saveAll('pt_packages', newPTPackages); };

  const handleLoginSuccess = (user: UserProfile) => {
    localStorage.setItem('sip_gym_logged_phone', user.phone);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('sip_gym_logged_phone');
    setCurrentUser(null);
  };
  
  const handleUpdateSubscription = (packageName: string, months: number, price: number, method: 'Cash' | 'Transfer', voucherCode?: string) => {
    if (!currentUser) return;
    const pkg = packages.find(p => p.name === packageName);
    const newSubscription: Subscription = {
      name: packageName, 
      months: months, 
      expireDate: null, 
      startDate: Date.now(), 
      price: price, 
      paidAmount: price, 
      status: 'Pending', 
      packageImage: pkg?.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
      paymentMethod: method,
      voucherCode: voucherCode || null // Sanitized voucherCode
    };
    let updatedUser = { ...currentUser, subscription: newSubscription };
    
    // Add Transaction Record (Independent of user)
    const newTrans: RevenueTransaction = {
        id: Date.now().toString(),
        userId: currentUser.phone,
        userName: currentUser.name || currentUser.phone,
        packageName: packageName,
        amount: price,
        date: Date.now(),
        type: 'Gym',
        method: method
    };
    syncTransactions([...transactions, newTrans]);

    if (updatedUser.referralBonusAvailable) updatedUser.referralBonusAvailable = false;
    else if (updatedUser.referredBy && !updatedUser.hasUsedReferralDiscount) updatedUser.hasUsedReferralDiscount = true;

    const newUsers = allUsers.map(u => u.phone === currentUser.phone ? updatedUser : u);
    syncDB(newUsers);
    setPopupNotification({ title: 'Đăng ký thành công', msg: 'Gói tập đang chờ Admin duyệt.' });
  };

  const handleRegisterPT = (ptPackage: PTPackage, paidAmount: number, method: 'Cash' | 'Transfer', voucherCode?: string) => {
    if (!currentUser) return;
    const newPTSub: PTSubscription = {
      packageId: ptPackage.id, 
      name: ptPackage.name, 
      price: ptPackage.price, 
      paidAmount: paidAmount, 
      totalSessions: ptPackage.sessions, 
      sessionsRemaining: ptPackage.sessions, 
      image: ptPackage.image, 
      status: 'Pending',
    };
    
    // Add Transaction Record
    const newTrans: RevenueTransaction = {
        id: Date.now().toString(),
        userId: currentUser.phone,
        userName: currentUser.name || currentUser.phone,
        packageName: ptPackage.name,
        amount: paidAmount,
        date: Date.now(),
        type: 'PT',
        method: method
    };
    syncTransactions([...transactions, newTrans]);

    const newUsers = allUsers.map(u => u.phone === currentUser.phone ? { ...u, ptSubscription: newPTSub } : u);
    syncDB(newUsers);
    setPopupNotification({ title: 'Đăng ký PT thành công', msg: 'Gói PT đang chờ Admin duyệt.' });
  };

  const handleAdminLoginSuccess = (admin: AdminProfile) => {
    setCurrentAdmin(admin);
    localStorage.setItem('admin_session', JSON.stringify(admin));
  };

  if (isLoading && dbService.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden w-full">
      <PWAPrompt />
      {popupNotification && (
          <GlobalNotification 
             title={popupNotification.title} 
             message={popupNotification.msg} 
             onClose={() => setPopupNotification(null)} 
          />
      )}
      
      <div className={`flex-1 overflow-y-auto no-scrollbar w-full ${isAdminPath ? 'bg-[#FFF7ED]' : 'bg-[#FFF7ED]'}`}>
        <Routes>
          <Route 
            path="/" 
            element={
              currentUser ? (
                <Home 
                  user={currentUser} 
                  promotions={promotions}
                  trainers={trainers}
                  programs={programs}
                  packages={packages}
                  ptPackages={ptPackages}
                  vouchers={vouchers}
                  appLogo={appLogo}
                  heroImage={heroImage}
                  heroVideo={heroVideo}
                  heroTitle={heroTitle}
                  heroSubtitle={heroSubtitle}
                  heroOverlayText={heroOverlayText}
                  heroOverlaySub={heroOverlaySub}
                  onLogout={handleLogout}
                  onUpdateUser={syncDB}
                  onUpdateSubscription={handleUpdateSubscription}
                  onRegisterPT={handleRegisterPT}
                  allUsers={allUsers}
                  bookings={bookings}
                  onUpdateBookings={syncBookings}
                />
              ) : (
                <AuthPage 
                   allUsers={allUsers} 
                   onLoginSuccess={handleLoginSuccess}
                   onUpdateUsers={syncDB}
                />
              )
            } 
          />
          <Route path="/schedule" element={currentUser ? <TrainingSchedule user={currentUser} allUsers={allUsers} onUpdateUser={syncDB} bookings={bookings} onUpdateBookings={syncBookings} /> : <Navigate to="/" replace />} />
          <Route path="/voucher" element={currentUser ? <Voucher user={currentUser} allUsers={allUsers} onUpdateUser={syncDB} vouchers={vouchers} /> : <Navigate to="/" replace />} />
          <Route path="/support" element={currentUser ? <Support user={currentUser} allUsers={allUsers} onUpdateUser={syncDB} /> : <Navigate to="/" replace />} />
          <Route path="/profile" element={currentUser ? <Profile user={currentUser} onUpdateSubscription={handleUpdateSubscription} onUpdateUser={syncDB} allUsers={allUsers} packages={packages} vouchers={vouchers} /> : <Navigate to="/" replace />} />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminDashboard 
                currentAdmin={currentAdmin}
                admins={admins}
                setAdmins={syncAdmins}
                allUsers={allUsers} 
                setAllUsers={syncDB} 
                promotions={promotions} 
                setPromos={syncPromos}
                vouchers={vouchers}
                setVouchers={syncVouchers}
                trainers={trainers} 
                setTrainers={syncTrainers}
                packages={packages}
                setPackages={syncPackages}
                programs={programs} 
                setPrograms={(p) => {}}
                ptPackages={ptPackages}
                setPTPackages={syncPTPackages}
                heroImage={heroImage}
                heroTitle={heroTitle}
                heroSubtitle={heroSubtitle}
                heroOverlayText={heroOverlayText}
                heroOverlaySub={heroOverlaySub}
                onUpdateAppConfig={syncAppConfig}
                bookings={bookings}
                onUpdateBookings={syncBookings}
                onLogout={() => {
                  setCurrentAdmin(null);
                  localStorage.removeItem('admin_session');
                  navigate('/admin');
                }}
              />
            } 
          />
          <Route 
             path="/admin" 
             element={<AdminLogin admins={admins} onLoginSuccess={handleAdminLoginSuccess} />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {(!isAdminPath && currentUser) && <div className="h-28"></div>}
      </div>
      {(!isAdminPath && currentUser) && <BottomNav />}
      
      <SetupPasswordModal
        isOpen={isSetupPassOpen}
        onClose={() => { 
           if(currentUser?.password) setIsSetupPassOpen(false);
           else handleLogout();
        }}
        user={currentUser}
        allUsers={allUsers}
        onUpdateUser={syncDB}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
