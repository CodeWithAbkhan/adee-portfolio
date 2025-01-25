import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Upload, Check, Loader } from 'lucide-react';

function Profile() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [nicImage, setNicImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    mobile: '',
    portfolio_link: '',
    country: ''
  });

  useEffect(() => {
    const setupProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/signin');
        return;
      }
      
      setSession(session);
      await fetchProfile(session.user.id);
    };

    setupProfile();
  }, [navigate]);

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (!existingProfile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            username: session.user.email?.split('@')[0] || 'user',
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
        setFormData({
          username: newProfile.username || '',
          mobile: newProfile.mobile || '',
          portfolio_link: newProfile.portfolio_link || '',
          country: newProfile.country || ''
        });
      } else {
        setProfile(existingProfile);
        setFormData({
          username: existingProfile.username || '',
          mobile: existingProfile.mobile || '',
          portfolio_link: existingProfile.portfolio_link || '',
          country: existingProfile.country || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Error loading profile. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setAvatar(file);
  };

  const handleNicUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setNicImage(file);
  };

  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `public/${Math.random()}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        onUploadProgress: (progress) => {
          const percentage = (progress.loaded / progress.total) * 100;
          setUploadProgress(Math.round(percentage));
        },
      });

    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      let updates = {
        ...formData,
        id: session.user.id,
        updated_at: new Date().toISOString()
      };

      if (avatar) {
        const avatarPath = await uploadFile(avatar, 'avatars');
        updates.avatar_url = avatarPath;
      }

      if (nicImage) {
        const nicPath = await uploadFile(nicImage, 'verification');
        updates.nic_image_url = nicPath;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      alert('Profile updated successfully!');
      await fetchProfile(session.user.id);
      
      setAvatar(null);
      setNicImage(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (!profile?.avatar_url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'User')}&background=random`;
    }
    return supabase.storage
      .from('avatars')
      .getPublicUrl(profile.avatar_url)
      .data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <Upload className="h-5 w-5 mr-2" />
                  Change Avatar
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Portfolio Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio Link
              </label>
              <input
                type="url"
                value={formData.portfolio_link}
                onChange={(e) => setFormData({ ...formData, portfolio_link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* NIC Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Upload (your image with holding ID card ) for Verification (Optional)
              </label>
              {profile?.nic_image_url && (
                <div className="mb-2">
                  <img
                    src={supabase.storage
                      .from('verification')
                      .getPublicUrl(profile.nic_image_url)
                      .data.publicUrl}
                    alt="Verification Document"
                    className="max-h-40 rounded-lg"
                  />
                </div>
              )}
              <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <Upload className="h-5 w-5 mr-2" />
                Upload Document
                <input
                  type="file"
                  className="hidden"
                  onChange={handleNicUpload}
                  accept="image/*"
                />
              </label>
            </div>

            {/* Verification Status */}
            {profile?.is_verified && (
              <div className="flex items-center text-green-600">
                <Check className="w-5 h-5 mr-2" />
                <span className="font-medium">Verified</span>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </div>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;