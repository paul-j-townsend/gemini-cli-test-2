import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ArticlesManagement from '../components/admin/ArticlesManagement';
import ContentManagement from '../components/admin/ContentManagement';
import SeriesManagement from '../components/admin/SeriesManagement';
import { UserSwitcher } from '../components/UserSwitcher';
import { UserProgressDashboard } from '../components/UserProgressDashboard';
import UserManagement from '../pages/user-management';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <Layout>
      <Head>
        <title>Admin Dashboard - Vet Sidekick</title>
        <meta name="description" content="Admin dashboard for managing content" />
      </Head>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 sm:mb-6 lg:mb-8">Admin Dashboard</h1>
          <UserSwitcher />
        </div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('content')}
                className={`${
                  activeTab === 'content'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0`}
              >
                <span className="hidden sm:inline">Content Management</span>
                <span className="sm:hidden">Content</span>
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`${
                  activeTab === 'articles'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0`}
              >
                <span className="hidden sm:inline">Articles Management</span>
                <span className="sm:hidden">Articles</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0`}
              >
                <span className="hidden sm:inline">User Management</span>
                <span className="sm:hidden">Users</span>
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`${
                  activeTab === 'progress'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0`}
              >
                <span className="hidden sm:inline">User Progress</span>
                <span className="sm:hidden">Progress</span>
              </button>
              <button
                onClick={() => setActiveTab('series')}
                className={`${
                  activeTab === 'series'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0`}
              >
                <span className="hidden sm:inline">Series Management</span>
                <span className="sm:hidden">Series</span>
              </button>
            </nav>
          </div>
        <div className="pt-6 sm:pt-8 lg:pt-10">
          {activeTab === 'content' && <ContentManagement />}
          {activeTab === 'articles' && <ArticlesManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'progress' && <UserProgressDashboard />}
          {activeTab === 'series' && <SeriesManagement />}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;