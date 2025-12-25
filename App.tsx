
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';

export interface Subscription {
  name: string;
  months: number;
  expireDate: number | null;
  status: 'Pending' | 'Active' | 'Expired' | 'Rejected';
}

export interface UserProfile {
  phone: string;
  avatar: string | null;
  subscription: Subscription | null;
  isLocked: boolean;
  notifications: { id: string; text: string; date: number; read: boolean }[];
}

export interface Promotion {
  id: string;
  title: string;
  image: string;
  date: number;
}

const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load data from central localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('sip_gym_users_db');
    const savedPromos = localStorage.getItem('sip_gym_promos_db');
    
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      setAllUsers(users);
      
      const loggedPhone = localStorage.getItem('sip_gym_logged_phone');
      if (loggedPhone) {
        const user = users.find((u: UserProfile) => u.phone === loggedPhone);
        if (user) setCurrentUser(user);
      }
    }

    if (savedPromos) setPromotions(JSON.parse(savedPromos));
  }, []);

  const syncDB = (newUsers: UserProfile[]) => {
    setAllUsers(newUsers);
    localStorage.setItem('sip_gym_users_db', JSON.stringify(newUsers));
    
    if (currentUser) {
      const updatedMe = newUsers.find(u => u.phone === currentUser.phone);
      if (updatedMe) setCurrentUser(updatedMe);
    }
  };

  const handleLogin = (phone: string) => {
    let users = [...allUsers];
    let user = users.find(u => u.phone === phone);
    
    if (!user) {
      user = { phone, avatar: null, subscription: null, isLocked: false, notifications: [] };
      users.push(user);
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

  const updateSubscriptionRequest = (packageName: string, months: number) => {
    if (!currentUser) return;
    const users = allUsers.map(u => {
      if (u.phone === currentUser.phone) {
        return {
          ...u,
          subscription: { name: packageName, months, expireDate: null, status: 'Pending' as const }
        };
      }
      return u;
    });
    syncDB(users);
  };

  const addPromotion = (promo: Promotion) => {
    const newPromos = [promo, ...promotions];
    setPromotions(newPromos);
    localStorage.setItem('sip_gym_promos_db', JSON.stringify(newPromos));
    
    // Auto notify all users
    const users = allUsers.map(u => ({
      ...u,
      notifications: [{ id: Math.random().toString(), text: `Khuyến mãi mới: ${promo.title}`, date: Date.now(), read: false }, ...u.notifications]
    }));
    syncDB(users);
  };

  return (
    <Router>
      <div className="flex justify-center min-h-screen bg-gray-200">
        <div className="relative w-full max-w-[430px] bg-[#F7FAFC] shadow-2xl min-h-screen flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            <Routes>
              <Route 
                path="/" 
                element={
                  currentUser?.isLocked ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[80vh]">
                       <div className="bg-red-100 p-4 rounded-full mb-4"><span className="text-4xl">🔒</span></div>
                       <h2 className="text-xl font-black text-gray-800 mb-2">TÀI KHOẢN BỊ KHÓA</h2>
                       <p className="text-gray-500 font-medium">Tài khoản của bạn bị khóa vui lòng liên hệ admin để mở lại.</p>
                       <button onClick={handleLogout} className="mt-6 text-blue-500 font-bold underline">Thoát</button>
                    </div>
                  ) : (
                    <Home 
                      user={currentUser} 
                      promotions={promotions}
                      onOpenAuth={() => setIsAuthModalOpen(true)} 
                      onLogout={handleLogout}
                      onUpdateSubscription={updateSubscriptionRequest}
                    />
                  )
                } 
              />
              <Route path="/profile" element={<Profile user={currentUser} onUpdateSubscription={updateSubscriptionRequest} />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard allUsers={allUsers} setAllUsers={syncDB} promotions={promotions} onAddPromo={addPromotion} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <BottomNav />
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} />
        </div>
      </div>
    </Router>
  );
};

export default App;
