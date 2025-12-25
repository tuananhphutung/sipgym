
import React, { useState } from 'react';
import { DoorOpen, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';
import { Subscription } from '../App';

interface ActionCardProps {
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  subscription: Subscription | null;
  onUpdateSubscription: (packageName: string, months: number) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ isLoggedIn, onOpenAuth, subscription, onUpdateSubscription }) => {
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  return (
    <>
      <div className="px-5 mt-6 relative z-20">
        <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-blue-100 text-center border border-blue-50/50">
          {isLoggedIn ? (
            <>
              {!subscription && (
                <div className="mb-4 flex items-center justify-center gap-2 text-orange-500 bg-orange-50 py-2 px-4 rounded-full animate-pulse border border-orange-100">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-tight">Vui lòng đăng ký gói tập</span>
                </div>
              )}

              {subscription?.status === 'Pending' && (
                <div className="mb-4 flex items-center justify-center gap-2 text-blue-500 bg-blue-50 py-2 px-4 rounded-full border border-blue-100">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span className="text-[11px] font-bold uppercase tracking-tight">Đang chờ Admin duyệt gói...</span>
                </div>
              )}
              
              <div className="flex justify-center mb-4">
                <div className={subscription?.status === 'Active' ? "bg-green-100 p-2 rounded-full" : "bg-gray-100 p-2 rounded-full"}>
                  <CheckCircle className={`w-8 h-8 ${subscription?.status === 'Active' ? 'text-green-500' : 'text-gray-300'}`} />
                </div>
              </div>
              
              <h2 className="text-[#4A5568] text-xl font-black leading-tight">
                {subscription?.status === 'Active' ? 'Sẵn sàng tập luyện!' : 'Bắt đầu hành trình'}<br />Hôm nay bạn tập gì?
              </h2>
              
              <button 
                onClick={() => setIsSubModalOpen(true)}
                className="mt-6 w-full bg-[#8DBF44] hover:bg-[#7ba83c] active:scale-[0.98] transition-all text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-green-100"
              >
                {subscription?.status === 'Pending' ? 'Đổi Gói Đăng Ký' : 'Bắt đầu ngay'}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-[#4A5568] text-xl font-bold leading-tight">
                Tham gia Sip Gym Nhà Bè<br />Ngay hôm nay!
              </h2>
              <p className="mt-2 text-xs text-gray-400 font-medium">Chỉ cần số điện thoại, không cần đăng ký!</p>
              
              <button 
                onClick={onOpenAuth}
                className="mt-6 w-full bg-[#00AEEF] hover:bg-[#0096cc] active:scale-[0.98] transition-all text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-blue-200"
              >
                <DoorOpen className="w-5 h-5" />
                Đăng nhập / Tham gia
              </button>
            </>
          )}
        </div>
      </div>

      <SubscriptionModal 
        isOpen={isSubModalOpen} 
        onClose={() => setIsSubModalOpen(false)} 
        onUpdateSubscription={onUpdateSubscription}
      />
    </>
  );
};

export default ActionCard;
