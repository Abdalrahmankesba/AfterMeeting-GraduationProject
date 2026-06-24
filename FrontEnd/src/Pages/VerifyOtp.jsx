import React from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import axios from "../api/axiosInstance";

export default function VerifyOtp() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const email = localStorage.getItem('resetEmail');

  const onVerify = async (data) => {
    try {
      await axios.post('/api/Auth/verify-otp', {
        email: email,
        otp: data.otp
      });
      // حفظ الـ OTP لاستخدامه كـ Token في الصفحة التالية
      localStorage.setItem('resetToken', data.otp);
      alert("تم التأكد من الكود بنجاح");
      navigate('/reset-password'); 
    } catch (error) {
      alert("الكود غير صحيح أو انتهت صلاحيته");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
        <p className="text-sm text-gray-500 mb-6">Enter the code sent to {email}</p>
        <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
          <input 
            type="text" placeholder="6-digit code"
            className="w-full px-4 py-3 rounded-xl border text-center text-xl tracking-widest outline-none focus:ring-2 focus:ring-sky-100"
            {...register("otp", { required: true })}
          />
          <button type="submit" className="w-full bg-[#0ea5e9] text-white py-3 rounded-xl font-bold">Verify Code</button>
        </form>
      </div>
    </div>
  );
}