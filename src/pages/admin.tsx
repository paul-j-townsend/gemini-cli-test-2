import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ArticlesManagement from '../components/admin/ArticlesManagement';
import ContentManagement from '../components/admin/ContentManagement';
import SeriesManagement from '../components/admin/SeriesManagement';
import MigrationRunner from '../components/admin/MigrationRunner';
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
      <div className="container-wide py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-900 mb-8">Admin Dashboard</h1>
          <UserSwitcher />
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('content')}
                className={`${
                  activeTab === 'content'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Content Management
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`${
                  activeTab === 'articles'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Articles Management
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`${
                  activeTab === 'progress'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                User Progress
              </button>
              <button
                onClick={() => setActiveTab('series')}
                className={`${
                  activeTab === 'series'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Series Management
              </button>
              <button
                onClick={() => setActiveTab('migration')}
                className={`${
                  activeTab === 'migration'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Migration
              </button>
            </nav>
          </div>
          <div className="pt-10">
            {activeTab === 'content' && <ContentManagement />}
            {activeTab === 'articles' && <ArticlesManagement />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'progress' && <UserProgressDashboard />}
            {activeTab === 'series' && <SeriesManagement />}
            {activeTab === 'migration' && <MigrationRunner />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;