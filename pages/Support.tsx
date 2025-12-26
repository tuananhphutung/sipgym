
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../App';

interface SupportProps {
  user: UserProfile | null;
  allUsers: UserProfile[];
  onUpdateUser: (users: UserProfile[]) => void;
}

const Support: React.FC<SupportProps> = ({ user, allUsers, onUpdateUser }) => {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = user?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!msg.trim() || !user) return;
    
    const newMessage = {
      sender: 'user' as const,
      text: msg.trim(),
      timestamp: Date.now()
    };

    const newUsers = allUsers.map(u => {
      if (u.phone === user.phone) {
        return { ...u, messages: [...(u.messages || []), newMessage] };
      }
      return u;
    });

    onUpdateUser(newUsers);
    setMsg('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-[120px] animate-in slide-in-from-right duration-500">
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate('/')} className="p-2 bg-gray-50 rounded-full text-gray-400"><ArrowLeft className="w-6 h-6" /></button>
        <div className="flex-1">
           <h2 className="font-black text-gray-800 uppercase italic">Hỗ Trợ Trực Tuyến</h2>
           <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Admin đang trực tuyến</span>
           </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center py-10 opacity-40">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-400 text-sm">Bắt đầu cuộc trò chuyện với Admin...</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${
                m.sender === 'user' 
                ? 'bg-[#00AEEF] text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-24 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <div className="relative">
             <input 
               type="text"
               value={msg}
               onChange={(e) => setMsg(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               className="w-full bg-gray-50 border-none rounded-full py-3.5 pl-5 pr-12 text-sm font-bold focus:ring-2 focus:ring-[#00AEEF]/20 focus:outline-none"
               placeholder="Nhập tin nhắn..."
             />
             <button 
              onClick={handleSend}
              className="absolute top-1/2 -translate-y-1/2 right-2 p-2 bg-[#00AEEF] text-white rounded-full shadow-md active:scale-90 transition-transform"
             >
                <Send className="w-4 h-4" />
             </button>
          </div>
      </div>
    </div>
  );
};

export default Support;
