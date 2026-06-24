import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import LandingPage from './Pages/LandingPage'; 
import Layout from './Pages/Layout';
import Home from './Pages/Home';
import Meeting from './Pages/Meeting';
import Tasks from './Pages/Tasks';
import Admindashboard from './Pages/Admindashboard';
import Setting from './Pages/Setting';
import NotFound from './Pages/NotFound';
import AuthPage from './Pages/AuthPage';
import MeetingDetails from './Pages/MeetingDetails';
import TopResults from './Pages/TopResults';
import VerifyOtp from './Pages/VerifyOtp';
import ResetPassword from './Pages/ResetPassword';
import SearchPage from './Pages/SearchPage';

function App() {
  const routes = createBrowserRouter([
    {
      path: '/',
      element: <LandingPage />
    },
    
    {
      path: '/auth',
      element: <AuthPage />
    },
    {
      path: '/verify-otp',
      element: <VerifyOtp />
    },
    {
      path: '/reset-password',
      element: <ResetPassword />
    },
    
    {
      element: <Layout />, 
      children: [
        { path: '/home', element: <Home /> },
        { path: '/meeting', element: <Meeting /> },
        { path: '/meeting-details', element: <MeetingDetails /> },
        { path: '/tasks', element: <Tasks /> },
        { path: '/search', element: <SearchPage /> },
        { path: '/admin-dashboard', element: <Admindashboard /> },
        { path: '/settings', element: <Setting /> },
        { path: '/top-results', element: <TopResults /> },
        { path: '*', element: <NotFound /> },
      ]
    }
  ]);

  return <RouterProvider router={routes} />;
}

export default App;