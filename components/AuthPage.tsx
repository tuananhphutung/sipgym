
import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, User, Smartphone, MapPin, Lock, Mail, ShieldQuestion, ArrowRight, ScanFace, X } from 'lucide-react';
import { UserProfile } from '../App';
import { faceService } from '../services/faceService';

interface AuthPageProps {
  allUsers: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onUpdateUsers: (users: UserProfile[]) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ allUsers, onLoginSuccess, onUpdateUsers }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Phone or Email
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regSecurityQ, setRegSecurityQ] = useState('Tên trường tiểu học của bạn?');
  const [regSecurityA, setRegSecurityA] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  // Forgot Pass
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSecurityA, setForgotSecurityA] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [targetUserForReset, setTargetUserForReset] = useState<UserProfile | null>(null);

  // Face ID Login State
  const [isFaceLogin, setIsFaceLogin] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanStatus, setScanStatus] = useState('Đang khởi tạo Camera...');
  const [matchPercent, setMatchPercent] = useState(0);

  const [error, setError] = useState('');

  // Clean up camera when component unmounts or mode changes
  useEffect(() => {
      return () => {
          stopCamera();
      };
  }, []);

  const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
      }
      if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
  };

  const startFaceLogin = async () => {
      setIsFaceLogin(true);
      setScanStatus("Đang tải AI...");
      setMatchPercent(0);
      try {
          await faceService.loadModels();
          if (streamRef.current) stopCamera();
          
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          streamRef.current = stream;
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
          setScanStatus("Đang tìm khuôn mặt...");
          scanFaceLoop();
      } catch (e) {
          console.error(e);
          alert("Không thể mở camera. Vui lòng kiểm tra quyền truy cập.");
          setIsFaceLogin(false);
      }
  };

  const scanFaceLoop = async () => {
      if (!streamRef.current || !videoRef.current) return;
      if (!isFaceLogin) return;

      // Scan process
      const result = await faceService.findBestMatch(videoRef.current, allUsers);
      
      setMatchPercent(result.matchPercentage);

      if (result.user && result.matchPercentage >= 55) { // 55% Euclidean logic tương đương confidence rất cao (>90%)
          setScanStatus(`Đã khớp! (${result.matchPercentage}%)`);
          // Delay a bit for UX
          setTimeout(() => {
              stopCamera();
              onLoginSuccess(result.user);
          }, 800);
          return;
      } else {
          if (result.matchPercentage > 0) {
              setScanStatus(`Đang so khớp... (${result.matchPercentage}%)`);
          } else {
              setScanStatus("Giữ yên khuôn mặt...");
          }
          // Retry
          requestAnimationFrame(scanFaceLoop);
      }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Find user by Phone OR Email
    const user = allUsers.find(u => u.phone === loginIdentifier || u.email === loginIdentifier);
    
    if (!user) {
        setError("Tài khoản không tồn tại.");
        return;
    }
    
    if (user.password !== loginPass) {
        setError("Mật khẩu không đúng.");
        return;
    }
    
    onLoginSuccess(user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName || !regPhone || !regPass) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
        return;
    }

    if (allUsers.find(u => u.phone === regPhone)) {
        setError("Số điện thoại đã được đăng ký.");
        return;
    }
    
    if (regEmail && allUsers.find(u => u.email === regEmail)) {
        setError("Email đã được sử dụng.");
        return;
    }

    const newUser: UserProfile = {
        phone: regPhone,
        password: regPass,
        realName: regName,
        name: regName,
        email: regEmail,
        address: regAddress,
        securityQuestion: regSecurityQ,
        securityAnswer: regSecurityA,
        avatar: null,
        subscription: null,
        isLocked: false,
        notifications: [],
        messages: [],
        trainingDays: [],
        savedVouchers: [],
        accountStatus: 'Active',
        settings: { popupNotification: true }
    };
    
    const updatedUsers = [...allUsers, newUser];
    onUpdateUsers(updatedUsers);
    setTimeout(() => {
        alert("Đăng ký thành công!");
        onLoginSuccess(newUser);
    }, 100);
  };

  const handleForgotCheck = () => {
      const user = allUsers.find(u => u.phone === forgotIdentifier || u.email === forgotIdentifier);
      if (user) {
          setTargetUserForReset(user);
          setError('');
      } else {
          setError("Không tìm thấy tài khoản.");
          setTargetUserForReset(null);
      }
  };

  const handleResetPass = () => {
      if (!targetUserForReset) return;
      if (targetUserForReset.securityAnswer !== forgotSecurityA) {
          setError("Câu trả lời bảo mật không đúng.");
          return;
      }
      
      const updatedUsers = allUsers.map(u => u.phone === targetUserForReset.phone ? { ...u, password: newPass } : u);
      onUpdateUsers(updatedUsers);
      alert("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
      setMode('login');
      setTargetUserForReset(null);
      setForgotIdentifier('');
      setForgotSecurityA('');
      setNewPass('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-60"></div>
       <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60"></div>

       <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
             <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-white">
                <img src="https://phukienlimousine.vn/wp-content/uploads/2025/12/LOGO_SIP_GYM_pages-to-jpg-0001-removebg-preview.png" className="w-full h-full object-contain p-2" />
             </div>
             <h1 className="text-3xl font-black text-gray-800 uppercase italic">Sip Gym Nhà Bè</h1>
             <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Câu lạc bộ thể hình chuyên nghiệp</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white relative overflow-hidden">
             
             {/* FACE LOGIN OVERLAY */}
             {isFaceLogin && (
                 <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                     <button onClick={() => { setIsFaceLogin(false); stopCamera(); }} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"><X className="w-6 h-6"/></button>
                     <h3 className="text-xl font-black text-gray-800 uppercase italic mb-6">Quét Face ID</h3>
                     <div className="relative w-64 h-64 rounded-[40px] overflow-hidden border-4 border-[#FF6B00] shadow-2xl mb-6">
                         <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"/>
                         {/* Scanning Effect */}
                         <div className="absolute top-0 left-0 w-full h-1 bg-[#FF6B00] shadow-[0_0_20px_#FF6B00] animate-[scan_1.5s_linear_infinite]"></div>
                         <div className="absolute inset-0 border-2 border-white/30 rounded-[35px] m-4"></div>
                         <style>{`@keyframes scan { 0% { top: 0; opacity: 0.5; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0.5; } }`}</style>
                     </div>
                     <p className="text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">{scanStatus}</p>
                     {matchPercent > 0 && matchPercent < 55 && (
                         <div className="w-full max-w-[200px] h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
                             <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${matchPercent}%` }}></div>
                         </div>
                     )}
                     <button onClick={() => { setIsFaceLogin(false); stopCamera(); }} className="mt-8 text-gray-400 font-bold text-xs uppercase border-b border-gray-200 pb-1">Sử dụng mật khẩu</button>
                 </div>
             )}

             {/* Header Tabs */}
             {mode !== 'forgot' && (
                 <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
                    <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'login' ? 'bg-white shadow-md text-[#FF6B00]' : 'text-gray-400'}`}>Đăng Nhập</button>
                    <button onClick={() => setMode('register')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'register' ? 'bg-white shadow-md text-[#FF6B00]' : 'text-gray-400'}`}>Đăng Ký</button>
                 </div>
             )}

             {/* LOGIN FORM */}
             {mode === 'login' && (
                 <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} placeholder="Số điện thoại hoặc Email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type={showLoginPass ? "text" : "password"} value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Mật khẩu" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-12 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                        <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {showLoginPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                        </button>
                    </div>
                    <div className="flex justify-end">
                       <button type="button" onClick={() => setMode('forgot')} className="text-xs font-bold text-gray-400 hover:text-orange-500">Quên mật khẩu?</button>
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}
                    
                    <button type="submit" className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-orange-200 active:scale-95 transition-transform">Đăng Nhập Ngay</button>
                    
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-300 text-[10px] font-bold uppercase">Hoặc</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <button 
                        type="button" 
                        onClick={startFaceLogin}
                        className="w-full bg-white border-2 border-[#FF6B00] text-[#FF6B00] py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2 hover:bg-orange-50 active:scale-95 transition-all"
                    >
                        <ScanFace className="w-5 h-5" /> Đăng nhập bằng Face ID
                    </button>
                 </form>
             )}

             {/* REGISTER FORM */}
             {mode === 'register' && (
                 <form onSubmit={handleRegister} className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                    <div className="grid grid-cols-1 gap-3">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Họ và tên" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-200" required />
                        </div>
                        <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="Số điện thoại (ID)" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-200" required />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-200" />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="Địa chỉ" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-200" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type={showRegPass ? "text" : "password"} value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Mật khẩu" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-10 text-xs font-bold outline-none focus:ring-1 focus:ring-orange-200" required />
                            <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showRegPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Câu hỏi bảo mật (dùng khi quên MK)</p>
                            <select value={regSecurityQ} onChange={e => setRegSecurityQ(e.target.value)} className="w-full bg-white border-none rounded-lg p-2 text-xs font-bold mb-2">
                                <option>Tên trường tiểu học của bạn?</option>
                                <option>Tên thú cưng đầu tiên?</option>
                                <option>Món ăn yêu thích nhất?</option>
                            </select>
                            <div className="relative">
                                <ShieldQuestion className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={regSecurityA} onChange={e => setRegSecurityA(e.target.value)} placeholder="Câu trả lời" className="w-full bg-white border-none rounded-lg py-2 pl-9 pr-2 text-xs font-bold" required />
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}
                    <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-transform mt-4">Đăng Ký Thành Viên</button>
                 </form>
             )}

             {/* FORGOT PASSWORD */}
             {mode === 'forgot' && (
                 <div className="space-y-4">
                     <h3 className="text-center font-black text-xl uppercase italic text-gray-800">Khôi Phục Mật Khẩu</h3>
                     {!targetUserForReset ? (
                         <>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input value={forgotIdentifier} onChange={e => setForgotIdentifier(e.target.value)} placeholder="Nhập SĐT hoặc Email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                            </div>
                            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                            <button onClick={handleForgotCheck} className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-transform">Tiếp Tục</button>
                         </>
                     ) : (
                         <>
                            <p className="text-center text-xs font-bold text-gray-500">Câu hỏi: {targetUserForReset.securityQuestion}</p>
                            <div className="relative">
                                <ShieldQuestion className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input value={forgotSecurityA} onChange={e => setForgotSecurityA(e.target.value)} placeholder="Nhập câu trả lời" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type={showNewPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Mật khẩu mới" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-12 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                                <button onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showNewPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
                            </div>
                            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                            <button onClick={handleResetPass} className="w-full bg-green-500 text-white py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-transform">Đặt Lại Mật Khẩu</button>
                         </>
                     )}
                     <button onClick={() => { setMode('login'); setTargetUserForReset(null); setError(''); }} className="w-full text-center text-gray-400 font-bold text-xs uppercase">Quay lại đăng nhập</button>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default AuthPage;
