
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import TrainingSchedule from './pages/TrainingSchedule';
import Voucher from './pages/Voucher';
import Support from './pages/Support';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import PWAPrompt from './components/PWAPrompt';
import { dbService } from './services/firebase';

export interface Subscription {
  name: string;
  months: number;
  expireDate: number | null;
  startDate: number;
  price: number;
  status: 'Pending' | 'Active' | 'Expired' | 'Rejected';
}

export interface Notification {
  id: string;
  text: string;
  date: number;
  read: boolean;
}

export interface ChatMessage {
  sender: 'user' | 'admin';
  text: string;
  timestamp: number;
}

export interface UserProfile {
  phone: string;
  name?: string; 
  avatar: string | null;
  subscription: Subscription | null;
  isLocked: boolean;
  notifications: Notification[];
  messages: ChatMessage[]; 
  trainingDays: string[]; 
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
  type: string;
  color: string;
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
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([
    { id: '1', title: 'Giảm 20% Gói Gym 3 tháng', code: 'SIPGYM20', type: 'Gym', color: 'bg-blue-500' },
    { id: '2', title: 'Tặng 1 buổi PT miễn phí', code: 'FREEPT', type: 'Gift', color: 'bg-green-500' }
  ]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for async DB
  const location = useLocation();

  const isAdminPath = location.pathname.startsWith('/admin');

  // Load & Subscribe Data
  useEffect(() => {
    // FIX LOADING STUCK: Tự động tắt loading sau 1.5s bất kể Firebase có kết nối được hay không
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 1500);

    // 1. Users
    dbService.subscribe('users', (data: any) => {
      // CRITICAL FIX: Convert Firebase Object/Map to Array & Ensure sub-arrays exist
      const rawList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      const sanitizedUsers: UserProfile[] = rawList.map((u: any) => ({
        ...u,
        notifications: Array.isArray(u.notifications) ? u.notifications : (u.notifications ? Object.values(u.notifications) : []),
        messages: Array.isArray(u.messages) ? u.messages : (u.messages ? Object.values(u.messages) : []),
        trainingDays: Array.isArray(u.trainingDays) ? u.trainingDays : (u.trainingDays ? Object.values(u.trainingDays) : [])
      }));

      setAllUsers(sanitizedUsers);
      
      // Update current user realtime
      const loggedPhone = localStorage.getItem('sip_gym_logged_phone');
      if (loggedPhone) {
        const user = sanitizedUsers.find(u => u.phone === loggedPhone);
        if (user) setCurrentUser(user);
      }
      setIsLoading(false);
    });

    // 2. Promotions
    dbService.subscribe('promos', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (list.length > 0) setPromotions(list as Promotion[]);
    });

    // 3. Vouchers
    dbService.subscribe('vouchers', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (list.length > 0) setVouchers(list as VoucherItem[]);
    });

    // 4. Trainers
    dbService.subscribe('trainers', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (list.length > 0) setTrainers(list as Trainer[]);
    });

    // 5. Programs
    dbService.subscribe('programs', (data: any) => {
      const list = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      if (list.length > 0) setPrograms(list as TrainingProgram[]);
    });

    return () => clearTimeout(timer);
  }, []);

  // Write Functions
  const syncDB = (newUsers: UserProfile[]) => {
    setAllUsers(newUsers); // Optimistic UI update
    dbService.saveAll('users', newUsers);
  };

  const syncVouchers = (newVouchers: VoucherItem[]) => {
    setVouchers(newVouchers);
    dbService.saveAll('vouchers', newVouchers);
  };

  const syncPromos = (newPromos: Promotion[]) => {
    setPromotions(newPromos);
    dbService.saveAll('promos', newPromos);
  };
  
  const syncTrainers = (newTrainers: Trainer[]) => {
    setTrainers(newTrainers);
    dbService.saveAll('trainers', newTrainers);
  };

  const handleLogin = (phone: string) => {
    let users = [...allUsers];
    let user = users.find(u => u.phone === phone);
    if (!user) {
      user = { 
        phone, 
        name: `Member ${phone.slice(-4)}`,
        avatar: null, 
        subscription: null, 
        isLocked: false, 
        notifications: [], 
        messages: [],
        trainingDays: [] 
      };
      users.push(user);
    }
    
    if (user.isLocked) {
      alert("Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ Admin.");
      return;
    }

    localStorage.setItem('sip_gym_logged_phone', phone);
    setCurrentUser(user);
    syncDB(users);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('sip_gym_logged_phone');
    setCurrentUser(null);
  };

  const handleUpdateSubscription = (packageName: string, months: number, price: number) => {
    if (!currentUser) return;

    const newSubscription: Subscription = {
      name: packageName,
      months: months,
      expireDate: null,
      startDate: Date.now(),
      price: price,
      status: 'Pending'
    };

    const newUsers = allUsers.map(u => {
      if (u.phone === currentUser.phone) {
        return { ...u, subscription: newSubscription };
      }
      return u;
    });
    syncDB(newUsers);
  };

  if (isLoading && dbService.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      <PWAPrompt />
      
      <div className={`flex-1 overflow-y-auto no-scrollbar ${isAdminPath ? 'bg-[#0B0F1A]' : 'bg-[#F8FAFC]'}`}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                user={currentUser} 
                promotions={promotions}
                trainers={trainers}
                programs={programs}
                onOpenAuth={() => setIsAuthModalOpen(true)} 
                onLogout={handleLogout}
                onUpdateUser={syncDB}
                onUpdateSubscription={handleUpdateSubscription}
                allUsers={allUsers}
              />
            } 
          />
          <Route path="/schedule" element={<TrainingSchedule user={currentUser} allUsers={allUsers} onUpdateUser={syncDB} />} />
          <Route path="/voucher" element={<Voucher vouchers={vouchers} />} />
          <Route path="/support" element={<Support user={currentUser} allUsers={allUsers} onUpdateUser={syncDB} />} />
          <Route path="/profile" element={<Profile user={currentUser} onUpdateSubscription={handleUpdateSubscription} onUpdateUser={syncDB} allUsers={allUsers} />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminDashboard 
                allUsers={allUsers} 
                setAllUsers={syncDB} 
                promotions={promotions} 
                setPromos={syncPromos}
                vouchers={vouchers}
                setVouchers={syncVouchers}
                trainers={trainers} 
                setTrainers={syncTrainers}
                programs={programs} 
                setPrograms={(p) => {}} 
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {!isAdminPath && <div className="h-28"></div>}
      </div>
      {!isAdminPath && <BottomNav />}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} />
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
