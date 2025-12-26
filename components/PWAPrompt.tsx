
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PWAPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const logoUrl = "https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png";

  useEffect(() => {
    // Check if already installed or dismissed
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (!isDismissed && !isStandalone) {
      // Show prompt after a short delay
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = () => {
    alert("Để cài đặt Sip Gym: \n1. Nhấn nút 'Chia sẻ' (iOS) hoặc 'Menu 3 chấm' (Android)\n2. Chọn 'Thêm vào màn hình chính' (Add to Home Screen)");
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[200] animate-in slide-in-from-top-10 duration-500">
      <div className="bg-white/95 backdrop-blur-xl border border-blue-100 rounded-[28px] p-4 shadow-2xl flex items-center gap-4">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-gray-50 p-1">
          <img 
            src={logoUrl} 
            className="w-full h-full object-contain" 
            alt="logo"
            onError={(e) => { (e.target as any).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=sipgym' }}
          />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-black text-gray-800 leading-tight uppercase italic">Cài đặt Sip Gym</p>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Ứng dụng Câu Lạc Bộ Gym Nhà Bè</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={handleInstall}
            className="bg-[#00AEEF] text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-md shadow-blue-100 active:scale-95 transition-all"
           >
             Cài đặt
           </button>
           <button onClick={handleDismiss} className="p-2 text-gray-300 hover:text-gray-500">
             <X className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default PWAPrompt;
