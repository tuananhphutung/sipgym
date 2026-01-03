
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import TrainingSchedule from './pages/TrainingSchedule';
import Voucher from './pages/Voucher';
import Support from './pages/Support';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import SetupPasswordModal from './components/SetupPasswordModal';
import PWAPrompt from './components/PWAPrompt';
import GlobalNotification from './components/GlobalNotification'; 
import { dbService } from './services/firebase';

export interface PackageItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export interface PTPackage {
  id: string;
  name: string;
  price: number;
  sessions: number; 
  image: string;
  description?: string;
}

export interface Subscription {
  name: string;
  months: number;
  expireDate: number | null;
  startDate: number;
  price: number;
  paidAmount: number; 
  paymentMethod?: string;
  voucherCode?: string;
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
  email?: string; // Added email for recovery
  
  avatar: string | null;
  subscription: Subscription | null;
  ptSubscription?: PTSubscription | null;
  isLocked: boolean;
  notifications: Notification[];
  messages: ChatMessage[]; 
  trainingDays: string[];
  
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
  | 'manage_promo' | 'manage_voucher' | 'view_schedule' | 'manage_app_interface' | 'manage_bookings';

export interface AdminProfile {
  username: string;
  password?: string; 
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
  
  // Admin State
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(null);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);

  // App Settings State
  const [heroImage, setHeroImage] = useState<string>('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600');
  const [heroTitle, setHeroTitle] = useState<string>('CÂU LẠC\nBỘ\nGYM');
  const [heroSubtitle, setHeroSubtitle] = useState<string>('GYM CHO MỌI NGƯỜI');

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([
    { id: '1', title: 'Giảm 20% Gói Gym', code: 'SIPGYM20', type: 'Gym', value: 0.2, color: 'bg-orange-500' },
    { id: '2', title: 'Giảm 10% Gói PT', code: 'PT10', type: 'PT', value: 0.1, color: 'bg-blue-500' }
  ]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  
  const [packages, setPackages] = useState<PackageItem[]>([
    { id: 'gym', name: 'Gói Gym', price: 500000, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300', description: 'Tập gym không giới hạn thời gian.' },
    { id: 'groupx', name: 'Gói Group X', price: 800000, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=300', description: 'Bao gồm Yoga, Zumba, Aerobic.' },
  ]);

  const [ptPackages, setPTPackages] = useState<PTPackage[]>([
     { id: 'pt1', name: 'PT 1 Kèm 1 (12 Buổi)', price: 3600000, sessions: 12, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300', description: 'HLV kèm 1-1, lên thực đơn dinh dưỡng.' },
     { id: 'pt2', name: 'PT 1 Kèm 1 (24 Buổi)', price: 6500000, sessions: 24, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300', description: 'Cam kết thay đổi hình thể.' }
  ]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSetupPassOpen, setIsSetupPassOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  
  // Global Popup Notification State
  const [popupNotification, setPopupNotification] = useState<{title: string, msg: string} | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    const savedAdminsStr = localStorage.getItem('sip_gym_admins_db');
    let adminList: AdminProfile[] = [];
    if (savedAdminsStr) {
      try { adminList = JSON.parse(savedAdminsStr); } catch (e) { adminList = []; }
    }
    const adminIndex = adminList.findIndex(a => a.username === 'admin');
    if (adminIndex === -1) {
        adminList.push({
            username: 'admin',
            password: '123456', 
            role: 'super_admin',
            name: 'Super Admin',
            permissions: [], 
            settings: { showFloatingMenu: true, showPopupNoti: true }
        });
        localStorage.setItem('sip_gym_admins_db', JSON.stringify(adminList));
    }
    setAdmins(adminList);
  }, []);

  const syncAdmins = (newAdmins: AdminProfile[]) => {
    setAdmins(newAdmins);
    localStorage.setItem('sip_gym_admins_db', JSON.stringify(newAdmins));
    if (currentAdmin) {
      const updatedMe = newAdmins.find(a => a.username === currentAdmin.username);
      if (updatedMe) setCurrentUser(updatedMe as any); // Type cast for simplicity in mixed context
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
        settings: u.settings || { popupNotification: true }
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
          if (!newUserState.password) setIsSetupPassOpen(true);
        }
      }
      setAllUsers(sanitizedUsers);
      setIsLoading(false);
    });

    dbService.subscribe('bookings', (data: any) => {
       let rawBookings = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
       setBookings(rawBookings as Booking[]);
    });

    dbService.subscribe('app_settings', (data: any) => {
        if (data) {
            if (data.heroImage) setHeroImage(data.heroImage);
            if (data.heroTitle) setHeroTitle(data.heroTitle);
            if (data.heroSubtitle) setHeroSubtitle(data.heroSubtitle);
        }
    });

    dbService.subscribe('promos', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (list.length > 0) setPromotions(list as Promotion[]);
    });

    dbService.subscribe('vouchers', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (list.length > 0) setVouchers(list as VoucherItem[]);
    });

