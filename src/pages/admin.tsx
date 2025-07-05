import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ArticlesManagement from '../components/admin/ArticlesManagement';
import PodcastManagement from '../components/admin/PodcastManagement';
import QuizManagement from '../components/admin/QuizManagement';
import { UserSwitcher } from '../components/UserSwitcher';
import { UserProgressDashboard } from '../components/UserProgressDashboard';
import UserManagement from '../pages/user-management';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('podcasts');

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
                onClick={() => setActiveTab('podcasts')}
                className={`${
                  activeTab === 'podcasts'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Podcast Management
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
                onClick={() => setActiveTab('quizzes')}
                className={`${
                  activeTab === 'quizzes'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Quiz Management
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
            </nav>
          </div>
          <div className="pt-10">
            {activeTab === 'podcasts' && <PodcastManagement />}
            {activeTab === 'articles' && <ArticlesManagement />}
            {activeTab === 'quizzes' && <QuizManagement />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'progress' && <UserProgressDashboard />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;