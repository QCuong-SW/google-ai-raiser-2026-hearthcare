import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, LogIn, UserPlus, AlertCircle, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';
import { loginUser, registerUser, forgotPasswordApi, verifyResetCodeApi, resetPasswordApi, googleLoginApi, fetchGoogleConfigApi } from '../services/api';
import type { AuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
}

type AuthMode = 'login' | 'register' | 'forgot_email' | 'forgot_otp' | 'forgot_new_pass';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Password Reset State
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal Animation States
  const [renderModal, setRenderModal] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRenderModal(true);
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRenderModal(false), 300); // 300ms fade out duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!renderModal) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const config = await fetchGoogleConfigApi();
      const google = (window as any).google;

      if (config.clientId && google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: config.clientId,
          callback: async (response: any) => {
            if (response.credential) {
              setIsLoading(true);
              try {
                const data = await googleLoginApi(response.credential);
                setSuccessMsg('Đăng nhập Google thành công!');
                setTimeout(() => {
                  onSuccess(data.user);
                  handleClose();
                }, 500);
              } catch (err: any) {
                setErrorMsg(err.message || 'Xác thực Google ID Token thất bại');
              } finally {
                setIsLoading(false);
              }
            }
          },
        });

        // Trigger Google 1-Tap Prompt Modal
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google Prompt suppressed, trying dev mode fallback');
          }
        });
      } else {
        // Fallback for Development Mock Mode when GOOGLE_CLIENT_ID is not configured
        const mockGoogleIdToken = `mock_google_token_${Date.now()}`;
        const data = await googleLoginApi(mockGoogleIdToken);
        setSuccessMsg('Đăng nhập Google thành công! (Môi trường Dev Test)');
        setTimeout(() => {
          onSuccess(data.user);
          handleClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập với Google thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    setIsLoading(true);
    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Vui lòng điền đầy đủ Email và Mật khẩu');
          setIsLoading(false);
          return;
        }
        const data = await loginUser(email, password);
        setSuccessMsg('Đăng nhập thành công!');
        setTimeout(() => {
          onSuccess(data.user);
          handleClose();
        }, 500);
      } else if (mode === 'register') {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          setErrorMsg('Vui lòng điền đầy đủ thông tin');
          setIsLoading(false);
          return;
        }
        if (password.length < 8) {
          setErrorMsg('Mật khẩu phải chứa ít nhất 8 ký tự');
          setIsLoading(false);
          return;
        }
        const data = await registerUser(email, password, fullName, phone);
        setSuccessMsg('Đăng ký tài khoản thành công! Vui lòng kiểm tra email xác minh.');
        setTimeout(() => {
          onSuccess(data.user);
          handleClose();
        }, 800);
      } else if (mode === 'forgot_email') {
        if (!email.trim()) {
          setErrorMsg('Vui lòng nhập email tài khoản của bạn');
          setIsLoading(false);
          return;
        }
        await forgotPasswordApi(email);
        setSuccessMsg('Mã OTP 6 số đã được gửi tới email của bạn!');
        setTimeout(() => {
          setSuccessMsg(null);
          setMode('forgot_otp');
        }, 1200);
      } else if (mode === 'forgot_otp') {
        if (!otpCode.trim() || otpCode.trim().length !== 6) {
          setErrorMsg('Mã OTP phải bao gồm đúng 6 chữ số');
          setIsLoading(false);
          return;
        }
        const data = await verifyResetCodeApi(email, otpCode.trim());
        setResetToken(data.resetToken);
        setSuccessMsg('Xác nhận mã OTP thành công! Vui lòng nhập mật khẩu mới.');
        setTimeout(() => {
          setSuccessMsg(null);
          setMode('forgot_new_pass');
        }, 1000);
      } else if (mode === 'forgot_new_pass') {
        if (!newPassword.trim() || newPassword.trim().length < 8) {
          setErrorMsg('Mật khẩu mới phải chứa ít nhất 8 ký tự');
          setIsLoading(false);
          return;
        }
        await resetPasswordApi(resetToken, newPassword.trim());
        setSuccessMsg('Đổi mật khẩu mới thành công! Vui lòng đăng nhập lại.');
        setTimeout(() => {
          setSuccessMsg(null);
          setMode('login');
          setPassword('');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Thao tác thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Modal Box with Fluid Height Expansion/Shrink Animation */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md bg-white border border-emerald-300 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-900 transition-all duration-300 ease-out transform overflow-hidden ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'
        }`}
      >
        {/* Close Modal Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-emerald-100 transition-all cursor-pointer hover:rotate-90 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header & Tabs */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4 border-b border-emerald-200 pb-3">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 transition-all duration-300">
              {mode === 'login' && <LogIn className="w-5 h-5 text-emerald-600 animate-in fade-in zoom-in duration-200" />}
              {mode === 'register' && <UserPlus className="w-5 h-5 text-emerald-600 animate-in fade-in zoom-in duration-200" />}
              {mode.startsWith('forgot') && <KeyRound className="w-5 h-5 text-emerald-600 animate-in fade-in zoom-in duration-200" />}

              {mode === 'login' && 'Đăng Nhập'}
              {mode === 'register' && 'Đăng Ký Tài Khoản'}
              {mode.startsWith('forgot') && 'Khôi Phục Mật Khẩu'}
            </h2>

            {mode.startsWith('forgot') && (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('login');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
              </button>
            )}
          </div>

          {/* Login / Register Sliding Indicator Tab Switcher */}
          {(mode === 'login' || mode === 'register') && (
            <div className="relative flex bg-emerald-50 border border-emerald-200 rounded-2xl p-1">
              {/* Sliding Active Pill Indicator */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-600 rounded-xl shadow-md transition-all duration-300 ease-out ${
                  mode === 'login' ? 'left-1' : 'left-[calc(50%+3px)]'
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`relative z-10 flex-1 py-2 text-xs font-extrabold transition-colors duration-200 cursor-pointer ${
                  mode === 'login' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`relative z-10 flex-1 py-2 text-xs font-extrabold transition-colors duration-200 cursor-pointer ${
                  mode === 'register' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng Ký
              </button>
            </div>
          )}
        </div>

        {/* Notifications: Success or Error */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Social Google Login Button (Only visible for Login / Register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white border border-emerald-300 hover:border-emerald-500 text-slate-800 hover:bg-emerald-50/50 font-bold text-xs rounded-2xl flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            <div className="relative my-3.5 flex items-center justify-center">
              <div className="border-t border-emerald-200 w-full"></div>
              <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest absolute">
                Hoặc bằng Email
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Form Content with Smooth Expansion/Shrink Grid Transitions */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Smooth Expanding/Shrinking Accordion Wrapper for Full Name & Phone (Register Mode Only) */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              mode === 'register' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'
            }`}
          >
            <div className="overflow-hidden space-y-3">
              <div>
                <label className="block text-[11px] font-extrabold text-emerald-800 uppercase mb-1">
                  Họ và Tên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required={mode === 'register'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-emerald-800 uppercase mb-1">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email Input (Visible for Login, Register, Forgot_Email) */}
          {(mode === 'login' || mode === 'register' || mode === 'forgot_email') && (
            <div>
              <label className="block text-[11px] font-extrabold text-emerald-800 uppercase mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
                />
              </div>
            </div>
          )}

          {/* Password Input (Visible for Login, Register) */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-extrabold text-emerald-800 uppercase">
                  Mật khẩu
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('forgot_email');
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 2: OTP Input (Forgot OTP Mode) */}
          {mode === 'forgot_otp' && (
            <div className="animate-in fade-in duration-300">
              <label className="block text-[11px] font-extrabold text-emerald-800 uppercase mb-1">
                Nhập Mã OTP 6 Số (Đã gửi tới {email})
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl text-center tracking-[6px] text-base font-extrabold text-slate-900 placeholder:text-slate-400 outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Step 3: New Password Input (Forgot New Pass Mode) */}
          {mode === 'forgot_new_pass' && (
            <div className="animate-in fade-in duration-300">
              <label className="block text-[11px] font-extrabold text-emerald-800 uppercase mb-1">
                Nhập Mật Khẩu Mới
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập tối thiểu 8 ký tự"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Đang xử lý...
              </span>
            ) : (
              <>
                {mode === 'login' && 'Đăng Nhập Ngay'}
                {mode === 'register' && 'Tạo Tài Khoản Mới'}
                {mode === 'forgot_email' && 'Gửi Mã OTP Khôi Phục'}
                {mode === 'forgot_otp' && 'Xác Nhận Mã OTP'}
                {mode === 'forgot_new_pass' && 'Lưu Mật Khẩu Mới'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
