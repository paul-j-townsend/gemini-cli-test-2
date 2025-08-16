import React from 'react';
import Head from 'next/head';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import Layout from '@/components/Layout';

const MyProfile: React.FC = () => {
  const { user } = useUser();

  return (
    <Layout>
      <Head>
        <title>My Profile - VetSidekick</title>
        <meta name="description" content="Manage your VetSidekick profile and account settings" />
      </Head>

      <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">My Profile</h1>
              <p className="text-neutral-600 text-sm sm:text-base">Manage your account information and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 sm:w-8 sm:w-8 text-white" />
                  </div>
                  <div className="text-white text-center sm:text-left flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-semibold truncate">{user?.name || 'Guest User'}</h2>
                    <p className="text-emerald-100 text-sm sm:text-base truncate">{user?.email || 'No email available'}</p>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-4 sm:p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Account Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-4">Account Information</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                        <Mail size={20} className="text-emerald-500" />
                        <div>
                          <p className="text-sm text-emerald-500">Email</p>
                          <p className="font-medium text-emerald-900">{user?.email || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                        <Calendar size={20} className="text-emerald-500" />
                        <div>
                          <p className="text-sm text-emerald-500">Member Since</p>
                          <p className="font-medium text-emerald-900">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                        <Shield size={20} className="text-emerald-500" />
                        <div>
                          <p className="text-sm text-emerald-500">Account Type</p>
                          <p className="font-medium text-emerald-900 capitalize">{user?.role || 'User'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-4">Profile Settings</h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 border border-emerald-200 rounded-lg">
                        <h4 className="font-medium text-emerald-900 mb-2">Email Notifications</h4>
                        <p className="text-sm text-emerald-600 mb-3">Receive updates about new content and courses</p>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                          Configure Notifications
                        </button>
                      </div>

                      <div className="p-4 border border-emerald-200 rounded-lg">
                        <h4 className="font-medium text-emerald-900 mb-2">Privacy Settings</h4>
                        <p className="text-sm text-emerald-600 mb-3">Manage your privacy and data preferences</p>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                          Privacy Settings
                        </button>
                      </div>

                      <div className="p-4 border border-emerald-200 rounded-lg">
                        <h4 className="font-medium text-emerald-900 mb-2">Account Security</h4>
                        <p className="text-sm text-emerald-600 mb-3">Update password and security settings</p>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-emerald-800 font-medium">Coming Soon</p>
                  </div>
                  <p className="text-emerald-700 text-sm mt-1">
                    Full profile editing, avatar uploads, and advanced settings are currently in development.
                  </p>
                </div>
              </div>
            </div>
          </div>
    </Layout>
  );
};

export default MyProfile;