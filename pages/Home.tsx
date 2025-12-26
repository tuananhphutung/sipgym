
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ActionCard from '../components/ActionCard';
import QuickNav from '../components/QuickNav';
import TutorialSection from '../components/TutorialSection';
import { UserProfile, Promotion, Trainer, TrainingProgram } from '../App';

interface HomeProps {
  user: UserProfile | null;
  promotions: Promotion[];
  trainers: Trainer[];
  programs: TrainingProgram[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onUpdateSubscription: (packageName: string, months: number, price: number) => void;
  onUpdateUser: (users: UserProfile[]) => void;
  allUsers: UserProfile[];
}

const Home: React.FC<HomeProps> = ({ 
  user, promotions, trainers, programs, 
  onOpenAuth, onLogout, onUpdateSubscription, onUpdateUser, allUsers 
}) => {
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-500 relative">
      <Header user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} allUsers={allUsers} />
      <Hero />
      
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
      <QuickNav trainers={trainers} />
      <TutorialSection programs={programs} />
      <div className="h-10"></div>
    </div>
  );
};

export default Home;
