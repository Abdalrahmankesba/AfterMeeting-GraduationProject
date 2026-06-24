// import React from 'react';

// // أيقونة العين لإخفاء/إظهار كلمة المرور
// const EyeSlashIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
//   </svg>
// );

// export default function Login() {
//   return (
//     <div className="min-h-screen bg-[#F8FBFB] flex items-center justify-center p-6 font-sans">
//       <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 w-full max-w-[480px]">
        
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
//           <p className="text-gray-500 text-sm">Please enter your details to sign in.</p>
//         </div>


//         <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
//           <button type="button" className="flex-1 py-2.5 text-sm font-semibold text-slate-800 bg-white rounded-xl shadow-sm">Log In</button>
//           <button type="button" className="flex-1 py-2.5 text-sm font-semibold text-gray-500 rounded-xl hover:text-gray-700 transition-all">Sign Up</button>
//         </div>

//         <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
//             <input 
//               type="email" 
//               placeholder="Enter your email" 
//               className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#A5BEB6] focus:ring-4 focus:ring-[#A5BEB6]/10 outline-none transition-all placeholder:text-gray-300"
//               required
//             />
//           </div>

//           <div>
//             <div className="flex justify-between items-center mb-2">
//               <label className="text-sm font-bold text-slate-700">Password</label>
//               <a href="#" className="text-sm font-semibold text-[#A5BEB6] hover:text-[#8ea69e]">Forgot Password?</a>
//             </div>
//             <div className="relative">
//               <input 
//                 type="password" 
//                 placeholder="Enter your password" 
//                 className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#A5BEB6] focus:ring-4 focus:ring-[#A5BEB6]/10 outline-none transition-all placeholder:text-gray-300"
//                 required
//               />
//               <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2">
//                 <EyeSlashIcon />
//               </button>
//             </div>
//           </div>

//           <button type="submit" className="w-full bg-red-500 hover:bg-[#94aba3] text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98]">
//             Log In
//           </button>
//         </form>


//         <div className="relative my-10">
//           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
//           <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-400 font-bold tracking-widest">OR</span></div>
//         </div>


//         <div className="space-y-4">
//           <button type="button" className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all font-semibold text-slate-700 text-sm">
//             <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
//             Continue with Google
//           </button>
//           <button type="button" className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all font-semibold text-slate-700 text-sm">
//             <img src="src/assets/images/images.png" className="w-5 h-5" alt="Microsoft" />

//             Continue with Microsoft
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }