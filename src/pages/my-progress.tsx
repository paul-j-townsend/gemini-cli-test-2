import React from 'react';
import Head from 'next/head';
import { UserProgressDashboard } from '../components/UserProgressDashboard';
import { useAuth } from '../hooks/useAuth';
import Layout from '@/components/Layout';

const MyProgress: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Layout>
        <Head>
          <title>My Progress - VetSidekick</title>
          <meta name="description" content="Track your CPD progress and learning achievements" />
        </Head>
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-emerald-200">
            <h1 className="text-2xl font-bold text-emerald-900 mb-4">My Learning Progress</h1>
            <p className="text-emerald-700">Please log in to view your progress.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>My Progress - VetSidekick</title>
        <meta name="description" content="Track your CPD progress and learning achievements" />
      </Head>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <UserProgressDashboard />
      </div>
    </Layout>
  );
};

export default MyProgress;