import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Layout() {
  const location = useLocation();

  const isAuthPage = location.pathname === '/' || location.pathname === '/signup';

  return (
    <div className="flex min-h-screen bg-gray-50">

      {!isAuthPage && <Sidebar />}

      <main 
        className={`flex-1 p-6 md:p-10 transition-all duration-300 ${
          !isAuthPage ? 'md:ml-64' : '' 
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}