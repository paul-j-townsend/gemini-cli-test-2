import React from 'react';
import Image from 'next/image';
import DownloadButton from './DownloadButton';
import { supabase } from '@/lib/supabase';
import { useUserContentProgress } from '../hooks/useUserContentProgress';

interface PurchasedContent {
  id: string;
  title: string;
  thumbnail_url?: string;
  purchased_at: string;
}

interface PurchasedContentCardProps {
  content: PurchasedContent;
  onDownloadReport: () => Promise<void>;
  onDownloadPodcast: () => Promise<void>;
  onDownloadCertificate: () => Promise<void>;
}

const PurchasedContentCard: React.FC<PurchasedContentCardProps> = ({
  content,
  onDownloadReport,
  onDownloadPodcast,
  onDownloadCertificate
}) => {
  const { 
    hasListened, 
    quizCompleted, 
    reportDownloaded, 
    certificateDownloaded,
    loading 
  } = useUserContentProgress(content.id);

  const isCompleted = hasListened && quizCompleted && reportDownloaded;

  const getDefaultThumbnailUrl = (): string => {
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl('placeholder-episode.jpg');
    return data.publicUrl;
  };

  const formatPurchaseDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-emerald-200 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div className="flex-grow">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-emerald-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Image
            src={content.thumbnail_url || getDefaultThumbnailUrl()}
            alt={content.title}
            width={80}
            height={80}
            className="rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.src = getDefaultThumbnailUrl();
            }}
          />
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-semibold text-emerald-900 mb-2 truncate">
            {content.title}
          </h3>
          
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-emerald-600">
              Purchased {formatPurchaseDate(content.purchased_at)}
            </span>
            
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              isCompleted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isCompleted ? 'Complete' : 'Not Complete'}
            </span>
          </div>

          {/* Progress indicators for individual parts */}
          <div className="flex items-center gap-4 mb-4 text-xs">
            <div className={`flex items-center gap-1 ${hasListened ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${hasListened ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              Podcast
            </div>
            <div className={`flex items-center gap-1 ${reportDownloaded ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${reportDownloaded ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              Report
            </div>
            <div className={`flex items-center gap-1 ${quizCompleted ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${quizCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              Quiz
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <DownloadButton
              onClick={onDownloadReport}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              Download Report
            </DownloadButton>
            
            <DownloadButton
              onClick={onDownloadPodcast}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a1 1 0 112 0v4a1 1 0 11-2 0v-4zm-2 0a3 3 0 116 0v4a3 3 0 11-6 0v-4z" />
                </svg>
              }
            >
              Download Podcast
            </DownloadButton>
            
            <DownloadButton
              onClick={onDownloadCertificate}
              disabled={!isCompleted}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
            >
              Download Certificate
            </DownloadButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasedContentCard;