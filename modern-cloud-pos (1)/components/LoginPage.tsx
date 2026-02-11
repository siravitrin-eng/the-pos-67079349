
import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInAnonymously } from '../firebase';

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Authentication Error", error);
      setError("ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error("Guest Login Error", error);
      setError("ไม่สามารถเข้าใช้งานแบบ Guest ได้ในขณะนี้");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password;
    const trimmedDisplayName = displayName.trim();

    if (!trimmedEmail) { setError("กรุณากรอกอีเมล"); return; }
    if (isRegistering && !trimmedDisplayName) { setError("กรุณากรอกชื่อ-นามสกุล"); return; }
    if (trimmedPassword.length < 6) { setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"); return; }

    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        await updateProfile(userCredential.user, { displayName: trimmedDisplayName });
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      }
    } catch (error: any) {
      console.error("Auth Error", error);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="bg-zinc-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden transform transition-all border border-zinc-800">
        <div className="p-10 text-center">
          <div className="w-24 h-24 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[inset_0_2px_10px_rgba(16,185,129,0.1)] border border-emerald-500/20">
            <i className="fas fa-cash-register text-emerald-500 text-5xl"></i>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Spark<span className="text-emerald-500">POS</span></h1>
          <p className="text-zinc-500 font-medium mb-10 uppercase text-[10px] tracking-[0.2em]">Dark Edition Solution</p>
          
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 text-left">
            {isRegistering && (
              <div>
                <label className="block text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2 ml-1">ชื่อ-นามสกุล</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm"></i>
                  <input 
                    type="text" 
                    required
                    placeholder="สมชาย ใจดี"
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl focus:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-white placeholder:text-zinc-600"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2 ml-1">อีเมลผู้ใช้งาน</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm"></i>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl focus:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-white placeholder:text-zinc-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2 ml-1">รหัสผ่าน</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm"></i>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl focus:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-white placeholder:text-zinc-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs font-bold flex items-center space-x-2 animate-pulse border border-red-500/20">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-black py-4 rounded-2xl font-black shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegistering ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</span>
                  <i className="fas fa-arrow-right text-xs"></i>
                </>
              )}
            </button>
          </form>

          <div className="flex flex-col space-y-3">
            <button 
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-emerald-500 font-bold text-sm hover:underline"
            >
              {isRegistering ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่'}
            </button>

            <div className="relative flex items-center justify-center py-4">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-900">หรือ</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-zinc-800 border border-zinc-700 py-3 rounded-2xl shadow-sm hover:bg-zinc-700 transition-all active:scale-95 disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                <span className="text-zinc-300 font-bold text-xs">Google</span>
              </button>

              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-3 rounded-2xl hover:bg-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <i className="fas fa-user-secret text-xs"></i>
                <span className="font-bold text-xs">Guest</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
