
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ActionCard from '../components/ActionCard';
import QuickNav from '../components/QuickNav';
import TutorialSection from '../components/TutorialSection';
import { UserProfile, Promotion } from '../App';

interface HomeProps {
  user: UserProfile | null;
  promotions: Promotion[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onUpdateSubscription: (packageName: string, months: number) => void;
}

const Home: React.FC<HomeProps> = ({ user, promotions, onOpenAuth, onLogout, onUpdateSubscription }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <Header user={user} onLogout={onLogout} />
      <Hero />
      
      {/* Promotion Banners from Admin */}
      {promotions.length > 0 && (
        <div className="px-5 mt-4 overflow-x-auto no-scrollbar flex gap-4 pb-2">
           {promotions.map(promo => (
             <div key={promo.id} className="min-w-[280px] h-32 bg-blue-600 rounded-[32px] relative overflow-hidden shadow-lg shadow-blue-100 shrink-0">
                <img src={promo.image} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="promo" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                   <p className="text-white font-black uppercase text-sm italic">{promo.title}</p>
                   <span className="text-white/60 text-[8px] font-bold">SIP GYM • ƯU ĐÃI</span>
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
      />
      <QuickNav />
      <TutorialSection />
      <div className="h-10"></div>
    </div>
  );
};

export default Home;
