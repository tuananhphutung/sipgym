
import React, { useState } from 'react';
import { X, Smartphone, Info, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (phone: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 10 số)');
      return;
    }
    onLogin(phone);
    setPhone('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center px-4 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-[400px] bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#00AEEF]/10 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-[#00AEEF]" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-center text-gray-800 mb-2">Đăng Nhập Nhanh</h2>
        <p className="text-gray-500 text-center text-sm mb-8 px-4">
          Nhập số điện thoại để bắt đầu hành trình cùng Sip Gym Nhà Bè.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 flex gap-3">
          <Info className="w-5 h-5 text-[#00AEEF] shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 leading-relaxed">
            <p className="font-bold mb-1">Tiện lợi & Bảo mật:</p>
            Hệ thống không yêu cầu mật khẩu hay đăng ký. Số điện thoại là mã định danh duy nhất của bạn để lưu lại toàn bộ tiến trình tập luyện.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPhone(val);
                if (error) setError('');
              }}
              placeholder="Nhập số điện thoại của bạn..."
              className={`w-full bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-2xl py-4 px-6 text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#00AEEF]/20 focus:border-[#00AEEF] transition-all`}
            />
            {phone.length >= 10 && (
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-500 animate-in zoom-in duration-300" />
            )}
          </div>
          
          {error && <p className="text-red-500 text-xs font-medium ml-2">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-[#00AEEF] hover:bg-[#0096cc] active:scale-[0.98] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-100 transition-all uppercase tracking-wider"
          >
            Tiếp Tục
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          Sip Gym Nhà Bè • Professional Training
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
