import { useForm } from "react-hook-form";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // 1. استيراد أكسيوس
import axios from "../api/axiosInstance";

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);


const BASE_URL = 'http://127.0.0.1:5129';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

const onSubmit = async (data) => {
    setLoading(true);
    try {

      if (showForgotPassword) {

        await axios.post('/api/Auth/forgot-password', { email: data.email });
        localStorage.setItem('resetEmail', data.email); 
        alert(`تم إرسال كود التحقق إلى: ${data.email}`);

        navigate('/verify-otp'); 
        return;
      }

      if (isLogin) {
        const response = await axios.post('/api/Auth/login', {
          email: data.email,
          password: data.password
        });
         
       localStorage.setItem('token', response.data.token);
       localStorage.setItem('user', JSON.stringify(response.data)); // بيخزن كل البيانات
       localStorage.setItem('workspaceId', response.data.workspaceId);
       localStorage.setItem('workspaceType', 'Personal');
       localStorage.setItem('isAdmin', response.data.isAdmin);
        alert("تم تسجيل الدخول بنجاح!");
        navigate('/home');
      } 
      
      else {
        await axios.post('/api/Auth/register', {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password
        });

        alert("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
        setIsLogin(true);
      }
    } catch (error) {

      const errorMsg = error.response?.data?.message || "حدث خطأ في الاتصال بالسيرفر";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 transition-all duration-500">
        
        {showForgotPassword ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Forgot Password?</h2>
              <p className="text-sm text-gray-500">No worries, we'll send you reset instructions.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email"
                  placeholder="Enter your email" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
              </div>

              <button 
                disabled={loading}
                type="submit" 
                className="w-full cursor-pointer bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setShowForgotPassword(false)}
                className="text-sm font-medium text-sky-500 hover:text-sky-600 flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {isLogin ? "Welcome Back" : "Create your Account"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isLogin ? "Please enter your details to sign in." : "Start by creating a new account."}
              </p>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button 
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-[#0ea5e9] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Log In
              </button>
              <button 
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-[#0ea5e9] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Sign Up
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                    <input 
                      type="text"
                      placeholder="First Name" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                      {...register("firstName", { required: !isLogin })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
                    <input 
                      type="text"
                      placeholder="Last Name" 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                      {...register("lastName", { required: !isLogin })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email"
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
              </div>

              <div>
                <div className="flex justify-between">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-sky-500 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your password" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    {...register("password", { 
                      required: "Password is required", 
                      minLength: { value: 6, message: "Min 6 characters" } 
                    })}
                  />
                  {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <input 
                    type="password"
                    placeholder="Confirm password" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    {...register("confirmPassword", { 
                        required: !isLogin,
                        validate: (value) => value === watch('password') || "Passwords do not match"
                    })}
                  />
                  {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
                </div>
              )}

              <button 
                disabled={loading}
                type="submit" 
                className="w-full cursor-pointer bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
                {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
              </button>
            </form>

           
           
          </>
        )}
      </div>
    </div>
  );
}