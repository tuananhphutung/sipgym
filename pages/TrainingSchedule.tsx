
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Calendar as CalIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../App';

interface TrainingScheduleProps {
  user: UserProfile | null;
  allUsers: UserProfile[];
  onUpdateUser: (users: UserProfile[]) => void;
}

const TrainingSchedule: React.FC<TrainingScheduleProps> = ({ user, allUsers, onUpdateUser }) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (month: Date) => {
    return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  };

  const getDaysArray = () => {
    const days = [];
    const count = daysInMonth(currentMonth);
    for (let i = 1; i <= count; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return days;
  };

  const toggleTrainingDay = (date: Date) => {
    if (!user) return alert("Vui lòng đăng nhập để lưu lịch tập!");
    
    const dateStr = date.toISOString().split('T')[0];
    const newTrainingDays = user.trainingDays.includes(dateStr)
      ? user.trainingDays.filter(d => d !== dateStr)
      : [...user.trainingDays, dateStr];

    const newUsers = allUsers.map(u => u.phone === user.phone ? { ...u, trainingDays: newTrainingDays } : u);
    onUpdateUser(newUsers);
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="min-h-screen bg-white pb-20 animate-in slide-in-from-right duration-500">
      <div className="bg-[#00AEEF] px-6 pt-12 pb-10 rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><CalIcon className="w-32 h-32 text-white" /></div>
        <button onClick={() => navigate('/')} className="mb-6 p-2 bg-white/20 rounded-full text-white"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-3xl font-[900] text-white italic uppercase leading-none">Lịch Tập Luyện</h1>
        <p className="text-white/70 text-sm font-bold mt-2 uppercase tracking-widest">Đánh dấu ngày bạn đã hoàn thành</p>
      </div>

      <div className="px-6 -mt-6">
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-blue-50 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => changeMonth(-1)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="font-black text-gray-800 uppercase italic">Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-black text-gray-300 uppercase mb-2">{d}</div>
            ))}
            {getDaysArray().map((date, idx) => {
              const dateStr = date.toISOString().split('T')[0];
              const isTrained = user?.trainingDays.includes(dateStr);
              return (
                <div 
                  key={idx} 
                  onClick={() => toggleTrainingDay(date)}
                  className={`
                    aspect-square rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative
                    ${isTrained ? 'bg-[#8DBF44] text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-400'}
                    ${isToday(date) && !isTrained ? 'border-2 border-blue-400' : ''}
                  `}
                >
                  <span className="text-xs font-black">{date.getDate()}</span>
                  {isTrained && <CheckCircle2 className="w-3 h-3 mt-0.5" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-[32px] p-6 border border-blue-100">
           <h3 className="font-black text-blue-900 uppercase italic mb-2 text-sm">Thống kê tháng này</h3>
           <div className="flex items-center gap-4">
              <div className="flex-1">
                 <p className="text-[10px] font-bold text-blue-400 uppercase">Ngày đã tập</p>
                 <p className="text-2xl font-black text-blue-900">{user?.trainingDays.filter(d => d.startsWith(currentMonth.toISOString().slice(0, 7))).length || 0} Ngày</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                 <CalIcon className="w-6 h-6" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingSchedule;
