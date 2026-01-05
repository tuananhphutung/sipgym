
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ActionCard from '../components/ActionCard';
import QuickNav from '../components/QuickNav';
import PTPackageSection from '../components/PTPackageSection';
import WeatherWidget from '../components/WeatherWidget';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { UserProfile, Promotion, Trainer, TrainingProgram, PackageItem, PTPackage, VoucherItem, Booking } from '../App';

interface HomeProps {
  user: UserProfile | null;
  promotions: Promotion[];
  trainers: Trainer[];
  programs: TrainingProgram[];
  packages: PackageItem[];
  ptPackages: PTPackage[]; 
  vouchers: VoucherItem[]; 
  heroImage?: string; 
  heroTitle?: string;
  heroSubtitle?: string;
  heroOverlayText?: string;
  heroOverlaySub?: string;
  onOpenAuth: () => void;
  onLogout: () => void;
  onUpdateSubscription: (packageName: string, months: number, price: number, voucherCode?: string) => void;
  onUpdateUser: (users: UserProfile[]) => void;
  onRegisterPT: (pkg: PTPackage, paidAmount: number, voucherCode?: string) => void;
  allUsers: UserProfile[];
  bookings?: Booking[];
  onUpdateBookings?: (bookings: Booking[]) => void;
}

const Home: React.FC<HomeProps> = ({ 
  user, promotions, trainers, programs, packages, ptPackages, vouchers, 
  heroImage, heroTitle, heroSubtitle, heroOverlayText, heroOverlaySub,
  onOpenAuth, onLogout, onUpdateSubscription, onUpdateUser, onRegisterPT, allUsers,
  bookings, onUpdateBookings
}) => {
  const navigate = useNavigate();

  // Handle Share / Referral
  const handleShare = () => {
     if (navigator.share) {
        navigator.share({
           title: 'Sip Gym Nhà Bè',
           text: 'Tham gia Sip Gym Nhà Bè ngay để nhận ưu đãi!',
           url: 'https://sipgymnhabe.phkglobal.com'
        }).catch(console.error);
     } else {
        alert("Copy link giới thiệu: https://sipgymnhabe.phkglobal.com");
     }
  };

  return (
    <div className="animate-in fade-in duration-500 relative pb-10">
      <Header user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} allUsers={allUsers} />
      
      {/* Weather Widget Section - Compact */}
      <div className="px-6 mt-1 mb-2">
         <WeatherWidget />
      </div>

      <Hero 
        image={heroImage} 
        title={heroTitle} 
        subtitle={heroSubtitle}
        overlayText={heroOverlayText}
        overlaySub={heroOverlaySub}
      />
      
      {/* Referral Button Block */}
      <div className="px-6 mt-4">
         <button 
           onClick={handleShare}
           className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-between group active:scale-95 transition-all duration-200 hover:shadow-xl hover:brightness-110"
         >
            <div className="flex items-center gap-3">
               <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <UserPlus className="w-5 h-5 text-white" />
               </div>
               <div className="text-left">
                  <p className="font-black text-sm uppercase italic">Giới thiệu bạn bè</p>
                  <p className="text-[10px] font-medium opacity-90">Nhận ngay ưu đãi giảm giá</p>
               </div>
            </div>
            <span className="text-xs font-black bg-white text-blue-500 px-3 py-1 rounded-lg shadow-sm group-hover:bg-blue-50 transition-colors">Mời Ngay</span>
         </button>
      </div>

      {promotions.length > 0 && (
        <div className="px-5 mt-6 overflow-x-auto no-scrollbar flex gap-4 pb-2">
           {promotions.map(promo => (
             <div key={promo.id} className="min-w-[280px] h-32 bg-orange-600 rounded-[32px] relative overflow-hidden shadow-lg shadow-orange-100 shrink-0 transform transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer">
                <img src={promo.image} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="promo" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                   <p className="text-white font-black uppercase text-sm italic drop-shadow-md">{promo.title}</p>
                   <span className="text-white/80 text-[8px] font-bold">SIP GYM • ƯU ĐÃI</span>
                </div>
             </div>
           ))}
        </div>
      )}

      <ActionCard 
        isLoggedIn={!!user} 
        onOpenAuth={onOpenAuth} 
        subscription={user?.subscription || null}
        onUpdateSubscription={onUpdateSubscription}
        packages={packages}
        user={user}
      />
      <QuickNav 
         trainers={trainers} 
         user={user}
         bookings={bookings}
         onUpdateBookings={onUpdateBookings}
         onOpenAuth={onOpenAuth}
      />
      
      <PTPackageSection 
        ptPackages={ptPackages} 
        user={user}
        onRegisterPT={onRegisterPT}
        onOpenAuth={onOpenAuth}
      />
      
      {/* Temporary Admin Login Button */}
      <div className="px-6 mt-8 flex justify-center">
         <button 
           onClick={() => navigate('/admin')}
           className="bg-gray-100 text-gray-400 p-2 rounded-full flex items-center gap-2 hover:bg-gray-200 hover:text-gray-600 transition-all active:scale-90"
           title="Admin Login"
         >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">Admin</span>
         </button>
      </div>

      <div className="h-10"></div>
    </div>
  );
};

export default Home;
