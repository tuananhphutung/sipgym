
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Star, Dumbbell, User, History } from 'lucide-react';

const BottomNav: React.FC = () => {
  const tabs = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/member', label: 'Thành viên', icon: Star },
    { path: '/training', label: 'Tập luyện', icon: Dumbbell },
    { path: '/inbody', label: 'Inbody', icon: User },
    { path: '/history', label: 'Lịch sử', icon: History }
  ];

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center pt-2 pb-6 px-2 z-50 rounded-t-[30px] shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 flex-1 transition-all duration-300 relative
            ${isActive ? 'text-[#00AEEF]' : 'text-gray-400'}
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute -top-2 w-10 h-1 bg-[#00AEEF] rounded-full"></div>}
              <tab.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
