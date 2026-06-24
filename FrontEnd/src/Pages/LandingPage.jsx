import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <div className="bg-slate-50 text-slate-700 antialiased selection:bg-teal-200 selection:text-gray-800 font-sans overflow-x-hidden relative">
      
      {/* 🌟 Background Blobs for Liveliness 🌟 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-sky-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-white/70 border-b border-gray-100/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-300 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl hover:rotate-12 transition-transform duration-300 shadow-md">
              <i className="fa-solid fa-microphone-lines text-white"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">After Meeting</span>
          </div>
          <div className="hidden md:flex space-x-8 font-medium text-slate-500">
            <a href="#features" className="hover:text-teal-500 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-teal-500 transition-colors">How it Works</a>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/auth', { state: { mode: 'login' } })} className="hidden md:block font-medium text-slate-600 hover:text-teal-600 transition-colors">
              Log in
            </button>
            <button onClick={() => navigate('/auth', { state: { mode: 'register' } })} className="bg-teal-400 hover:bg-teal-500 hover:scale-105 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-teal-500/30">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-40 pb-24 text-center relative z-10">
        <div data-aos="fade-down" data-aos-duration="1000">
          <span className="bg-white/80 backdrop-blur-sm border border-teal-200/50 text-teal-700 px-5 py-2 rounded-full text-sm font-semibold mb-8 inline-flex items-center gap-2 shadow-sm hover:scale-105 transition-transform cursor-default">
            <i className="fa-solid fa-sparkles text-amber-400"></i> The Future of Meeting Management
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-slate-800 tracking-tight" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
          Turn Conversations into <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-500 drop-shadow-sm">
            Actionable Intelligence
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
          Upload your meeting transcripts. Let our advanced AI generate perfect summaries, extract assigned tasks, and organize everything automatically.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="300">
          <button onClick={() => navigate('/auth', { state: { mode: 'register' } })} className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-2 group">
            Start Free Trial <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>

        {/* Dashboard Image Preview */}
        <div className="mt-20 relative max-w-5xl mx-auto" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="400">
          {/* Subtle Glow Behind Image */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-300/20 to-transparent blur-3xl -z-10 rounded-full"></div>
          
          {/* Smooth floating effect without aggressive bouncing */}
          <div className="relative bg-white border border-slate-100 rounded-3xl p-2 shadow-2xl shadow-slate-200/50 overflow-hidden backdrop-blur-sm transition-transform duration-700 hover:-translate-y-2">
             <div className="w-full h-10 bg-slate-50/80 border-b border-slate-100 flex items-center px-4 gap-2 rounded-t-2xl">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             {/* حط مسار صورة الداشبورد بتاعتك هنا */}
             <img src="/src/assets/images/land.png" alt="Dashboard" className="rounded-b-2xl opacity-95 hover:opacity-100 transition-opacity duration-500 w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Run Better Meetings</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-teal-300 to-sky-300 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">Stop wasting time writing minutes. Focus on the conversation, and let our system handle the documentation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:-translate-y-3 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 group" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 text-2xl mb-6 group-hover:scale-110 group-hover:bg-teal-400 group-hover:text-white transition-all duration-300">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">AI Summarization</h3>
              <p className="text-slate-500 leading-relaxed">Get the core insights of any meeting in seconds. Our AI reads through the transcript and creates clean, structured summaries automatically.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:-translate-y-3 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 group" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 text-2xl mb-6 group-hover:scale-110 group-hover:bg-sky-400 group-hover:text-white transition-all duration-300">
                <i className="fa-solid fa-list-check"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Task Extraction</h3>
              <p className="text-slate-500 leading-relaxed">Never miss an action item again. The system identifies who needs to do what and generates a clear to-do list from the conversation.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:-translate-y-3 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 group" data-aos="fade-up" data-aos-delay="300">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 text-2xl mb-6 group-hover:scale-110 group-hover:bg-teal-400 group-hover:text-white transition-all duration-300">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Smart Workspaces</h3>
              <p className="text-slate-500 leading-relaxed">Keep personal notes separate. Organize your data cleanly with role-based visibility and dedicated team workspaces.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-slate-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <i className="fa-solid fa-microphone-lines text-teal-400 text-lg"></i>
             <span className="font-bold text-slate-700 text-base">After Meeting</span>
          </div>
          <span className="font-medium text-slate-400">&copy; 2026 All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}