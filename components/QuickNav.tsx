
import React from 'react';
import { Star, Accessibility, Calendar } from 'lucide-react';

const QuickNav: React.FC = () => {
  const items = [
    { label: 'Thành viên', icon: Star, color: 'text-white', bg: 'bg-[#00AEEF]' },
    { label: 'Huấn Luyện Viên', icon: Accessibility, color: 'text-[#00AEEF]', bg: 'bg-white' },
    { label: 'Lớp học', icon: Calendar, color: 'text-white', bg: 'bg-[#00AEEF]' }
  ];

  return (
    <div className="grid grid-cols-3 gap-3 px-5 mt-8">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center gap-2">
          <div className="w-full aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center group active:scale-95 transition-transform">
            {/* Fix: Changed item.idx to idx as the item object does not have an idx property; using the map index instead. */}
            <div className={`p-2 rounded-full ${idx === 1 ? 'bg-[#00AEEF]/10' : ''}`}>
               <item.icon className={`w-8 h-8 ${idx === 1 ? 'text-[#00AEEF]' : (idx === 0 ? 'text-[#FFD700]' : 'text-[#00AEEF]')}`} fill={idx === 0 ? 'currentColor' : (idx === 2 ? 'currentColor' : 'none')} />
            </div>
            {idx === 0 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-12 h-12 bg-[#00AEEF] rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white fill-white" />
                 </div>
            </div>}
            {idx === 1 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Accessibility className="w-6 h-6 text-[#00AEEF]" />
                 </div>
            </div>}
            {idx === 2 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-12 h-12 bg-[#00AEEF] rounded-full flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white fill-white" />
                 </div>
            </div>}
          </div>
          <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight whitespace-nowrap">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default QuickNav;
