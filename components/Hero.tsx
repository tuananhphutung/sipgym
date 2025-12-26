
import React from 'react';
import { UserPlus } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative pt-2 pb-6 overflow-hidden">
      <div className="px-6 relative z-10 flex flex-col">
        {/* Logo in top left of hero */}
        <div className="mb-4">
            <img 
              src="https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png" 
              alt="Sip Gym Nhà Bè" 
              className="h-14 object-contain"
            />
        </div>

        {/* Hero Text Styling */}
        <div className="relative">
          <h1 className="text-[#00A5E0] font-[900] text-5xl leading-[0.9] tracking-tighter uppercase italic">
            CÂU LẠC<br />BỘ<br />GYM
          </h1>
          <div className="inline-block mt-4 bg-[#8DBF44] text-white text-[11px] px-4 py-1.5 rounded-full font-black uppercase tracking-wider">
            GYM CHO MỌI NGƯỜI
          </div>
        </div>
      </div>

      {/* Decorative Hero Image with Mask */}
      <div className="absolute top-[20px] right-[-20px] w-[260px] h-[350px] z-0 pwa-hide">
        <div className="relative w-full h-full">
           {/* The large circular image container */}
           <div className="absolute inset-0 rounded-bl-[140px] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600" 
                alt="Gym Training" 
                className="w-full h-full object-cover grayscale-[0.2]"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-white/10 to-transparent"></div>
           </div>
           
           {/* Trainer circular highlight */}
           <div className="absolute top-[30%] left-[-20%] w-40 h-40 bg-white p-1 rounded-full shadow-2xl z-20">
              <img 
                src="https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?auto=format&fit=crop&q=80&w=400" 
                className="w-full h-full object-cover rounded-full"
                alt="trainer"
              />
           </div>
        </div>
      </div>

      <div className="flex justify-center mt-12 relative z-10">
        <button className="flex items-center gap-2 bg-[#E9F3F8] text-[#00AEEF] font-bold px-8 py-3 rounded-full shadow-sm text-sm border border-white/50">
          <UserPlus className="w-4 h-4" />
          Giới thiệu bạn
        </button>
      </div>
    </div>
  );
};

export default Hero;
