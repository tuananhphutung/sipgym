
import React, { useState } from 'react';
import { X, CheckCircle2, MapPin, Navigation, Dumbbell, Flower2, Zap } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSubscription: (packageName: string, months: number) => void;
}

type Step = 'selection' | 'success' | 'branch_info';

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpdateSubscription }) => {
  const [step, setStep] = useState<Step>('selection');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<{label: string, months: number} | null>(null);

  if (!isOpen) return null;

  const packages = [
    { id: 'Gym', name: 'Gói Gym', icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'Yoga', name: 'Gói Yoga', icon: Flower2, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'Aerobic', name: 'Gói Aerobic', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const durations = [
    { label: '1 tháng', months: 1 },
    { label: '3 tháng', months: 3 },
    { label: '6 tháng', months: 6 },
    { label: '1 năm', months: 12 }
  ];

  const handleConfirm = () => {
    if (selectedPackage && selectedDuration) {
      onUpdateSubscription(selectedPackage, selectedDuration.months);
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
              <div className="grid grid-cols-1 gap-3">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all ${
                      selectedPackage === pkg.id 
                      ? 'border-[#00AEEF] bg-blue-50/50' 
                      : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 ${pkg.bg} rounded-2xl flex items-center justify-center ${pkg.color}`}>
                      <pkg.icon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-gray-700 text-lg">{pkg.name}</span>
                    {selectedPackage === pkg.id && <CheckCircle2 className="ml-auto w-6 h-6 text-[#00AEEF]" />}
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
                        className={`py-3 rounded-2xl font-bold transition-all border-2 ${
                          selectedDuration?.label === duration.label
                          ? 'bg-[#00AEEF] border-[#00AEEF] text-white shadow-lg shadow-blue-100'
                          : 'bg-white border-gray-100 text-gray-500'
                        }`}
                      >
                        {duration.label}
                      </button>
                    ))}
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
