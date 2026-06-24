import { useForm } from "react-hook-form";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  
  // سحب البيانات التي تم حفظها في الخطوات السابقة
  const email = localStorage.getItem("resetEmail");
  const token = localStorage.getItem("resetToken");

  const onSubmit = async (data) => {
    try {
      await axios.post("/api/Auth/reset-password", {
        email: email,
        otp: token, // الـ OTP الذي أدخله المستخدم في الصفحة السابقة
        newPassword: data.newPassword
      });

      alert("Password Reset Successfully!");
      // مسح البيانات المؤقتة
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetToken");
      navigate("/"); // العودة للوجن
    } catch (error) {
      alert(error.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">New Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input
              type="password" placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-sky-100"
              {...register("newPassword", { required: "Required", minLength: 6 })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm New Password</label>
            <input
              type="password" placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-sky-100"
              {...register("confirmPassword", {
                validate: (value) => value === watch("newPassword") || "Passwords do not match"
              })}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" className="w-full bg-[#0ea5e9] text-white py-3 rounded-xl font-bold shadow-lg">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}