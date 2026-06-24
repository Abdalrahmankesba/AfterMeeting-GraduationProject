// import React from 'react';

// const EyeSlashIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
//   </svg>
// );

// export default function Signup() {
//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        
//         <div className="text-center mb-6">
//           <h2 className="text-2xl font-bold text-slate-800">Create your Account</h2>
//           <p className="text-sm text-gray-500 mt-1">Start by creating a new account.</p>
//         </div>


//         <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
//           <button type="button" className="flex-1 py-2 text-sm font-medium text-gray-600 rounded-lg">Log In</button>
//           <button type="button" className="flex-1 py-2 text-sm font-medium text-white bg-[#0ea5e9] rounded-lg shadow-sm">Sign Up</button>
//         </div>

//         <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
//               <input type="text" placeholder="John" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-gray-300" />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
//               <input type="text" placeholder="Doe" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-gray-300" />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
//             <input type="email" placeholder="Enter your email" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all" />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
//             <div className="relative">
//               <input type="password" placeholder="Enter your password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all" />
//               <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
//                 <EyeSlashIcon />
//               </button>
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
//             <div className="relative">
//               <input type="password" placeholder="Confirm your password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all" />
//               <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
//                 <EyeSlashIcon />
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 py-2">
//             <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500 cursor-pointer" />
//             <span className="text-xs text-gray-600">
//               I agree to the <a href="#" className="text-sky-500 font-medium hover:underline">Terms and Conditions</a> and <a href="#" className="text-sky-500 font-medium hover:underline">Privacy Policy</a>
//             </span>
//           </div>

//           <button type="submit" className="w-full bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-sky-100">
//             Create Account
//           </button>
//         </form>

//         <div className="relative my-8 text-center">
//           <hr className="border-gray-200" />
//           <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-xs text-gray-400 font-medium">OR</span>
//         </div>

//         <div className="space-y-3">
//           <button type="button" className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold text-slate-700">
//             <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
//             Continue with Google
//           </button>
//           <button type="button" className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold text-slate-700">
//             <img src="https://www.svgrepo.com/show/354067/microsoft-icon.svg" className="w-5 h-5" alt="Microsoft" />
//             Continue with Microsoft
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }