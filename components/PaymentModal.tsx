
import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, Copy, Smartphone, Wallet, ArrowRight, CreditCard, Ticket, Check } from 'lucide-react';
import { PackageItem, PTPackage, VoucherItem } from '../App';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Type: 'gym' | 'pt'
  type: 'gym' | 'pt';
  packages?: PackageItem[]; // For Gym
  ptPackage?: PTPackage;    // For PT (Single selection passed in)
  
  vouchers: VoucherItem[];
  userReferralDiscount?: number; // 0.1 or 0.05
  userDiscountReason?: string;
  
  onConfirm: (data: any) => void; 
}

// Danh sách ngân hàng hỗ trợ Deep Link (Giả lập)
const BANKS = [
    { id: 'mb', name: 'MB Bank', color: 'bg-blue-600', scheme: 'mbmobile://', icon: 'https://img.vietqr.io/image/MB-123456789-compact.png?width=50' },
    { id: 'vcb', name: 'Vietcombank', color: 'bg-green-600', scheme: 'vietcombankmobile://', icon: 'https://img.vietqr.io/image/VCB-123456789-compact.png?width=50' },
    { id: 'tcb', name: 'Techcombank', color: 'bg-red-600', scheme: 'tcb://', icon: 'https://img.vietqr.io/image/TCB-123456789-compact.png?width=50' },
    { id: 'acb', name: 'ACB', color: 'bg-blue-500', scheme: 'acbapp://', icon: 'https://img.vietqr.io/image/ACB-123456789-compact.png?width=50' },
];

