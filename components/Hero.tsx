
import React from 'react';
import { UserPlus } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative pt-4 overflow-hidden">
      {/* Background Graphic elements could be added here */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 right-4 w-12 h-12 bg-black rounded-full rotate-45 transform skew-x-12 opacity-30"></div>
      </div>

      <div className="px-6 relative z-10">
        {/* Brand Logo */}
        <div className="mb-2">
            <img 
              src="https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png" 
              alt="Sip Gym Nhà Bè" 
              className="h-14 object-contain"
            />
        </div>

        {/* Big Text */}
        <div className="mt-4">
          <h1 className="text-[#00A5E0] font-[900] text-5xl leading-tight tracking-tighter uppercase italic">
            The<br />New<br />Me
          </h1>
          <div className="inline-block mt-2 bg-[#8DBF44] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Gym cho mọi người
          </div>
        </div>
      </div>

      {/* Hero Image - Placed to overlap background */}
      <div className="absolute top-[30px] right-[-40px] w-[280px] z-0 pointer-events-none">
        <img 
          src="https://picsum.photos/seed/gymgirl/500/600" 
          alt="Athlete" 
          className="w-full h-full object-cover rounded-bl-[120px] mix-blend-multiply opacity-90"
          style={{ maskImage: 'linear-gradient(to left, black 60%, transparent 100%)' }}
        />
        {/* In the real app this would be a high-quality cutout PNG */}
        <div className="absolute top-[20%] right-[30%] w-full h-full flex items-center justify-center">
             <img 
                src="https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?auto=format&fit=crop&q=80&w=400" 
                className="w-full h-full object-cover scale-150 rounded-full"
                alt="trainer"
             />
        </div>
      </div>

      <div className="flex justify-center mt-10 relative z-10">
        <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-100 text-[#00A5E0] font-bold px-6 py-2.5 rounded-full shadow-lg text-sm">
          <UserPlus className="w-4 h-4" />
          Giới thiệu bạn
        </button>
      </div>
    </div>
  );
};

export default Hero;
