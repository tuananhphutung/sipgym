
import React, { useState } from 'react';
import { X, CheckCircle2, MapPin, Navigation, Dumbbell } from 'lucide-react';
import { PackageItem } from '../App';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSubscription: (packageName: string, months: number, price: number) => void;
  packages: PackageItem[];
  referralDiscount?: number; // 0.1 (10%) or 0.05 (5%)
  discountReason?: string; // "Ưu đãi giới thiệu"
}

type Step = 'selection' | 'success' | 'branch_info';

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, onClose, onUpdateSubscription, packages, referralDiscount = 0, discountReason 
}) => {
  const [step, setStep] = useState<Step>('selection');
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<{label: string, months: number, discount: number} | null>(null);

  if (!isOpen) return null;

  const durations = [
    { label: '1 tháng', months: 1, discount: 0 },
    { label: '3 tháng', months: 3, discount: 0.1 }, // Giảm 10%
    { label: '6 tháng', months: 6, discount: 0.15 }, // Giảm 15%
    { label: '1 năm', months: 12, discount: 0.25 }   // Giảm 25%
  ];

  const handleConfirm = () => {
    if (selectedPackage && selectedDuration) {
        // Tính tiền: Giá gốc * số tháng * (1 - chiết khấu thời hạn) * (1 - chiết khấu giới thiệu)
        const basePriceTotal = selectedPackage.price * selectedDuration.months;
        const durationDiscounted = basePriceTotal * (1 - selectedDuration.discount);
        const finalPrice = durationDiscounted * (1 - referralDiscount);
        
        onUpdateSubscription(selectedPackage.name, selectedDuration.months, Math.round(finalPrice));
        setStep('success');
    }
  };

  const openGoogleMaps = () => {
    window.open('https://www.google.com/maps/dir/?api=1&destination=2581/26+Huỳnh+Tấn+Phát,+Ấp+4+xã+Phú+Xuân,+huyện+Nhà+Bè,+Ho+Chi+Minh+City', '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-20">
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <h2 className="text-xl font-black text-gray-800 uppercase italic tracking-tight">
            {step === 'selection' && 'Chọn Gói Tập'}
            {step === 'success' && 'Hoàn Tất'}
            {step === 'branch_info' && 'Địa Chỉ Sip Gym'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-6">
          {step === 'selection' && (
            <div className="space-y-6">
              {/* Promotion Banner if Referral Exists */}
              {referralDiscount > 0 && (
                 <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl p-4 text-white shadow-lg">
                    <p className="font-black text-sm uppercase mb-1">🎉 {discountReason || "Ưu đãi đặc biệt"}</p>
                    <p className="text-xs font-bold opacity-90">Bạn được giảm thêm {(referralDiscount * 100)}% cho lần đăng ký này!</p>
                 </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative overflow-hidden flex items-center gap-4 p-3 rounded-3xl border-2 transition-all group ${
                      selectedPackage?.id === pkg.id 
                      ? 'border-[#00AEEF] bg-blue-50/50' 
                      : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                      <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left flex-1 relative z-10">
                       <div className="font-bold text-gray-700 text-lg">{pkg.name}</div>
                       <div className="text-xs font-bold text-gray-400">{pkg.price.toLocaleString()}đ / tháng</div>
                    </div>
                    {selectedPackage?.id === pkg.id && <CheckCircle2 className="ml-auto w-6 h-6 text-[#00AEEF]" />}
                  </button>
                ))}
              </div>

              {selectedPackage && (
                <div className="animate-in fade-in slide-in-from-top-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Thời gian tập luyện</p>
                  <div className="grid grid-cols-2 gap-2">
                    {durations.map((duration) => (
                      <button
                        key={duration.label}
                        onClick={() => setSelectedDuration(duration)}
                        className={`py-3 rounded-2xl font-bold transition-all border-2 flex flex-col items-center justify-center ${
                          selectedDuration?.label === duration.label
                          ? 'bg-[#00AEEF] border-[#00AEEF] text-white shadow-lg shadow-blue-100'
                          : 'bg-white border-gray-100 text-gray-500'
                        }`}
                      >
                        <span>{duration.label}</span>
                        {duration.discount > 0 && <span className="text-[9px] opacity-80">Giảm {duration.discount * 100}%</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Calculation Preview */}
              {selectedPackage && selectedDuration && (
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                       <span>Đơn giá:</span>
                       <span>{(selectedPackage.price * selectedDuration.months).toLocaleString()}đ</span>
                    </div>
                    {selectedDuration.discount > 0 && (
                        <div className="flex justify-between text-xs font-bold text-green-500 mb-1">
                           <span>Giảm theo thời hạn ({(selectedDuration.discount*100)}%):</span>
                           <span>-{(selectedPackage.price * selectedDuration.months * selectedDuration.discount).toLocaleString()}đ</span>
                        </div>
                    )}
                    {referralDiscount > 0 && (
                        <div className="flex justify-between text-xs font-bold text-pink-500 mb-1">
                           <span>Giảm giá giới thiệu ({(referralDiscount*100)}%):</span>
                           <span>-{(selectedPackage.price * selectedDuration.months * (1 - selectedDuration.discount) * referralDiscount).toLocaleString()}đ</span>
                        </div>
                    )}
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-lg font-black text-gray-800">
                       <span>Thành tiền:</span>
                       <span className="text-[#00AEEF]">
                         {Math.round(selectedPackage.price * selectedDuration.months * (1 - selectedDuration.discount) * (1 - referralDiscount)).toLocaleString()}đ
                       </span>
                    </div>
                 </div>
              )}

              <button
                disabled={!selectedPackage || !selectedDuration}
                onClick={handleConfirm}
                className="w-full bg-[#8DBF44] disabled:bg-gray-200 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-100 transition-all uppercase mt-4"
              >
                Xác Nhận Đăng Ký
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-800 leading-relaxed px-4">
                Chúc mừng bạn đã đăng ký thành công, bây giờ bạn hãy đến chi nhánh của Sip Gym Nhà bè để hoàn tất thủ tục đăng ký nhé
              </p>
              <button
                onClick={() => setStep('branch_info')}
                className="mt-8 w-full bg-[#00AEEF] text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 uppercase"
              >
                Đồng Ý (OK)
              </button>
            </div>
          )}

          {step === 'branch_info' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-10 h-10 bg-[#00AEEF] rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800">Sip Gym Nhà Bè</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">2581/26 Huỳnh Tấn Phát, Ấp 4 xã Phú Xuân, huyện Nhà Bè, Ho Chi Minh City</p>
                  </div>
                </div>
                
                <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-200">
                   <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.456686311855!2d106.741004!3d10.695333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31753063f2732941%3A0xc34857b165241b71!2zMjU4MS8yNiBIdXluaCBU4bqlbiBQaMOhdCwgUGjDuiBYdcOibiwgTmjDoCBCw6gsIEjhu5MgQ2jDrCBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1716300000000!5m2!1svi!2s" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy"
                   ></iframe>
                </div>

                <button
                  onClick={openGoogleMaps}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-white border-2 border-[#00AEEF] text-[#00AEEF] py-3 rounded-2xl font-bold transition-all hover:bg-blue-50"
                >
                  <Navigation className="w-4 h-4" />
                  Mở Google Maps dẫn đường
                </button>
              </div>

              <div className="text-center pb-4">
                 <p className="text-xs text-gray-400 font-medium italic">Hẹn gặp bạn sớm tại phòng tập!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
