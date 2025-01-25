import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader, Send } from 'lucide-react';

function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingNotification, setSendingNotification] = useState(false);
  const navigate = useNavigate();

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    selectedUsers: [],
    notificationType: 'selected' // 'all', 'verified', 'selected'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/signin');
      } else {
        checkAdminStatus(session.user.id);
      }
    });
  }, [navigate]);

  const checkAdminStatus = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error || !data?.is_admin) {
      navigate('/');
    } else {
      fetchUsers();
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      alert('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', userId);

      if (error) throw error;
      
      // Send verification notification
      await sendNotification({
        userId,
        title: 'Account Verified',
        message: 'Congratulations! Your account has been verified.'
      });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_verified: true } : user
      ));
    } catch (error) {
      alert('Error verifying user');
    }
  };

  const sendNotification = async ({ userId, title, message }) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title,
          message
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSendingNotification(true);

    try {
      let targetUsers = [];

      switch (notificationForm.notificationType) {
        case 'all':
          targetUsers = users;
          break;
        case 'verified':
          targetUsers = users.filter(user => user.is_verified);
          break;
        case 'selected':
          targetUsers = users.filter(user => notificationForm.selectedUsers.includes(user.id));
          break;
      }

      for (const user of targetUsers) {
        await sendNotification({
          userId: user.id,
          title: notificationForm.title,
          message: notificationForm.message
        });
      }

      setNotificationForm({
        title: '',
        message: '',
        selectedUsers: [],
        notificationType: 'selected'
      });

      alert('Notifications sent successfully!');
    } catch (error) {
      alert('Error sending notifications');
    } finally {
      setSendingNotification(false);
    }
  };

  const getAvatarUrl = (user) => {
    if (!user?.avatar_url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`;
    }
    return supabase.storage
      .from('avatars')
      .getPublicUrl(user.avatar_url)
      .data.publicUrl;
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Notification Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Send Notifications</h2>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Type
              </label>
              <select
                value={notificationForm.notificationType}
                onChange={(e) => setNotificationForm({
                  ...notificationForm,
                  notificationType: e.target.value,
                  selectedUsers: []
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="selected">Selected Users</option>
                <option value="all">All Users</option>
                <option value="verified">Verified Users Only</option>
              </select>
            </div>

            {notificationForm.notificationType === 'selected' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={notificationForm.selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          const updatedUsers = e.target.checked
                            ? [...notificationForm.selectedUsers, user.id]
                            : notificationForm.selectedUsers.filter(id => id !== user.id);
                          setNotificationForm({
                            ...notificationForm,
                            selectedUsers: updatedUsers
                          });
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span>{user.username}</span>
                      {user.is_verified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({
                  ...notificationForm,
                  title: e.target.value
                })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({
                  ...notificationForm,
                  message: e.target.value
                })}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={sendingNotification || 
                (notificationForm.notificationType === 'selected' && 
                notificationForm.selectedUsers.length === 0)}
              className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {sendingNotification ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Notification
                </>
              )}
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={getAvatarUrl(user)}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.mobile || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.country || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_verified ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!user.is_verified && (
                      <button
                        onClick={() => handleVerify(user.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => window.open(`${supabase.storage.from('verification').getPublicUrl(user.nic_image_url).data.publicUrl}`, '_blank')}
                      className="text-gray-600 hover:text-gray-900"
                      disabled={!user.nic_image_url}
                    >
                      View NIC
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;