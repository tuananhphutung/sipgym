
import React from 'react';

interface HeroProps {
  image?: string;
  title?: string;
  subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({ image, title, subtitle }) => {
  const bgImage = image || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600";
  const mainTitle = title || "CÂU LẠC\nBỘ\nGYM";
  const sub = subtitle || "GYM CHO MỌI NGƯỜI";

  return (
    <div className="relative pt-2 pb-6">
      {/* App Title / Header Area - Moved slightly to overlap/integrate with Hero */}
      <div className="px-6 flex flex-col items-center sm:items-start mb-4">
        {/* Logo */}
        <div className="mb-2 w-full flex justify-center sm:justify-start">
            <div className="relative w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center p-2 border-4 border-[#FF6B00]/20 animate-in zoom-in duration-700">
               <img 
                src="https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png" 
                alt="Sip Gym Nhà Bè" 
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
        </div>

        {/* Text */}
        <div className="relative w-full text-center sm:text-left">
          <h1 className="text-[#FF6B00] font-[900] text-4xl leading-[0.9] tracking-tighter uppercase italic drop-shadow-sm whitespace-pre-line">
            {mainTitle}
          </h1>
          <div className="inline-block mt-2 bg-[#2ECC71] text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-wider shadow-md">
            {sub}
          </div>
        </div>
      </div>

      {/* Full Square Hero Image Optimized for App */}
      <div className="w-full aspect-square relative rounded-b-[40px] overflow-hidden shadow-2xl shadow-orange-100/50 mt-2">
         <img 
            src={bgImage} 
            alt="Hero Banner" 
            className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
         
         <div className="absolute bottom-6 left-6 text-white">
            <p className="font-black text-xl uppercase italic drop-shadow-lg">Thay đổi bản thân</p>
            <p className="text-xs font-medium opacity-90">Tại Sip Gym Nhà Bè</p>
         </div>
      </div>
    </div>
  );
};

export default Hero;