// QR Code Image (Placeholder link as user request)
const QR_IMAGE_URL = "https://phukienlimousine.vn/wp-content/uploads/2025/12/z6337821633527_5238255979c5950d2432822a16d863e4.jpg"; 

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, onClose, type, packages = [], ptPackage, vouchers, userReferralDiscount = 0, userDiscountReason, onConfirm 
}) => {
  const [step, setStep] = useState<'select' | 'voucher' | 'payment' | 'success'>('select');
  
  // Selection State (Gym Only)
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  
  // Voucher State
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherItem | null>(null);

  // Logic init
  React.useEffect(() => {
     if (type === 'pt' && ptPackage) {
         setStep('voucher'); // Skip selection for PT
     } else {
         setStep('select');
     }
  }, [type, ptPackage, isOpen]);

  // Calculations
  const calculation = useMemo(() => {
      let basePrice = 0;

      if (type === 'gym' && selectedPackage) {
          basePrice = selectedPackage.price;
      } else if (type === 'pt' && ptPackage) {
          basePrice = ptPackage.price;
      }
      
      // Referral Discount logic
      const referralDiscAmount = basePrice * userReferralDiscount;
      const priceAfterReferral = basePrice - referralDiscAmount;

      // Voucher Discount logic
      let voucherDiscAmount = 0;
      if (appliedVoucher) {
          voucherDiscAmount = priceAfterReferral * appliedVoucher.value;
      }

      const finalPrice = Math.round(priceAfterReferral - voucherDiscAmount);

      return { basePrice, referralDiscAmount, voucherDiscAmount, finalPrice };
  }, [type, selectedPackage, ptPackage, userReferralDiscount, appliedVoucher]);

  const handleApplyVoucher = () => {
      if (!voucherCode) return;
      // Admin defined vouchers check
      const found = vouchers.find(v => v.code === voucherCode && (v.type === 'Gift' || v.type.toLowerCase() === type));
      if (found) {
          setAppliedVoucher(found);
          alert(`Áp dụng mã ${found.code} thành công!`);
      } else {
          alert("Mã không hợp lệ hoặc không áp dụng cho loại dịch vụ này.");
          setAppliedVoucher(null);
      }
  };

  const handleSelectPackage = (pkg: PackageItem) => {
      setSelectedPackage(pkg);
      setStep('voucher'); // Auto advance
  };

  const handlePayment = () => {
      setStep('payment');
  };

  const finish = () => {
      onConfirm({
          packageName: type === 'gym' ? selectedPackage?.name : ptPackage?.name,
          months: type === 'gym' ? (selectedPackage?.duration || 1) : 0, // Use duration from Admin Package
          price: calculation.finalPrice,
          voucherCode: appliedVoucher?.code
      });
      setStep('success');
  };

  const openBankApp = (scheme: string) => {
      window.location.href = scheme;
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Đã sao chép: " + text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-20">
        <div className="p-5 flex justify-between items-center border-b border-gray-50">
          <h2 className="text-lg font-black text-gray-800 uppercase italic tracking-tight">
            {step === 'select' && 'Chọn Gói Tập'}
            {step === 'voucher' && 'Xác Nhận & Ưu Đãi'}
            {step === 'payment' && 'Thanh Toán'}
            {step === 'success' && 'Hoàn Tất'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-6">
            {/* STEP 1: SELECT (Gym Only) - Admin Defined Packages */}
            {step === 'select' && type === 'gym' && (
                <div className="space-y-4">
                    {packages.map((pkg) => (
                        <button
                            key={pkg.id}
                            onClick={() => handleSelectPackage(pkg)}
                            className={`flex flex-col gap-2 p-3 rounded-2xl border-2 w-full transition-all text-left active:scale-95 ${selectedPackage?.id === pkg.id ? 'border-[#FF6B00] bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <img src={pkg.image} className="w-16 h-16 rounded-xl object-cover" />
                                <div className="text-left flex-1">
                                    <p className="font-bold text-gray-800">{pkg.name}</p>
                                    <p className="text-xs text-gray-500">{pkg.price.toLocaleString()}đ</p>
                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md font-bold uppercase mt-1 inline-block">{pkg.duration} tháng</span>
                                </div>
                                {selectedPackage?.id === pkg.id && <CheckCircle2 className="w-6 h-6 text-[#FF6B00]" />}
                            </div>
                            {pkg.description && (
                                <p className="text-[10px] text-gray-500 italic bg-white/50 p-2 rounded-lg border border-gray-50">{pkg.description}</p>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* STEP 2: VOUCHER & CONFIRM */}
            {step === 'voucher' && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                             <div className="w-12 h-12 rounded-xl overflow-hidden bg-white">
                                 <img src={type === 'gym' ? selectedPackage?.image : ptPackage?.image} className="w-full h-full object-cover"/>
                             </div>
                             <div>
                                 <p className="font-black text-gray-800 text-sm">{type === 'gym' ? selectedPackage?.name : ptPackage?.name}</p>
                                 <p className="text-xs text-gray-500">{type === 'gym' ? `${selectedPackage?.duration} tháng` : `${ptPackage?.sessions} buổi`}</p>
                             </div>
                        </div>
                        
                        {(type === 'pt' && ptPackage?.description) && (
                            <p className="text-[10px] text-gray-500 italic mb-2">{ptPackage.description}</p>
                        )}
                        
                        <div className="space-y-2 text-xs font-medium text-gray-500">
                            <div className="flex justify-between">
                                <span>Giá gốc</span>
                                <span>{calculation.basePrice.toLocaleString()}đ</span>
                            </div>
                            {userReferralDiscount > 0 && (
                                <div className="flex justify-between text-pink-500">
                                    <span>{userDiscountReason}</span>
                                    <span>-{Math.round(calculation.referralDiscAmount).toLocaleString()}đ</span>
                                </div>
                            )}
                            {appliedVoucher && (
                                <div className="flex justify-between text-blue-500">
                                    <span>Voucher ({appliedVoucher.code})</span>
                                    <span>-{Math.round(calculation.voucherDiscAmount).toLocaleString()}đ</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-base font-black text-[#FF6B00]">
                                <span>Thành tiền</span>
                                <span>{calculation.finalPrice.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>

                    {/* Voucher Input */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Mã giảm giá</label>
                        <div className="flex gap-2">
                            <input 
                                value={voucherCode}
                                onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                                placeholder="Nhập mã..."
                                className="flex-1 bg-gray-50 border-none rounded-xl px-4 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-blue-100"
                            />
                            <button onClick={handleApplyVoucher} className="bg-blue-500 text-white px-4 rounded-xl font-bold text-xs uppercase shadow-md active:scale-95 transition-transform">Áp Dụng</button>
                        </div>
                        {/* Available Vouchers Suggestion */}
                        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                            {vouchers.filter(v => (v.type === 'Gift' || v.type.toLowerCase() === type)).map(v => (
                                <button key={v.id} onClick={() => { setVoucherCode(v.code); }} className="whitespace-nowrap bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-blue-100 active:scale-95 transition-transform">
                                    {v.code} (-{v.value * 100}%)
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={handlePayment} className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        Thanh Toán Ngay <ArrowRight className="w-5 h-5"/>
                    </button>
                </div>
            )}

            {/* STEP 3: PAYMENT & BANK SELECTION */}
            {step === 'payment' && (
                <div className="space-y-6">
                    <div className="bg-white border-2 border-[#FF6B00] rounded-3xl p-4 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 bg-[#FF6B00] text-white px-3 py-1 rounded-br-xl text-[10px] font-bold">Quét mã để thanh toán</div>
                        <img src={QR_IMAGE_URL} alt="VietQR" className="w-48 h-48 mx-auto object-contain my-2" />
                        <p className="font-black text-xl text-gray-800">{calculation.finalPrice.toLocaleString()}đ</p>
                        <p className="text-xs text-gray-400 font-medium">Nội dung: <span className="text-gray-800 font-bold select-all">T{Date.now().toString().slice(-6)}</span> <button onClick={() => copyToClipboard(`T${Date.now().toString().slice(-6)}`)}><Copy className="w-3 h-3 inline text-blue-500"/></button></p>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Mở App Ngân Hàng (Trên máy này)</p>
                        <div className="grid grid-cols-2 gap-3">
                            {BANKS.map(bank => (
                                <button 
                                    key={bank.id}
                                    onClick={() => openBankApp(bank.scheme)}
                                    className={`${bank.color} text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-md active:scale-95 transition-transform`}
                                >
                                    <Smartphone className="w-4 h-4" /> {bank.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button onClick={finish} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <Check className="w-5 h-5"/> Tôi Đã Chuyển Khoản
                    </button>
                    
                    <p className="text-[10px] text-center text-gray-400 px-4">Sau khi chuyển khoản, vui lòng nhấn xác nhận. Admin sẽ duyệt trong vài phút.</p>
                </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && (
                <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 uppercase italic mb-2">Đã Gửi Yêu Cầu!</h3>
                    <p className="text-sm text-gray-500 px-6">Giao dịch đang chờ Admin duyệt. Bạn có thể chat với Admin để được hỗ trợ nhanh hơn.</p>
                    <button onClick={onClose} className="mt-8 bg-gray-100 text-gray-800 px-8 py-3 rounded-xl font-bold uppercase text-xs active:scale-95 transition-transform">Đóng</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
