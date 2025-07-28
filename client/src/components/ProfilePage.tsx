import React, { useState } from 'react';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  AtSign, 
  Mail, 
  Calendar,
  Trophy,
  DollarSign,
  Settings,
  ChevronLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import type { UpdateUserProfile, UserStats } from '@shared/schema';

interface ProfilePageProps {
  setCurrentPage: (page: 'home' | 'dashboard' | 'tasks' | 'games' | 'profile') => void;
}

interface ProfileFormData {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ setCurrentPage }) => {
  const { user, logout } = useAuth();
  const { profile, loading } = useUserProfile(user);
  
  // Get user stats separately
  const { data: userStats } = useQuery({
    queryKey: ['/api/stats'],
    enabled: !!user,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProfileFormData>({
    username: user?.username || '',
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: UpdateUserProfile) => {
      return await apiRequest('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update profile');
      setSuccess('');
    },
  });

  const handleEdit = () => {
    setFormData({
      username: user?.username || '',
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    const updates: UpdateUserProfile = {
      username: formData.username.trim(),
      displayName: formData.displayName.trim() || formData.username.trim(),
      bio: formData.bio.trim(),
      avatar: formData.avatar.trim()
    };

    updateProfileMutation.mutate(updates);
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    
    // Handle different avatar types
    if (avatar.startsWith('http')) {
      return avatar;
    }
    
    // Generate avatar from initials or username
    const initials = (user?.displayName || user?.username || user?.email?.split('@')[0] || 'U')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8b5cf6&color=fff&size=200`;
  };

  const renderAvatar = () => {
    const avatarUrl = getAvatarUrl(user?.avatar);
    const initials = (user?.displayName || user?.username || user?.email?.split('@')[0] || 'U')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="relative">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                ((e.currentTarget.nextElementSibling as HTMLElement)).style.display = 'flex';
              }}
            />
          ) : (
            <span className="text-white text-2xl md:text-3xl font-bold">
              {initials}
            </span>
          )}
          <div className="hidden w-full h-full items-center justify-center text-white text-2xl md:text-3xl font-bold">
            {initials}
          </div>
        </div>
        {isEditing && (
          <button className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors">
            <Camera className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center text-gray-600 hover:text-purple-600 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={logout}
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {renderAvatar()}
              
              <div className="flex-1 text-center md:text-left text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      {user?.displayName || user?.username || 'New User'}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start space-x-2 text-purple-100 mb-2">
                      <AtSign className="h-4 w-4" />
                      <span>{user?.username || 'No username set'}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start space-x-2 text-purple-100">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all flex items-center space-x-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={updateProfileMutation.isPending}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {user?.bio && (
                  <p className="mt-4 text-purple-100 max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-2 text-green-800">
            <Check className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Edit Form / Stats */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Edit Profile
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your username"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Username must be at least 3 characters and contain only letters, numbers, underscores, and hyphens.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => handleInputChange('avatar', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank to use an auto-generated avatar based on your initials.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Your Stats
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                    <div className="text-2xl font-bold mb-1">
                      {(profile as any)?.dulpBalance?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm opacity-90">DULP Balance</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                    <div className="text-2xl font-bold mb-1">
                      {(userStats as any)?.level || 1}
                    </div>
                    <div className="text-sm opacity-90">Level</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                    <div className="text-2xl font-bold mb-1">
                      {(userStats as any)?.xp || 0}
                    </div>
                    <div className="text-sm opacity-90">XP</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
                    <div className="text-2xl font-bold mb-1">
                      {(userStats as any)?.tasksCompleted || 0}
                    </div>
                    <div className="text-sm opacity-90">Tasks Done</div>
                  </div>
                </div>

                {user?.bio && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">About</h3>
                    <p className="text-gray-700">{user.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Member Since</div>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2" />
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Total Earned</div>
                  <div className="flex items-center text-gray-900">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {(profile as any)?.totalEarned?.toLocaleString() || '0'} DULP
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Referral Code</div>
                  <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                    {(profile as any)?.referralCode || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Referrals</div>
                  <div className="text-gray-900">
                    {(profile as any)?.referralCount || 0} people referred
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};