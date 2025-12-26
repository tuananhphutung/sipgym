
import React, { useState } from 'react';
import { DoorOpen, CheckCircle, AlertCircle, Clock, Dumbbell } from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';
import { Subscription } from '../App';

interface ActionCardProps {
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  subscription: Subscription | null;
  onUpdateSubscription: (packageName: string, months: number, price: number) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ isLoggedIn, onOpenAuth, subscription, onUpdateSubscription }) => {
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  return (
    <>
      <div className="px-6 mt-4 relative z-20">
        <div className="bg-white rounded-[45px] p-10 shadow-[0_20px_50px_rgba(0,174,239,0.08)] text-center border border-gray-50">
          {isLoggedIn ? (
            <>
              {!subscription && (
                <div className="mb-4 flex items-center justify-center gap-2 text-orange-500 bg-orange-50 py-2 px-4 rounded-full border border-orange-100">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase">Vui lòng chọn gói tập</span>
                </div>
              )}

              {subscription?.status === 'Pending' && (
                <div className="mb-4 flex items-center justify-center gap-2 text-blue-500 bg-blue-50 py-2 px-4 rounded-full">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span className="text-[11px] font-bold uppercase">Đang chờ xác nhận...</span>
                </div>
              )}
              
              <h2 className="text-[#333] text-2xl font-black leading-tight mb-2">
                {subscription?.status === 'Active' 
                  ? `Hội viên ${subscription.name}` 
                  : 'Bắt đầu hành trình'}
              </h2>
              <p className="text-sm text-gray-400 font-medium">Bạn đã sẵn sàng để bứt phá hôm nay chưa?</p>
              
              <button 
                onClick={() => setIsSubModalOpen(true)}
                disabled={subscription?.status === 'Pending'}
                className={`mt-8 w-full transition-all text-white py-5 rounded-[25px] flex items-center justify-center gap-3 font-black text-xl shadow-xl uppercase tracking-tighter
                  ${subscription?.status === 'Active' 
                    ? 'bg-green-500 hover:bg-green-600 shadow-green-200' 
                    : subscription?.status === 'Pending'
                      ? 'bg-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-[#00AEEF] hover:bg-[#0096cc] active:scale-95 shadow-blue-200'
                  }`}
              >
                {subscription?.status === 'Active' ? (
                  <>
                    <Dumbbell className="w-6 h-6" />
                    {subscription.name} (Đã Duyệt)
                  </>
                ) : subscription?.status === 'Pending' ? (
                  'Đang Chờ Duyệt...'
                ) : (
                  'Đăng Ký Ngay'
                )}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-[#444] text-2xl font-black leading-tight tracking-tight">
                Tham gia Sip Gym Nhà Bè<br />Ngay hôm nay!
              </h2>
              <p className="mt-3 text-[13px] text-gray-400 font-bold opacity-80 uppercase tracking-tighter">
                Chỉ cần số điện thoại, không cần đăng ký!
              </p>
              
              <button 
                onClick={onOpenAuth}
                className="mt-8 w-full bg-[#00AEEF] hover:bg-[#0096cc] active:scale-95 transition-all text-white py-5 rounded-[25px] flex items-center justify-center gap-3 font-black text-xl shadow-xl shadow-blue-100 uppercase tracking-tighter"
              >
                <DoorOpen className="w-6 h-6" />
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
