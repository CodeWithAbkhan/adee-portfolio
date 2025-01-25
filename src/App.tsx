import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Community from './pages/Community';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import SignIn from './pages/SignIn';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { Bell } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchNotifications(session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        fetchNotifications(session.user.id);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      const notificationsSubscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`,
        }, () => {
          fetchNotifications(session.user.id);
        })
        .subscribe();

      return () => {
        notificationsSubscription.unsubscribe();
      };
    }
  }, [session]);

  const fetchNotifications = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      await fetchNotifications(session.user.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-2xl font-thin text-gray-900">
                Adnan Azeem
              </Link>
              {session && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 hover:bg-gray-100 rounded-full relative"
                  >
                    <Bell className="h-6 w-6 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                                !notification.is_read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
        
    {/* Footer with elegant navigation */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            {/* Navigation Section */}
            <nav className="space-x-8 text-sm font-light text-gray-300 mb-4">
              <Link to="/" className="hover:text-white transition">Home</Link>
              <Link to="/about" className="hover:text-white transition">About</Link>
              <Link to="/courses" className="hover:text-white transition">Courses</Link>
              <Link to="/community" className="hover:text-white transition">Community</Link>
              <Link to="/profile" className="hover:text-white transition">Profile</Link>
              <Link to="/signin" className="hover:text-white transition">Sign In</Link>
            </nav>

            {/* Horizontal Divider */}
            <hr className="border-gray-700 mb-6" />

            {/* Copyright Section */}
            <p className="text-gray-400 text-xs mt-4">© 2024 adnanazeem.com. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;