    dbService.subscribe('trainers', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (list.length > 0) setTrainers(list as Trainer[]);
    });

    dbService.subscribe('packages', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (list.length > 0) setPackages(list as PackageItem[]);
    });

    dbService.subscribe('pt_packages', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (list.length > 0) setPTPackages(list as PTPackage[]);
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

  const syncBookings = (newBookings: Booking[]) => {
      setBookings(newBookings);
      dbService.saveAll('bookings', newBookings);
  };
  
  const syncAppConfig = (config: { heroImage: string, heroTitle: string, heroSubtitle: string }) => {
      setHeroImage(config.heroImage);
      setHeroTitle(config.heroTitle);
      setHeroSubtitle(config.heroSubtitle);
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
    setIsAuthModalOpen(false);
    if (!user.password) {
       setIsSetupPassOpen(true);
    }
  };

  const handleRegister = (phone: string, gender: 'Nam' | 'Nữ' | 'Khác') => {
    const newUser: UserProfile = { 
      phone, 
      gender,
      realName: `Hội viên mới`, 
      name: `Member ${phone.slice(-4)}`,
      avatar: null, 
      subscription: null,
      ptSubscription: null,
      isLocked: false, 
      notifications: [], 
      messages: [],
      trainingDays: [],
      loginMethod: 'password',
      settings: { popupNotification: true }
    };
    
    const newUsers = [...allUsers, newUser];
    syncDB(newUsers);
    handleLoginSuccess(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('sip_gym_logged_phone');
    setCurrentUser(null);
  };
  
  const handleUpdateSubscription = (packageName: string, months: number, price: number, voucherCode?: string) => {
    if (!currentUser) return;
    const pkg = packages.find(p => p.name === packageName);
    const newSubscription: Subscription = {
      name: packageName, 
      months: months, 
      expireDate: null, 
      startDate: Date.now(), 
      price: pkg ? pkg.price * months : price, 
      paidAmount: price, 
      status: 'Pending', 
      packageImage: pkg?.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
      paymentMethod: 'Transfer',
      voucherCode: voucherCode
    };
    let updatedUser = { ...currentUser, subscription: newSubscription };
    if (updatedUser.referralBonusAvailable) updatedUser.referralBonusAvailable = false;
    else if (updatedUser.referredBy && !updatedUser.hasUsedReferralDiscount) updatedUser.hasUsedReferralDiscount = true;

    const newUsers = allUsers.map(u => u.phone === currentUser.phone ? updatedUser : u);
    syncDB(newUsers);
  };

  const handleRegisterPT = (ptPackage: PTPackage, paidAmount: number, voucherCode?: string) => {
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
    const newUsers = allUsers.map(u => u.phone === currentUser.phone ? { ...u, ptSubscription: newPTSub } : u);
    syncDB(newUsers);
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
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      <PWAPrompt />
      {popupNotification && (
          <GlobalNotification 
             title={popupNotification.title} 
             message={popupNotification.msg} 
             onClose={() => setPopupNotification(null)} 
          />
      )}
      
      <div className={`flex-1 overflow-y-auto no-scrollbar ${isAdminPath ? 'bg-[#FFF7ED]' : 'bg-[#FFF7ED]'}`}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                user={currentUser} 
                promotions={promotions}
                trainers={trainers}
                programs={programs}
                packages={packages}
                ptPackages={ptPackages}
                vouchers={vouchers}
                heroImage={heroImage}
                heroTitle={heroTitle}
                heroSubtitle={heroSubtitle}
                onOpenAuth={() => setIsAuthModalOpen(true)} 
                onLogout={handleLogout}
                onUpdateUser={syncDB}
                onUpdateSubscription={handleUpdateSubscription}
                onRegisterPT={handleRegisterPT}
                allUsers={allUsers}
                bookings={bookings}
                onUpdateBookings={syncBookings}
              />
            } 
          />
          <Route path="/schedule" element={<TrainingSchedule user={currentUser} allUsers={allUsers} onUpdateUser={syncDB} bookings={bookings} onUpdateBookings={syncBookings} />} />
          <Route path="/voucher" element={<Voucher vouchers={vouchers} />} />
          <Route path="/support" element={<Support user={currentUser} allUsers={allUsers} onUpdateUser={syncDB} />} />
          <Route path="/profile" element={<Profile user={currentUser} onUpdateSubscription={handleUpdateSubscription} onUpdateUser={syncDB} allUsers={allUsers} packages={packages} vouchers={vouchers} />} />
          <Route 
             path="/admin" 
             element={<AdminLogin admins={admins} onLoginSuccess={handleAdminLoginSuccess} />} 
          />
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {!isAdminPath && <div className="h-28"></div>}
      </div>
      {!isAdminPath && <BottomNav />}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        allUsers={allUsers}
        onLoginSuccess={handleLoginSuccess}
        onRegister={handleRegister}
        onResetPassword={(phone, newPass) => {
            const newUsers = allUsers.map(u => u.phone === phone ? { ...u, password: newPass } : u);
            syncDB(newUsers);
        }}
      />

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
