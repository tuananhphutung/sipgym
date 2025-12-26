
import React from 'react';
import { ArrowLeft, Ticket, Scissors, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VoucherItem } from '../App';

interface VoucherProps {
  vouchers: VoucherItem[];
}

const Voucher: React.FC<VoucherProps> = ({ vouchers }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20 animate-in slide-in-from-right duration-500">
       <div className="bg-[#00AEEF] px-6 pt-12 pb-10 rounded-b-[40px] relative overflow-hidden">
        <button onClick={() => navigate('/')} className="mb-6 p-2 bg-white/20 rounded-full text-white"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-3xl font-[900] text-white italic uppercase leading-none">Ưu Đãi Đặc Biệt</h1>
        <p className="text-white/70 text-sm font-bold mt-2 uppercase tracking-widest">Dành riêng cho thành viên Sip Gym</p>
      </div>

      <div className="p-6 space-y-4">
        {vouchers.length === 0 ? (
          <div className="text-center py-10 opacity-40">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-400">Chưa có voucher nào</p>
          </div>
        ) : (
          vouchers.map((v) => (
            <div key={v.id} className="relative bg-white rounded-3xl p-6 border-2 border-dashed border-gray-100 flex items-center gap-4 shadow-sm group hover:border-blue-100 transition-colors">
              <div className={`w-14 h-14 ${v.color || 'bg-blue-500'} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0`}>
                 <Ticket className="w-7 h-7" />
              </div>
              <div className="flex-1">
                 <h3 className="font-black text-gray-800 text-sm uppercase leading-tight mb-1">{v.title}</h3>
                 <div className="bg-gray-50 inline-block px-3 py-1 rounded-lg">
                    <span className="text-[10px] font-black text-blue-600 tracking-widest">CODE: {v.code}</span>
                 </div>
              </div>
              <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all"><Scissors className="w-5 h-5" /></button>
            </div>
          ))
        )}
        
        <div className="pt-10 text-center opacity-30">
           <Gift className="w-16 h-16 mx-auto mb-4" />
           <p className="font-black uppercase text-xs tracking-widest">Sẽ còn nhiều ưu đãi sắp tới!</p>
        </div>
      </div>
    </div>
  );
};

export default Voucher;
