
import React from 'react';

const TutorialSection: React.FC = () => {
  return (
    <div className="mt-8 px-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#4A5568] text-xl font-extrabold">Hướng Dẫn Tập Luyện</h3>
        <button className="text-[#00AEEF] text-sm font-semibold">Xem tất cả</button>
      </div>
      
      <div className="relative rounded-3xl overflow-hidden shadow-lg h-48 group">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" 
          alt="Training Tutorial" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-5">
          <p className="text-white font-bold text-lg">Khởi động đúng cách trước khi tập</p>
          <p className="text-white/80 text-xs mt-1">Sip Gym Nhà Bè • 5 phút</p>
        </div>
      </div>
    </div>
  );
};

export default TutorialSection;
